import { protectedProcedure, publicProcedure } from "../index";
import type { RouterClient } from "@orpc/server";
import { workspaceRouter } from "./workspace";
import { channelRouter } from "./channel";
import { membersRouter } from "./members";
import { messageRouter } from "./messages";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  workspace: workspaceRouter,
  channel: channelRouter,
  members: membersRouter,
  message: messageRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
