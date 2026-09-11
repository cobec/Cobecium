import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const SEED_USERS = [
  { externalId: "seed_user_alice", name: "Alice Chen", email: "alice@example.com" },
  { externalId: "seed_user_bob", name: "Bob Martinez", email: "bob@example.com" },
  { externalId: "seed_user_carol", name: "Carol Williams", email: "carol@example.com" },
];

const FEEDBACK_ITEMS: Array<{
  title: string;
  description: string;
  board: "feature_request" | "bug_report";
  status: "gathering_interest" | "planned" | "in_progress" | "complete" | "closed";
  voteScore: number;
  commentCount: number;
  createdByIndex: number;
  createdAtOffsetDays: number;
  adminNotes?: string;
}> = [
  {
    title: "Bulk export procurement links to CSV",
    description:
      "Allow users to export the current filtered list of procurement links to a CSV file for use in spreadsheets or other tools. Include state, city, official_website, and procurement_link columns.",
    board: "feature_request",
    status: "in_progress",
    voteScore: 12,
    commentCount: 4,
    createdByIndex: 0,
    createdAtOffsetDays: 14,
    adminNotes: "Backlog Q2 – dev assigned",
  },
  {
    title: "Search results sometimes empty after filter change",
    description:
      "When I change the state filter and then type in the search box, the results list goes empty even though there are matching links. Refreshing the page fixes it. Happens in Chrome and Firefox.",
    board: "bug_report",
    status: "planned",
    voteScore: 8,
    commentCount: 2,
    createdByIndex: 1,
    createdAtOffsetDays: 10,
  },
  {
    title: "Dark mode / theme toggle",
    description:
      "Add a dark mode option (or system preference detection) so we can use Lynx in low-light environments without straining our eyes. A toggle in the header would be ideal.",
    board: "feature_request",
    status: "gathering_interest",
    voteScore: 24,
    commentCount: 9,
    createdByIndex: 2,
    createdAtOffsetDays: 7,
  },
  {
    title: "Email notifications for new procurement postings",
    description:
      "Notify me by email when new procurement opportunities are added for a state or city I care about. Optional digest (daily/weekly) would be great.",
    board: "feature_request",
    status: "gathering_interest",
    voteScore: 18,
    commentCount: 5,
    createdByIndex: 0,
    createdAtOffsetDays: 5,
  },
  {
    title: "Procurement link opens 404 on mobile",
    description:
      "The Raleigh procurement link from the list returns a 404 when opened on my phone. Same link works on desktop. Might be a redirect or user-agent issue on their side – worth documenting.",
    board: "bug_report",
    status: "closed",
    voteScore: 2,
    commentCount: 1,
    createdByIndex: 1,
    createdAtOffsetDays: 21,
    adminNotes: "Known external issue – added to FAQ",
  },
  {
    title: "Keyboard shortcuts for power users",
    description:
      "Add keyboard shortcuts: e.g. / to focus search, Esc to clear filters, J/K to move between rows (vim-style). Would speed up researchers who live in the list view.",
    board: "feature_request",
    status: "gathering_interest",
    voteScore: 6,
    commentCount: 3,
    createdByIndex: 2,
    createdAtOffsetDays: 3,
  },
  {
    title: "Feedback board: sort by “Most discussed”",
    description:
      "On the feedback list, add a sort option for “Most discussed” (by comment count) so we can see which ideas are generating the most conversation, not just votes.",
    board: "feature_request",
    status: "gathering_interest",
    voteScore: 5,
    commentCount: 2,
    createdByIndex: 0,
    createdAtOffsetDays: 1,
  },
  {
    title: "Session timeout too short",
    description:
      "I get logged out after about 10 minutes of inactivity. When I’m researching across multiple tabs, I often come back to a session expired message. Can we extend the timeout or add a “remember me” option?",
    board: "bug_report",
    status: "gathering_interest",
    voteScore: 4,
    commentCount: 2,
    createdByIndex: 1,
    createdAtOffsetDays: 2,
  },
];

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("feedback").first();
    if (existing) {
      return { seeded: false, message: "Feedback already has data; skip seeding to avoid duplicates." };
    }

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const feedbackIds: Id<"feedback">[] = [];
    const commentIdsByFeedback = new Map<Id<"feedback">, Id<"feedbackComments">[]>();

    for (const item of FEEDBACK_ITEMS) {
      const user = SEED_USERS[item.createdByIndex];
      if (!user) throw new Error(`Invalid createdByIndex: ${item.createdByIndex}`);
      const createdAt = now - item.createdAtOffsetDays * dayMs;
      const id = await ctx.db.insert("feedback", {
        externalId: user.externalId,
        name: user.name,
        email: user.email,
        title: item.title,
        description: item.description,
        board: item.board,
        status: item.status,
        voteScore: item.voteScore,
        commentCount: item.commentCount,
        createdAt,
        ...(item.adminNotes && { adminNotes: item.adminNotes }),
      });
      feedbackIds.push(id);
      commentIdsByFeedback.set(id, []);
    }

    // Seed votes to match voteScore (approximate: add votes from seed users)
    for (let i = 0; i < feedbackIds.length; i++) {
      const feedbackId = feedbackIds[i];
      const item = FEEDBACK_ITEMS[i];
      if (feedbackId === undefined || !item) continue;
      const targetScore = item.voteScore;
      let score = 0;
      const voters = SEED_USERS.map((u) => u.externalId);
      for (let v = 0; v < Math.min(Math.abs(targetScore) + 2, voters.length * 2); v++) {
        const value: 1 | -1 = targetScore >= 0 ? 1 : -1;
        const externalId = voters[v % voters.length];
        if (!externalId) continue;
        const existing = await ctx.db
          .query("feedbackVotes")
          .withIndex("by_feedback_user", (q) =>
            q.eq("feedbackId", feedbackId).eq("externalId", externalId)
          )
          .unique();
        if (existing) continue;
        await ctx.db.insert("feedbackVotes", {
          feedbackId,
          externalId,
          value,
        });
        score += value;
        if (targetScore >= 0 && score >= targetScore) break;
        if (targetScore < 0 && score <= targetScore) break;
      }
      await ctx.db.patch(feedbackId, { voteScore: score });
    }

    // Importance ratings for first few items
    const importanceRatings: Array<"not_important" | "nice_to_have" | "important" | "essential"> = [
      "nice_to_have",
      "important",
      "essential",
      "important",
      "not_important",
    ];
    for (let i = 0; i < Math.min(5, feedbackIds.length); i++) {
      const feedbackId = feedbackIds[i];
      if (feedbackId === undefined) continue;
      for (let u = 0; u < SEED_USERS.length; u++) {
        const rating = importanceRatings[(i + u) % importanceRatings.length];
        const seedUser = SEED_USERS[u];
        if (!rating || !seedUser) continue;
        await ctx.db.insert("feedbackImportance", {
          feedbackId,
          externalId: seedUser.externalId,
          rating,
        });
      }
    }

    // Comments (top-level and replies) with likes/dislikes
    const commentBodies = [
      { body: "This would save our team a lot of time. +1", userIndex: 0 },
      { body: "We already do this manually with a script – native support would be great.", userIndex: 1 },
      { body: "Seconded. Especially for state-level exports.", userIndex: 2 },
      { body: "I hit this yesterday. Clearing the filter and re-applying fixed it for me.", userIndex: 1 },
      { body: "Reproduced on Safari as well. Seems to be a race condition.", userIndex: 0 },
      { body: "Yes please! Our office lights are harsh and we work late.", userIndex: 0 },
      { body: "System preference would be ideal so it matches the OS.", userIndex: 2 },
      { body: "We’d use a weekly digest for our region.", userIndex: 1 },
      { body: "Agree – and optional per-state would be perfect.", userIndex: 2 },
      { body: "Noted. I’ll add it to our known issues doc.", userIndex: 0 },
      { body: "J/K navigation would be amazing for power users.", userIndex: 1 },
      { body: "Most discussed would help prioritize what to read first.", userIndex: 2 },
      { body: "Session timeout is a known constraint; we’re looking at options.", userIndex: 0 },
    ];

    let commentIndex = 0;
    const addComment = async (
      feedbackId: Id<"feedback">,
      userIndex: number,
      body: string,
      parentId: Id<"feedbackComments"> | undefined = undefined
    ): Promise<Id<"feedbackComments">> => {
      const user = SEED_USERS[userIndex];
      if (!user) throw new Error(`Invalid userIndex: ${userIndex}`);
      const createdAt = now - (commentIndex % 5) * dayMs;
      commentIndex++;
      const id = await ctx.db.insert("feedbackComments", {
        feedbackId,
        externalId: user.externalId,
        name: user.name,
        body,
        createdAt,
        likeCount: 0,
        dislikeCount: 0,
        ...(parentId && { parentId }),
      });
      commentIdsByFeedback.get(feedbackId)!.push(id);
      return id;
    };

    // Feedback 0: 4 comments (2 with replies)
    const f0 = feedbackIds[0]!;
    const c0_1 = await addComment(f0, 0, commentBodies[0]!.body);
    await addComment(f0, 1, commentBodies[1]!.body);
    await addComment(f0, 2, commentBodies[2]!.body);
    await addComment(f0, 1, "Same here – we need this for our monthly reports.", c0_1);
    await ctx.db.patch(f0, { commentCount: 4 });

    // Feedback 1: 2 comments
    const f1 = feedbackIds[1]!;
    await addComment(f1, 0, commentBodies[3]!.body);
    await addComment(f1, 2, commentBodies[4]!.body);
    await ctx.db.patch(f1, { commentCount: 2 });

    // Feedback 2: 3 comments (one reply)
    const f2 = feedbackIds[2]!;
    const c2_1 = await addComment(f2, 0, commentBodies[5]!.body);
    await addComment(f2, 2, commentBodies[6]!.body);
    await addComment(f2, 1, "Agreed on system preference.", c2_1);
    await ctx.db.patch(f2, { commentCount: 3 });

    // Feedback 3: 2 comments
    const f3 = feedbackIds[3]!;
    await addComment(f3, 1, commentBodies[7]!.body);
    await addComment(f3, 2, commentBodies[8]!.body);
    await ctx.db.patch(f3, { commentCount: 2 });

    // Feedback 4: 1 comment
    const f4 = feedbackIds[4]!;
    await addComment(f4, 0, commentBodies[9]!.body);
    await ctx.db.patch(f4, { commentCount: 1 });

    // Feedback 5: 2 comments
    const f5 = feedbackIds[5]!;
    await addComment(f5, 1, commentBodies[10]!.body);
    await ctx.db.patch(f5, { commentCount: 2 });

    // Feedback 6: 1 comment
    const f6 = feedbackIds[6]!;
    await addComment(f6, 2, commentBodies[11]!.body);
    await ctx.db.patch(f6, { commentCount: 1 });

    // Feedback 7: 1 comment
    const f7 = feedbackIds[7]!;
    await addComment(f7, 0, commentBodies[12]!.body);
    await ctx.db.patch(f7, { commentCount: 1 });

    // Add like/dislike counts to some comments (one vote per user per comment)
    const allComments = await ctx.db.query("feedbackComments").collect();
    for (let i = 0; i < allComments.length; i++) {
      const c = allComments[i];
      if (!c) continue;
      const likeCount = i % 3 === 0 ? 2 : i % 3 === 1 ? 1 : 0;
      const dislikeCount = i % 5 === 4 ? 1 : 0;
      await ctx.db.patch(c._id, { likeCount, dislikeCount });
      for (let u = 0; u < likeCount && u < SEED_USERS.length; u++) {
        const seedUser = SEED_USERS[u];
        if (!seedUser) continue;
        await ctx.db.insert("commentVotes", {
          commentId: c._id,
          externalId: seedUser.externalId,
          value: 1,
        });
      }
      if (dislikeCount > 0) {
        const lastUser = SEED_USERS[SEED_USERS.length - 1];
        if (lastUser) {
          await ctx.db.insert("commentVotes", {
            commentId: c._id,
            externalId: lastUser.externalId,
            value: -1,
          });
        }
      }
    }

    // Subscriptions: a couple of seed users "subscribed" to first two feedback items
    const subF0 = feedbackIds[0];
    const subF2 = feedbackIds[2];
    const seedUser1 = SEED_USERS[1];
    const seedUser0 = SEED_USERS[0];
    if (subF0 && seedUser1) {
      await ctx.db.insert("feedbackSubscriptions", {
        feedbackId: subF0,
        externalId: seedUser1.externalId,
        createdAt: now - 5 * dayMs,
      });
    }
    if (subF2 && seedUser0) {
      await ctx.db.insert("feedbackSubscriptions", {
        feedbackId: subF2,
        externalId: seedUser0.externalId,
        createdAt: now - 2 * dayMs,
      });
    }

    return {
      seeded: true,
      feedbackCount: feedbackIds.length,
      message: `Seeded ${feedbackIds.length} feedback items with votes, importance, comments, and subscriptions.`,
    };
  },
});
