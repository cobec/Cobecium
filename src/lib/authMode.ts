/** True when a Clerk publishable key is configured for the Vite app. */
export const CLERK_PUBLISHABLE_KEY =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) ?? "";

export const isClerkEnabled = CLERK_PUBLISHABLE_KEY.length > 0;
