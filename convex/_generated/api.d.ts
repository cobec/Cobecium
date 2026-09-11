/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as feedback from "../feedback.js";
import type * as huntAnalytics from "../huntAnalytics.js";
import type * as lib_identity from "../lib/identity.js";
import type * as orchestrator from "../orchestrator.js";
import type * as orchestratorDocsSync from "../orchestratorDocsSync.js";
import type * as procurementLinks from "../procurementLinks.js";
import type * as samRank from "../samRank.js";
import type * as sample from "../sample.js";
import type * as seed from "../seed.js";
import type * as seedFeedback from "../seedFeedback.js";
import type * as systemPrompts from "../systemPrompts.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  feedback: typeof feedback;
  huntAnalytics: typeof huntAnalytics;
  "lib/identity": typeof lib_identity;
  orchestrator: typeof orchestrator;
  orchestratorDocsSync: typeof orchestratorDocsSync;
  procurementLinks: typeof procurementLinks;
  samRank: typeof samRank;
  sample: typeof sample;
  seed: typeof seed;
  seedFeedback: typeof seedFeedback;
  systemPrompts: typeof systemPrompts;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
