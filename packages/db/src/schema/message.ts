import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { user } from "./auth";
import { channel } from "./channel";

export const message = pgTable("message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  content: text("content").notNull(), // Stores Tiptap JSON string

  channelId: text("channel_id")
    .notNull()
    .references(() => channel.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const messageRelations = relations(message, ({ one }) => ({
  channel: one(channel, {
    fields: [message.channelId],
    references: [channel.id],
  }),
  user: one(user, {
    fields: [message.userId],
    references: [user.id],
  }),
}));
