import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { Rooms } from "../schema";

export const getRoom = async (db: DrizzleD1Database, roomId: string) => {
	return db.select().from(Rooms).where(eq(Rooms.roomId, roomId)).get();
};