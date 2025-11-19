import { protectedProcedure } from "../index";
import { z } from "zod";
import { db } from "@b2bsaas/db";
import { channel } from "@b2bsaas/db/schema/channel";
import { member } from "@b2bsaas/db/schema/auth";
import { and, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

// --- The transformation logic ---
function transformChannelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// --- The advanced Zod schema ---
export const channelNameSchema = z
  .string()
  .min(2, "Channel name must be at least 2 characters.")
  .max(50, "Channel name must be less than 50 characters.")
  .transform((name, ctx) => {
    const transformedName = transformChannelName(name);
    if (transformedName.length < 2) {
      ctx.addIssue({
        code: "custom",
        message:
          "Channel name must contain at least 2 alphanumeric characters.",
      });
      return z.NEVER;
    }
    return transformedName;
  });

export const channelRouter = {
  // 1. LIST BY WORKSPACE
  listByWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .handler(async ({ context, input }) => {
      // Check membership
      const isMember = await db.query.member.findFirst({
        where: and(
          eq(member.userId, context.session.user.id), // FIX: Use context.session.user
          eq(member.organizationId, input.workspaceId)
        ),
      });

      if (!isMember) {
        throw new ORPCError("FORBIDDEN", {
          message: "Not a member of this workspace",
        });
      }

      return db.query.channel.findMany({
        where: eq(channel.organizationId, input.workspaceId),
        orderBy: (channel, { asc }) => [asc(channel.createdAt)],
      });
    }),

  // 2. GET BY ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        workspaceId: z.string().optional(), // Optional context
      })
    )
    .handler(async ({ context, input }) => {
      // 1. Find the channel
      const result = await db.query.channel.findFirst({
        where: eq(channel.id, input.id),
      });

      if (!result) {
        throw new ORPCError("NOT_FOUND", { message: "Channel not found" });
      }

      // 2. Security: Ensure user is part of the channel's organization
      const isMember = await db.query.member.findFirst({
        where: and(
          eq(member.userId, context.session.user.id), // FIX: Use context.session.user
          eq(member.organizationId, result.organizationId)
        ),
      });

      if (!isMember) {
        throw new ORPCError("FORBIDDEN", {
          message: "You cannot view this channel",
        });
      }

      return result;
    }),

  // 3. CREATE CHANNEL
  create: protectedProcedure
    .input(
      z.object({
        name: channelNameSchema,
        workspaceId: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      // 1. Check Membership
      const isMember = await db.query.member.findFirst({
        where: and(
          eq(member.userId, context.session.user.id), // FIX: Use context.session.user
          eq(member.organizationId, input.workspaceId)
        ),
      });

      if (!isMember) {
        throw new ORPCError("FORBIDDEN", {
          message:
            "You do not have permission to create channels in this workspace.",
        });
      }

      // 2. Create the channel
      try {
        const [newChannel] = await db
          .insert(channel)
          .values({
            name: input.name,
            organizationId: input.workspaceId,
          })
          .returning();

        return newChannel;
      } catch (error: any) {
        // Handle unique constraint violation
        if (error?.code === "23505") {
          throw new ORPCError("CONFLICT", {
            message:
              "A channel with this name already exists in this workspace.",
          });
        }
        throw error;
      }
    }),
};
