import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { Messages } from "../schema";

export const insertMessage = async (
  db: DrizzleD1Database,
  messages: (typeof Messages.$inferInsert)[],
) => {
  return db.insert(Messages).values(messages).execute();
};

export const getMessagesByRoomId = async (
  db: DrizzleD1Database,
  roomId: string,
) => {
  return db.select().from(Messages).where(eq(Messages.roomId, roomId)).all();
};
