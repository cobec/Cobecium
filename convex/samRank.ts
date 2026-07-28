import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Lynx ↔ SamRank bridge.
 * SamRank owns CSV ingest, embeddings, ranking, preference learning, Firecrawl enrich.
 * Convex/Lynx owns Clerk auth + product UI (`/opps`).
 *
 * Docs: docs/OPPORTUNITIES_INTEGRATION.md
 *
 * Env (Convex dashboard / convex env set):
 *   SAMRANK_BASE_URL=http://cobec-spark:5190
 *   SAMRANK_DEFAULT_TEAM_ID=cobec   (optional)
 */

function baseUrl(): string {
  const url = process.env.SAMRANK_BASE_URL?.trim();
  if (!url) {
    throw new Error(
      "SamRank is not configured: set SAMRANK_BASE_URL (e.g. http://cobec-spark:5190) in Convex env."
    );
  }
  return url.replace(/\/$/, "");
}

function defaultTeamId(): string {
  return process.env.SAMRANK_DEFAULT_TEAM_ID?.trim() || "cobec";
}

async function samFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, { ...init, headers });
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : text || res.statusText;
    throw new Error(`SamRank ${res.status}: ${err}`);
  }
  return data;
}

async function requireIdentity(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string; name?: string; email?: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Sign in required");
  return identity;
}

async function ensureSamUser(
  identity: { subject: string; name?: string; email?: string }
): Promise<{ id: string; displayName: string; teamId: string }> {
  const displayName =
    identity.name?.trim() ||
    identity.email?.trim() ||
    identity.subject;
  const res = await samFetch("/api/users/ensure", {
    method: "POST",
    body: JSON.stringify({
      externalId: identity.subject,
      displayName,
      teamId: defaultTeamId(),
    }),
  });
  const data = (await readJson(res)) as {
    id: string;
    displayName: string;
    teamId: string;
  };
  return data;
}

export const ensureMe = action({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    return await ensureSamUser(identity);
  },
});

export const getFeed = action({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const user = await ensureSamUser(identity);
    const res = await samFetch(`/api/feed?userId=${encodeURIComponent(user.id)}`);
    return await readJson(res);
  },
});

export const getBatch = action({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const user = await ensureSamUser(identity);
    const res = await samFetch(`/api/batch?userId=${encodeURIComponent(user.id)}`);
    return await readJson(res);
  },
});

export const castVote = action({
  args: {
    noticeId: v.string(),
    yes: v.boolean(),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, { noticeId, yes, feedback }) => {
    const identity = await requireIdentity(ctx);
    const user = await ensureSamUser(identity);
    const res = await samFetch("/api/vote", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        noticeId,
        yes,
        feedback: feedback ?? null,
      }),
    });
    return await readJson(res);
  },
});

export const rerollBatch = action({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const user = await ensureSamUser(identity);
    const res = await samFetch("/api/batch/reroll", {
      method: "POST",
      body: JSON.stringify({ userId: user.id }),
    });
    return await readJson(res);
  },
});

export const getApproved = action({
  args: {
    scope: v.optional(v.union(v.literal("mine"), v.literal("team"))),
  },
  handler: async (ctx, { scope }) => {
    const identity = await requireIdentity(ctx);
    const user = await ensureSamUser(identity);
    const s = scope ?? "mine";
    const res = await samFetch(
      `/api/approved?userId=${encodeURIComponent(user.id)}&scope=${encodeURIComponent(s)}`
    );
    return await readJson(res);
  },
});

export const search = action({
  args: {
    query: v.string(),
    topK: v.optional(v.number()),
  },
  handler: async (ctx, { query, topK }) => {
    const identity = await requireIdentity(ctx);
    const user = await ensureSamUser(identity);
    const params = new URLSearchParams({
      userId: user.id,
      q: query,
    });
    if (topK != null) params.set("topK", String(topK));
    const res = await samFetch(`/api/search?${params.toString()}`);
    return await readJson(res);
  },
});

export const getStatus = action({
  args: {},
  handler: async (ctx) => {
    await requireIdentity(ctx);
    const res = await samFetch("/api/status");
    return await readJson(res);
  },
});

export const runPipeline = action({
  args: {},
  handler: async (ctx) => {
    await requireIdentity(ctx);
    const res = await samFetch("/api/pipeline/run", { method: "POST" });
    return await readJson(res);
  },
});
