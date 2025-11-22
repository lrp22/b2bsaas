import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";
import { checkRateLimit, generalLimiter } from "./lib/rate-limit";

export const o = os.$context<Context>();

/**
 * Rate Limit Middleware
 * This protects the entire API from DDoS and heavy usage.
 */
const withRateLimit = o.middleware(async ({ context, next }) => {
  // 1. Identify the client
  // If the user is logged in, we rate limit by their User ID (best for office/shared IPs).
  // If they are anonymous (login page, health check), we rate limit by their IP address.
  const key = context.session?.user?.id || context.ip;

  // 2. Check limits
  // This will throw an ORPCError("TOO_MANY_REQUESTS") if exceeded.
  await checkRateLimit(generalLimiter, key);

  return next({});
});

/**
 * Public Procedure
 * Use this for routes that don't require login (e.g., health checks, auth).
 * It still has Rate Limiting enabled.
 */
export const publicProcedure = o.use(withRateLimit);

/**
 * Auth Middleware
 * Ensures the user has a valid session.
 */
const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

/**
 * Protected Procedure
 * Use this for 99% of your app logic (Workspaces, Channels, Messages).
 * It inherits Rate Limiting from publicProcedure + enforces Auth.
 */
export const protectedProcedure = publicProcedure.use(requireAuth);
