import { eq } from "drizzle-orm";
import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { Context } from "hono";
import type { Bindings, Variables } from "../index";
import { Messages, Rooms } from "../schema";

export class MessageRepositories {
	private db: DrizzleD1Database;
	constructor(
		c: Context<{ Bindings: Bindings; Variables: Variables }, string>,
	) {
		this.db = drizzle(c.env.DB);
	}

	async getAllByRoomId(roomId: string) {
		return this.db
			.select()
			.from(Messages)
			.where(eq(Messages.roomId, roomId))
			.all();
	}
}
