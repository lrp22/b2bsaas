import { protectedProcedure } from "../index";
import { z } from "zod";
import { db } from "@b2bsaas/db";
import { channel } from "@b2bsaas/db/schema/channel";
import { and, eq } from "drizzle-orm";
import { member } from "@b2bsaas/db/schema/auth";
import { ORPCError } from "@orpc/server";

// --- The transformation logic from the example ---
function transformChannelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// --- The advanced Zod schema from the example ---
export const channelNameSchema = z.object({
  name: z
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
    }),
});

export const channelRouter = {
  listByWorkspace: protectedProcedure.handler(async ({ context }) => {
    const currentOrgId = context.session.session.activeOrganizationId;
    if (!currentOrgId) return [];

    return db
      .select()
      .from(channel)
      .where(eq(channel.organizationId, currentOrgId));
  }),

  create: protectedProcedure
    .input(channelNameSchema) // Use the advanced schema here
    .handler(async ({ input, context }) => {
      const currentOrgId = context.session.session.activeOrganizationId;
      if (!currentOrgId) {
        throw new Error("No active workspace selected.");
      }

      // 'input.name' is already the clean, transformed name because of the .transform() step
      // The database's unique constraint will automatically throw an error if the name already exists,
      // which is caught by the frontend's onError handler.
      const [newChannel] = await db
        .insert(channel)
        .values({
          name: input.name,
          organizationId: currentOrgId,
        })
        .returning();

      return newChannel;
    }),
 getById: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        workspaceId: z.string(),
      })
    )
    .handler(async ({ input, context }) => {
      // 1. Check Membership
      const [membership] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, context.session.user.id),
            eq(member.organizationId, input.workspaceId)
          )
        );

      if (!membership) {
        throw new ORPCError("FORBIDDEN", {
          message: "You are not a member of this workspace.",
        });
      }

      // 2. Fetch Channel
      const [foundChannel] = await db
        .select()
        .from(channel)
        .where(
          and(
            eq(channel.id, input.channelId),
            eq(channel.organizationId, input.workspaceId)
          )
        );

      if (!foundChannel) {
        throw new ORPCError("NOT_FOUND", {
          message: "Channel not found.",
        });
      }

      return foundChannel;
    }),
};
