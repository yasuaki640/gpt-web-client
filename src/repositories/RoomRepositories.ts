import { eq } from "drizzle-orm";
import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { Context } from "hono";
import type { Bindings, Variables } from "../index";
import { Rooms } from "../schema";

export class RoomRepositories {
	private db: DrizzleD1Database;
	constructor(
		c: Context<{ Bindings: Bindings; Variables: Variables }, string>,
	) {
		this.db = drizzle(c.env.DB);
	}

	async getRoom(roomId: string) {
		return this.db.select().from(Rooms).where(eq(Rooms.roomId, roomId)).get();
	}
}
