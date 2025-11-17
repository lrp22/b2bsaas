import { protectedProcedure } from "../index";
import { db } from "@b2bsaas/db";
import { member, user } from "@b2bsaas/db/schema/auth"; // Import both schemas
import { eq } from "drizzle-orm";

export const membersRouter = {
  /**
   * Fetches all members of the currently active workspace.
   * It joins the 'member' table with the 'user' table to get user details.
   */
  listByWorkspace: protectedProcedure.handler(async ({ context }) => {
    const currentOrgId = context.session.session.activeOrganizationId;

    if (!currentOrgId) {
      // If there's no active workspace, there are no members to show.
      return [];
    }

    // This is the core query:
    const members = await db
      .select({
        // Select specific fields from both tables
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: member.role, // Get the user's role from the member table
      })
      .from(member)
      // Join 'member' to 'user' where the user IDs match
      .innerJoin(user, eq(member.userId, user.id))
      // Filter to only include members of the active organization
      .where(eq(member.organizationId, currentOrgId));

    return members;
  }),
};
