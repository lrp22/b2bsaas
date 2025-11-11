import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@b2bsaas/db";
import { todo } from "@b2bsaas/db/schema/todo";
import { protectedProcedure } from "../index";

export const listWorkspaces = {
  getAll: protectedProcedure.handler(async () => {
    return await db.select().from(todo);
  }),
};
