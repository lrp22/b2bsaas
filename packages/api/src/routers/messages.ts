import { z } from "zod";
import { protectedProcedure } from "../index";
import { db } from "@b2bsaas/db";
import { message } from "@b2bsaas/db/schema/message";
import { channel } from "@b2bsaas/db/schema/channel";
import { member } from "@b2bsaas/db/schema/auth";
import { and, eq, desc } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { strictLimiter, checkRateLimit } from "../lib/rate-limit";

export const messageRouter = {
  // 1. LIST MESSAGES
  list: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .handler(async ({ context, input }) => {
      // --- OPTIMIZED SECURITY CHECK ---
      // Instead of fetching Channel then fetching Member (2 queries),
      // we join them to check if the user has access to this channel in 1 query.
      const [access] = await db
        .select({ channelId: channel.id })
        .from(channel)
        .innerJoin(
          member,
          and(
            eq(channel.organizationId, member.organizationId),
            eq(member.userId, context.session.user.id)
          )
        )
        .where(eq(channel.id, input.channelId))
        .limit(1);

      if (!access) {
        throw new ORPCError("NOT_FOUND", {
          message: "Channel not found or you do not have access.",
        });
      }

      // 2. Fetch messages
      const items = await db.query.message.findMany({
        where: (table, { and, eq, lt }) =>
          and(
            eq(table.channelId, input.channelId),
            input.cursor
              ? lt(table.createdAt, new Date(input.cursor))
              : undefined
          ),
        limit: input.limit + 1,
        orderBy: [desc(message.createdAt)],
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.createdAt.toISOString();
      }

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),

  // 2. CREATE MESSAGE
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1, "Message cannot be empty"),
        channelId: z.string(),
        workspaceId: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      // Rate Limit
      await checkRateLimit(strictLimiter, context.session.user.id);

      // --- OPTIMIZED SECURITY CHECK ---
      // Ensure:
      // 1. Channel exists and belongs to the workspace provided
      // 2. User is a member of that workspace
      const [valid] = await db
        .select({ id: channel.id })
        .from(channel)
        .innerJoin(
          member,
          and(
            eq(member.organizationId, input.workspaceId),
            eq(member.userId, context.session.user.id)
          )
        )
        .where(
          and(
            eq(channel.id, input.channelId),
            eq(channel.organizationId, input.workspaceId)
          )
        )
        .limit(1);

      if (!valid) {
        throw new ORPCError("FORBIDDEN", {
          message: "You cannot post to this channel.",
        });
      }

      // Insert Message
      const [newMessage] = await db
        .insert(message)
        .values({
          content: input.content,
          channelId: input.channelId,
          userId: context.session.user.id,
        })
        .returning();

      return newMessage;
    }),
};
