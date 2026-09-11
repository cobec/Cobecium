import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireAdmin } from "./users";
import { getExternalId } from "./lib/identity";

type Ctx = QueryCtx | MutationCtx;

async function getIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

async function requireAdminOrCreator(
  ctx: Ctx,
  feedbackDoc: Doc<"feedback">
): Promise<void> {
  const identity = await getIdentity(ctx);
  if (feedbackDoc.externalId === getExternalId(identity)) return;
  const user = await ctx.db
    .query("lynxUsers")
    .withIndex("by_externalId", (q) => q.eq("externalId", getExternalId(identity)))
    .unique();
  if (user?.role === "admin") return;
  throw new Error("Only the creator or an admin can perform this action");
}

const boardValidator = v.union(
  v.literal("feature_request"),
  v.literal("bug_report")
);
const statusValidator = v.union(
  v.literal("gathering_interest"),
  v.literal("planned"),
  v.literal("in_progress"),
  v.literal("complete"),
  v.literal("closed")
);
const importanceValidator = v.union(
  v.literal("not_important"),
  v.literal("nice_to_have"),
  v.literal("important"),
  v.literal("essential")
);

export const submit = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    board: v.optional(boardValidator),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    const board = args.board ?? "feature_request";
    const name = identity.name ?? undefined;
    const email = (identity.email as string | undefined) ?? undefined;
    return await ctx.db.insert("feedback", {
      externalId: getExternalId(identity),
      name,
      email,
      title: args.title.trim(),
      description: args.description.trim(),
      board,
      status: "gathering_interest",
      voteScore: 0,
      commentCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getIdentity(ctx);
    const items = await ctx.db
      .query("feedback")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
    const myVotes: Record<string, 1 | -1> = {};
    for (const item of items) {
      const v = await ctx.db
        .query("feedbackVotes")
        .withIndex("by_feedback_user", (q) =>
          q.eq("feedbackId", item._id).eq("externalId", getExternalId(identity))
        )
        .unique();
      if (v) myVotes[item._id] = v.value;
    }
    return items.map((doc) => ({
      _id: doc._id,
      externalId: doc.externalId,
      name: doc.name,
      title: doc.title,
      description: doc.description,
      board: doc.board,
      status: doc.status,
      voteScore: doc.voteScore,
      commentCount: doc.commentCount,
      createdAt: doc.createdAt,
      myVote: (myVotes[doc._id] as 1 | -1 | undefined) ?? null,
    }));
  },
});

export const get = query({
  args: { id: v.id("feedback") },
  handler: async (ctx, { id }) => {
    const identity = await getIdentity(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    const isAdmin = await (async () => {
      const user = await ctx.db
        .query("lynxUsers")
        .withIndex("by_externalId", (q) => q.eq("externalId", getExternalId(identity)))
        .unique();
      return user?.role === "admin";
    })();
    const myVote = await ctx.db
      .query("feedbackVotes")
      .withIndex("by_feedback_user", (q) =>
        q.eq("feedbackId", id).eq("externalId", getExternalId(identity))
      )
      .unique();
    const myImportance = await ctx.db
      .query("feedbackImportance")
      .withIndex("by_feedback_user", (q) =>
        q.eq("feedbackId", id).eq("externalId", getExternalId(identity))
      )
      .unique();
    return {
      ...doc,
      adminNotes: isAdmin ? doc.adminNotes : undefined,
      myVote: myVote?.value ?? null,
      myImportance: myImportance?.rating ?? null,
      isCreator: getExternalId(identity) === doc.externalId,
    };
  },
});

export const vote = mutation({
  args: {
    feedbackId: v.id("feedback"),
    value: v.union(v.literal(1), v.literal(-1), v.literal(0)),
  },
  handler: async (ctx, { feedbackId, value }) => {
    const identity = await getIdentity(ctx);
    const feedback = await ctx.db.get(feedbackId);
    if (!feedback) throw new Error("Feedback not found");
    const existing = await ctx.db
      .query("feedbackVotes")
      .withIndex("by_feedback_user", (q) =>
        q.eq("feedbackId", feedbackId).eq("externalId", getExternalId(identity))
      )
      .unique();
    let delta = 0;
    if (value === 0) {
      if (existing) {
        delta = -existing.value;
        await ctx.db.delete(existing._id);
      }
    } else {
      const prev = existing?.value ?? 0;
      delta = value - prev;
      if (existing) {
        await ctx.db.patch(existing._id, { value });
      } else {
        await ctx.db.insert("feedbackVotes", {
          feedbackId,
          externalId: getExternalId(identity),
          value,
        });
      }
    }
    await ctx.db.patch(feedbackId, {
      voteScore: feedback.voteScore + delta,
    });
  },
});

export const rateImportance = mutation({
  args: {
    feedbackId: v.id("feedback"),
    rating: importanceValidator,
  },
  handler: async (ctx, { feedbackId, rating }) => {
    const identity = await getIdentity(ctx);
    const feedback = await ctx.db.get(feedbackId);
    if (!feedback) throw new Error("Feedback not found");
    const existing = await ctx.db
      .query("feedbackImportance")
      .withIndex("by_feedback_user", (q) =>
        q.eq("feedbackId", feedbackId).eq("externalId", getExternalId(identity))
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { rating });
    } else {
      await ctx.db.insert("feedbackImportance", {
        feedbackId,
        externalId: getExternalId(identity),
        rating,
      });
    }
  },
});

export const getImportanceSummary = query({
  args: { feedbackId: v.id("feedback") },
  handler: async (ctx, { feedbackId }) => {
    await getIdentity(ctx);
    const ratings = await ctx.db
      .query("feedbackImportance")
      .withIndex("by_feedback_user", (q) => q.eq("feedbackId", feedbackId))
      .collect();
    const counts = {
      not_important: 0,
      nice_to_have: 0,
      important: 0,
      essential: 0,
    };
    for (const r of ratings) {
      counts[r.rating]++;
    }
    return counts;
  },
});

export const updateFeedbackStatus = mutation({
  args: {
    id: v.id("feedback"),
    status: statusValidator,
  },
  handler: async (ctx, { id, status }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Feedback not found");
    await requireAdminOrCreator(ctx, doc);
    await ctx.db.patch(id, { status });
  },
});

export const updateAdminNotes = mutation({
  args: {
    id: v.id("feedback"),
    adminNotes: v.string(),
  },
  handler: async (ctx, { id, adminNotes }) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Feedback not found");
    await ctx.db.patch(id, { adminNotes });
  },
});

export const listComments = query({
  args: {
    feedbackId: v.id("feedback"),
    sortBy: v.optional(v.union(v.literal("top"), v.literal("newest"))),
  },
  handler: async (ctx, { feedbackId, sortBy }) => {
    const identity = await getIdentity(ctx);
    const comments = await ctx.db
      .query("feedbackComments")
      .withIndex("by_feedbackId", (q) => q.eq("feedbackId", feedbackId))
      .collect();
    const withVotes = await Promise.all(
      comments.map(async (c) => {
        const myVote = await ctx.db
          .query("commentVotes")
          .withIndex("by_comment_user", (q) =>
            q.eq("commentId", c._id).eq("externalId", getExternalId(identity))
          )
          .unique();
        return {
          _id: c._id,
          feedbackId: c.feedbackId,
          externalId: c.externalId,
          name: c.name,
          body: c.body,
          createdAt: c.createdAt,
          parentId: c.parentId,
          likeCount: c.likeCount,
          dislikeCount: c.dislikeCount,
          myVote: myVote?.value ?? null,
        };
      })
    );
    const sorted =
      sortBy === "top"
        ? [...withVotes].sort((a, b) => b.likeCount - a.likeCount)
        : [...withVotes].sort((a, b) => a.createdAt - b.createdAt);
    return sorted;
  },
});

export const addComment = mutation({
  args: {
    feedbackId: v.id("feedback"),
    body: v.string(),
    parentId: v.optional(v.id("feedbackComments")),
  },
  handler: async (ctx, { feedbackId, body, parentId }) => {
    const identity = await getIdentity(ctx);
    const feedback = await ctx.db.get(feedbackId);
    if (!feedback) throw new Error("Feedback not found");
    const name = identity.name ?? undefined;
    if (parentId !== undefined) {
      const parent = await ctx.db.get(parentId);
      if (!parent || parent.feedbackId !== feedbackId)
        throw new Error("Invalid parent comment");
    }
    const id = await ctx.db.insert("feedbackComments", {
      feedbackId,
      externalId: getExternalId(identity),
      name,
      body: body.trim(),
      createdAt: Date.now(),
      likeCount: 0,
      dislikeCount: 0,
      ...(parentId !== undefined && { parentId }),
    });
    await ctx.db.patch(feedbackId, {
      commentCount: feedback.commentCount + 1,
    });
    return id;
  },
});

export const voteComment = mutation({
  args: {
    commentId: v.id("feedbackComments"),
    value: v.union(v.literal(1), v.literal(-1), v.literal(0)),
  },
  handler: async (ctx, { commentId, value }) => {
    const identity = await getIdentity(ctx);
    const comment = await ctx.db.get(commentId);
    if (!comment) throw new Error("Comment not found");
    const existing = await ctx.db
      .query("commentVotes")
      .withIndex("by_comment_user", (q) =>
        q.eq("commentId", commentId).eq("externalId", getExternalId(identity))
      )
      .unique();
    let likeDelta = 0;
    let dislikeDelta = 0;
    if (value === 0) {
      if (existing) {
        if (existing.value === 1) likeDelta = -1;
        else dislikeDelta = -1;
        await ctx.db.delete(existing._id);
      }
    } else {
      const prev = existing?.value ?? 0;
      if (prev === 1) likeDelta = -1;
      else if (prev === -1) dislikeDelta = -1;
      if (value === 1) likeDelta += 1;
      else dislikeDelta += 1;
      if (existing) {
        await ctx.db.patch(existing._id, { value });
      } else {
        await ctx.db.insert("commentVotes", {
          commentId,
          externalId: getExternalId(identity),
          value,
        });
      }
    }
    await ctx.db.patch(commentId, {
      likeCount: comment.likeCount + likeDelta,
      dislikeCount: comment.dislikeCount + dislikeDelta,
    });
  },
});

export const listMyFeedback = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getIdentity(ctx);
    return await ctx.db
      .query("feedback")
      .withIndex("by_externalId", (q) => q.eq("externalId", getExternalId(identity)))
      .order("desc")
      .collect();
  },
});

export const setSubscription = mutation({
  args: {
    feedbackId: v.id("feedback"),
    subscribed: v.boolean(),
  },
  handler: async (ctx, { feedbackId, subscribed }) => {
    const identity = await getIdentity(ctx);
    const existing = await ctx.db
      .query("feedbackSubscriptions")
      .withIndex("by_feedback_user", (q) =>
        q.eq("feedbackId", feedbackId).eq("externalId", getExternalId(identity))
      )
      .unique();
    if (subscribed && !existing) {
      await ctx.db.insert("feedbackSubscriptions", {
        feedbackId,
        externalId: getExternalId(identity),
        createdAt: Date.now(),
      });
    } else if (!subscribed && existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getSubscription = query({
  args: { feedbackId: v.id("feedback") },
  handler: async (ctx, { feedbackId }) => {
    const identity = await getIdentity(ctx);
    const sub = await ctx.db
      .query("feedbackSubscriptions")
      .withIndex("by_feedback_user", (q) =>
        q.eq("feedbackId", feedbackId).eq("externalId", getExternalId(identity))
      )
      .unique();
    return !!sub;
  },
});
