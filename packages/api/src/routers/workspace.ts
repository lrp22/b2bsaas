// packages/api/src/routers/workspace.ts

// 1. Import your configured 'auth' instance from the auth package
import { auth } from "@b2bsaas/auth";
// 2. We only need protectedProcedure from the api package
import { protectedProcedure } from "../index";

// (Notice we have removed all the unused imports like eq, z, db, etc.)

export const workspaceRouter = {
  getAll: protectedProcedure.handler(async ({ context }) => {
    // Now TypeScript knows what 'auth' is and can correctly infer types
    const orgs = await auth.organization.getUserOrganizations({
      userId: context.session.user.id,
    });

    // The 'org' parameter will now be correctly typed automatically!
    return orgs.map((org) => ({
      id: org.id,
      name: org.name,
      avatar: org.name.substring(0, 2).toUpperCase(),
    }));
  }),
};
