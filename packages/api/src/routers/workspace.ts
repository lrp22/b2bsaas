// packages/api/src/routers/workspace.ts

import { db } from "@b2bsaas/db";
import { member, organization, session } from "@b2bsaas/db/schema/auth";
import { eq, and } from "drizzle-orm";
import { protectedProcedure } from "../index";
import { z } from "zod";
import { nanoid } from "nanoid";

export const workspaceRouter = {
  // List organizations for the current user
  list: protectedProcedure.handler(async ({ context }) => {
    // Query the database directly to get user's organizations
    const userOrgs = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        createdAt: organization.createdAt,
      })
      .from(organization)
      .innerJoin(member, eq(member.organizationId, organization.id))
      .where(eq(member.userId, context.session.user.id));

    // Get the current active organization from the session
    const currentOrgId = context.session.session.activeOrganizationId;

    // Transform the data to match what the frontend expects
    const workspaces = userOrgs.map((org) => ({
      id: org.id,
      name: org.name,
      avatar: org.name.substring(0, 2).toUpperCase(),
    }));

    // Find the current workspace
    const currentWorkspace =
      workspaces.find((ws) => ws.id === currentOrgId) || workspaces[0];

    return {
      workspaces,
      currentWorkspace: currentWorkspace,
    };
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(2, "Workspace name must be at least 2 characters."),
      })
    )
    .handler(async ({ input, context }) => {
      const { user, session: userSession } = context.session;

      // 2. ROBUST SLUG GENERATION: We create a unique slug on the server.
      const baseSlug = input.name.toLowerCase().replace(/\s+/g, "-");
      let finalSlug = baseSlug;
      let attempt = 1;

      // Keep trying new slugs until we find one that doesn't exist.
      // This is more robust than just checking once.
      while (true) {
        const existingOrg = await db
          .select({ id: organization.id })
          .from(organization)
          .where(eq(organization.slug, finalSlug))
          .limit(1);

        if (existingOrg.length === 0) {
          break; // The slug is unique, we can proceed.
        }

        // If slug exists, append a number and try again.
        finalSlug = `${baseSlug}-${attempt++}`;
      }
      const newOrgId = nanoid(); // Generate the ID for the organization

      // Use a transaction for data safety
      const newOrg = await db.transaction(async (tx) => {
        // Step 1: Create the organization, providing the generated ID
        const [createdOrg] = await tx
          .insert(organization)
          .values({
            id: newOrgId, // Provide the ID here
            name: input.name,
            slug: finalSlug,
            createdAt: new Date(),
          })
          .returning();

        if (!createdOrg) {
          tx.rollback();
          throw new Error("Failed to create workspace. Please try again.");
        }

        // Step 2: Add user as the "owner", providing a generated ID
        await tx.insert(member).values({
          id: nanoid(), // Provide the ID here
          organizationId: createdOrg.id,
          userId: user.id,
          role: "owner", // Using your role choice
          createdAt: new Date(),
        });

        // Step 3: Make the new workspace the active one
        await tx
          .update(session)
          .set({ activeOrganizationId: createdOrg.id })
          .where(eq(session.id, userSession.id));

        return createdOrg;
      });

      // Step 4: Return a clean object to the frontend
      return {
        id: newOrg.id,
        name: newOrg.name,
        slug: newOrg.slug,
      };
    }),
  switch: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
      })
    )
    .handler(async ({ input, context }) => {
      // 1. SECURITY CHECK: Verify the user is a member of the organization
      // they are trying to switch to. This is extremely important.
      const membership = await db
        .select({ id: member.id })
        .from(member)
        .where(
          and(
            eq(member.userId, context.session.user.id),
            eq(member.organizationId, input.organizationId)
          )
        )
        .limit(1);

      // If the query returns no results, the user is not a member. Deny the request.
      if (membership.length === 0) {
        throw new Error(
          "UNAUTHORIZED: You are not a member of this workspace."
        );
      }

      // 2. UPDATE SESSION: If the security check passes, update their session
      // in the database to set the new active organization.
      await db
        .update(session)
        .set({ activeOrganizationId: input.organizationId })
        .where(eq(session.id, context.session.session.id));

      // 3. RETURN SUCCESS: Send a simple success message back to the client.
      return { success: true };
    }),
};
