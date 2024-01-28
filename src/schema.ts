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

export const Messages = sqliteTable("messages", {
	messageId: text("messageId").primaryKey(),
	roomId: text("roomId").notNull(), // TODO 後で外部キー制約つける
	sender: text("sender").notNull(),
	message: text("message").notNull(),
	messageCreated: text("messageCreated")
		.notNull()
		.default(sql.raw("CURRENT_TIMESTAMP")),
});
