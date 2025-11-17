import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { organization } from "./auth"; // For the foreign key relationship
import { nanoid } from "nanoid";

export const channel = pgTable(
  "channel",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()), // Use nanoid for default IDs
    name: text("name").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // This ensures a channel name is unique within a specific workspace
  (table) => ({
    orgNameUnique: unique().on(table.organizationId, table.name),
  })
);
