import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { organization } from "./auth";
import { message } from "./message";

export const channel = pgTable(
  "channel",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    // Unique name per organization
    orgNameUnique: unique().on(t.organizationId, t.name),
  })
);

export const channelRelations = relations(channel, ({ one, many }) => ({
  // Relation to parent Organization
  organization: one(organization, {
    fields: [channel.organizationId],
    references: [organization.id],
  }),
  // Relation to child Messages
  messages: many(message),
}));
