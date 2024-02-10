import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { Messages } from "../schema";

export const getMessagesByRoomId = async (
	db: DrizzleD1Database,
	roomId: string,
) => {
	return db.select().from(Messages).where(eq(Messages.roomId, roomId)).all();
};
