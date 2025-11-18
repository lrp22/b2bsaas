import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./schema/auth";
import * as channelSchema from "./schema/channel";
import * as messageSchema from "./schema/message";

// 1. Combine all schemas into one object
const schema = {
  ...authSchema,
  ...channelSchema,
  ...messageSchema,
};

// 2. Pass the schema to the drizzle instance
// This enables the db.query API and relations
export const db = drizzle(process.env.DATABASE_URL || "", { schema });

// 3. Export types and schema definitions for use in other packages
export * from "./schema/auth";
export * from "./schema/channel";
export * from "./schema/message";
