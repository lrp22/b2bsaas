import { z } from "zod";
import { protectedProcedure } from "../index";
import { channel, db, member } from "@b2bsaas/db";
import { message } from "@b2bsaas/db/schema/message";
import { and, desc, eq, lt } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

export const messageRouter = {
  create: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        content: z.string().min(1),
      })
    )
    .handler(async ({ context, input }) => {
      // 1. Fetch the channel to find out which Workspace (Organization) it belongs to
      const channelData = await db.query.channel.findFirst({
        where: eq(channel.id, input.channelId),
        columns: { organizationId: true },
      });

      if (!channelData) {
        // FIXED: Pass code as first arg, options as second
        throw new ORPCError("NOT_FOUND", {
          message: "Channel not found",
        });
      }

      // 2. SECURITY CHECK: Is the user a member of this workspace?
      const membership = await db.query.member.findFirst({
        where: and(
          eq(member.userId, context.session.user.id),
          eq(member.organizationId, channelData.organizationId)
        ),
      });

      if (!membership) {
        // FIXED: Pass code as first arg, options as second
        throw new ORPCError("FORBIDDEN", {
          message: "You are not a member of this workspace",
        });
      }

      // 3. Create the message
      await db.insert(message).values({
        content: input.content,
        channelId: input.channelId,
        userId: context.session.user.id,
      });

      return { success: true };
    }),

  list: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(), // Timestamp of the last loaded message
      })
    )
    .handler(async ({ input }) => {
      const messages = await db.query.message.findMany({
        where: (t) =>
          and(
            eq(t.channelId, input.channelId),
            // If cursor exists, get messages created BEFORE that date (older)
            input.cursor ? lt(t.createdAt, new Date(input.cursor)) : undefined
          ),
        limit: input.limit + 1, // Fetch one extra to see if there's a next page
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

      // If we got more items than the limit, we have a next page
      if (messages.length > input.limit) {
        const nextItem = messages.pop(); // Remove the extra item
        nextCursor = nextItem?.createdAt.toISOString();
      }

      return {
        items: messages,
        nextCursor,
      };
    }),
};
