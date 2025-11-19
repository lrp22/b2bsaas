import { z } from "zod";
import { protectedProcedure } from "../index";
import { db } from "@b2bsaas/db";
import { message } from "@b2bsaas/db/schema/message";
import { channel } from "@b2bsaas/db/schema/channel";
import { member } from "@b2bsaas/db/schema/auth";
import { and, eq, desc } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

export const messageRouter = {
  // 1. LIST MESSAGES (Protected)
  list: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .handler(async ({ context, input }) => {
      // --- SECURITY CHECK START ---

      // 1. Find the channel to identify which Workspace it belongs to
      const channelData = await db.query.channel.findFirst({
        where: eq(channel.id, input.channelId),
        columns: { organizationId: true }, // Optimization: We only need the org ID
      });

      if (!channelData) {
        throw new ORPCError("NOT_FOUND", { message: "Channel not found" });
      }

      // 2. Verify the user is a member of that Workspace
      const isMember = await db.query.member.findFirst({
        where: and(
          eq(member.userId, context.session.user.id),
          eq(member.organizationId, channelData.organizationId)
        ),
      });

      if (!isMember) {
        throw new ORPCError("FORBIDDEN", {
          message: "You do not have permission to view this channel.",
        });
      }

      // --- SECURITY CHECK END ---

      // 3. Fetch messages
      const items = await db.query.message.findMany({
        where: (table, { and, eq, lt }) =>
          and(
            eq(table.channelId, input.channelId),
            // If cursor is provided, fetch items older than the cursor (pagination)
            input.cursor
              ? lt(table.createdAt, new Date(input.cursor))
              : undefined
          ),
        limit: input.limit + 1, // Fetch one extra to check if there is a next page
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

      // Return reversed (Oldest -> Newest) so the UI renders them top-to-bottom correctly
      return {
        items: items.reverse(),
        nextCursor,
      };
    }),

  // 2. CREATE MESSAGE (Protected)
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1, "Message cannot be empty"),
        channelId: z.string(),
        workspaceId: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      // 1. Security: Check Workspace Membership
      const isMember = await db.query.member.findFirst({
        where: and(
          eq(member.userId, context.session.user.id),
          eq(member.organizationId, input.workspaceId)
        ),
      });

      if (!isMember) {
        throw new ORPCError("FORBIDDEN", {
          message: "You are not a member of this workspace",
        });
      }

      // 2. Security: Verify Channel Integrity (Ensure channel actually belongs to this workspace)
      const channelData = await db.query.channel.findFirst({
        where: and(
          eq(channel.id, input.channelId),
          eq(channel.organizationId, input.workspaceId)
        ),
      });

      if (!channelData) {
        throw new ORPCError("NOT_FOUND", {
          message: "Channel not found in this workspace",
        });
      }

      // 3. Insert Message
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
