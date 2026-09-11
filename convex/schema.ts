import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  samples: defineTable({
    message: v.string(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  procurementLinks: defineTable({
    state: v.string(),
    city: v.string(),
    official_website: v.string(),
    procurement_link: v.string(),
  })
    .index("by_state", ["state"])
    .index("by_city", ["city"])
    .index("by_official_website", ["official_website"])
    .index("by_procurement_link", ["procurement_link"]),

  chatSystemPrompts: defineTable({
    title: v.string(),
    description: v.string(),
    systemPromptText: v.string(),
    isPrimarySystemPrompt: v.boolean(),
    type: v.string(),
    typeName: v.string(),
    typeDisplayName: v.string(),
    state: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_typeName", ["typeName"])
    .index("by_state", ["state"])
    .index("by_isPrimarySystemPrompt", ["isPrimarySystemPrompt"]),

  huntStarts: defineTable({
    state: v.string(),
    startedAt: v.number(),
  }).index("by_state", ["state"]),

  lynxUsers: defineTable({
    externalId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    updatedAt: v.number(),
  }).index("by_externalId", ["externalId"]),

  /** Singleton-style row for orchestrator API docs sync (hash + timestamps; optional file storage ref). */
  orchestratorDocsSync: defineTable({
    contentHash: v.string(),
    lastFetchedAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.optional(v.number()),
    storageId: v.optional(v.id("_storage")),
  }),

  // Feedback / feature-request board
  feedback: defineTable({
    externalId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    board: v.union(v.literal("feature_request"), v.literal("bug_report")),
    status: v.union(
      v.literal("gathering_interest"),
      v.literal("planned"),
      v.literal("in_progress"),
      v.literal("complete"),
      v.literal("closed")
    ),
    adminNotes: v.optional(v.string()),
    voteScore: v.number(),
    commentCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_voteScore", ["voteScore"])
    .index("by_board", ["board"])
    .index("by_externalId", ["externalId"]),

  feedbackVotes: defineTable({
    feedbackId: v.id("feedback"),
    externalId: v.string(),
    value: v.union(v.literal(1), v.literal(-1)),
  }).index("by_feedback_user", ["feedbackId", "externalId"]),

  feedbackImportance: defineTable({
    feedbackId: v.id("feedback"),
    externalId: v.string(),
    rating: v.union(
      v.literal("not_important"),
      v.literal("nice_to_have"),
      v.literal("important"),
      v.literal("essential")
    ),
  }).index("by_feedback_user", ["feedbackId", "externalId"]),

  feedbackComments: defineTable({
    feedbackId: v.id("feedback"),
    externalId: v.string(),
    name: v.optional(v.string()),
    body: v.string(),
    createdAt: v.number(),
    parentId: v.optional(v.id("feedbackComments")),
    likeCount: v.number(),
    dislikeCount: v.number(),
  })
    .index("by_feedbackId", ["feedbackId"])
    .index("by_feedbackId_createdAt", ["feedbackId", "createdAt"])
    .index("by_parentId", ["parentId"]),

  commentVotes: defineTable({
    commentId: v.id("feedbackComments"),
    externalId: v.string(),
    value: v.union(v.literal(1), v.literal(-1)),
  }).index("by_comment_user", ["commentId", "externalId"]),

  feedbackSubscriptions: defineTable({
    feedbackId: v.id("feedback"),
    externalId: v.string(),
    createdAt: v.number(),
  }).index("by_feedback_user", ["feedbackId", "externalId"]),
});
