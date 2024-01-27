import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Rooms = sqliteTable("Rooms", {
	roomId: text("roomId").primaryKey(),
	roomCreated: text("roomCreated")
		.notNull()
		.default(sql.raw("CURRENT_TIMESTAMP")),
	roomUpdated: text("roomUpdated")
		.notNull()
		.default(sql.raw("CURRENT_TIMESTAMP")),
});
