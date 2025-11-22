// packages/api/src/lib/rate-limit.ts
import { RateLimiterMemory } from "rate-limiter-flexible";
import { ORPCError } from "@orpc/server";

// 1. General Limiter: 50 requests per 10 seconds (Good for navigation/fetching)
export const generalLimiter = new RateLimiterMemory({
  points: 50,
  duration: 10,
});

// 2. Strict Limiter: 5 requests per 10 seconds (Good for creating messages/channels)
export const strictLimiter = new RateLimiterMemory({
  points: 5,
  duration: 10,
});

// Helper function to consume points
export const checkRateLimit = async (
  limiter: RateLimiterMemory,
  key: string
) => {
  try {
    await limiter.consume(key);
  } catch (res) {
    throw new ORPCError("TOO_MANY_REQUESTS", {
      message: "You are doing that too much. Please slow down.",
    });
  }
};
