import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { user } from "./auth";
import { channel } from "./channel";

export const message = pgTable(
  "message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    content: text("content").notNull(),

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
  },
  (table) => ({
    // PERFECT INDEX for Chat:
    // 1. Filters by Channel
    // 2. Already Sorted by Date (latest first)
    // This makes pagination instantaneous even with millions of messages.
    channelCreatedIdx: index("message_channel_created_idx").on(
      table.channelId,
      table.createdAt
    ),
  })
);

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