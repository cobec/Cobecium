import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { getExternalId } from "./lib/identity";

/**
 * Helper: ensure the current user is authenticated and has role "admin".
 * Throws if not authenticated or not admin. Returns the user doc.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"lynxUsers">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const externalId = getExternalId(identity);
  const user = await ctx.db
    .query("lynxUsers")
    .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
    .unique();
  if (!user || user.role !== "admin") throw new Error("Admin only");
  return user;
}

/**
 * Create or update the current user's lynxUsers row from Entra identity.
 * If no admin exists and current user's oid matches LYNX_FIRST_ADMIN_OID, set role to admin.
 */
export const ensureMe = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const externalId = getExternalId(identity);
    const now = Date.now();
    const name = identity.name ?? undefined;
    const email = (identity.email as string | undefined) ?? undefined;

    const existing = await ctx.db
      .query("lynxUsers")
      .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
      .unique();

    const firstAdminOid = process.env.LYNX_FIRST_ADMIN_OID;
    const noAdminYet = firstAdminOid
      ? (await ctx.db.query("lynxUsers").collect()).every((u) => u.role !== "admin")
      : false;
    const isFirstAdmin =
      !!firstAdminOid && noAdminYet && externalId === firstAdminOid;
    const role = isFirstAdmin ? ("admin" as const) : ("user" as const);

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        email,
        role: isFirstAdmin ? "admin" : existing.role,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("lynxUsers", {
      externalId,
      name,
      email,
      role,
      updatedAt: now,
    });
  },
});

/**
 * Return the current user's role, or null if not yet in lynxUsers.
 */
export const getMyRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("lynxUsers")
      .withIndex("by_externalId", (q) =>
        q.eq("externalId", getExternalId(identity))
      )
      .unique();
    return user ? { role: user.role } : null;
  },
});

/**
 * List all lynxUsers for the Admin page. Admin only.
 */
export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("lynxUsers").collect();
    return users.map((u) => ({
      _id: u._id,
      externalId: u.externalId,
      name: u.name,
      email: u.email,
      role: u.role,
      updatedAt: u.updatedAt,
    }));
  },
});

/**
 * Set a user's role. Admin only. Prevents demoting the last admin.
 */
export const setRole = mutation({
  args: {
    externalId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { externalId, role }) => {
    await requireAdmin(ctx);
    const target = await ctx.db
      .query("lynxUsers")
      .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
      .unique();
    if (!target) throw new Error("User not found");
    if (role === "user") {
      const admins = await ctx.db
        .query("lynxUsers")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();
      if (admins.length <= 1) throw new Error("Cannot demote the last admin");
    }
    await ctx.db.patch(target._id, { role, updatedAt: Date.now() });
  },
});
