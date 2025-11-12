// packages/api/src/routers/workspace.ts

import { db } from "@b2bsaas/db";
import { member, organization } from "@b2bsaas/db/schema/auth";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "../index";
import { z } from "zod";

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
};
