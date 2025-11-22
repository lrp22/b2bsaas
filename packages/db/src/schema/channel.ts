import { pgTable, text, timestamp, unique, index } from "drizzle-orm/pg-core";
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
  (table) => ({
    // Unique name per organization
    orgNameUnique: unique().on(table.organizationId, table.name),
    // Index for "List all channels in Org Y"
    orgIdx: index("channel_org_idx").on(table.organizationId),
  })
);

export const channelRelations = relations(channel, ({ one, many }) => ({
  organization: one(organization, {
    fields: [channel.organizationId],
    references: [organization.id],
  }),
  messages: many(message),
}));
