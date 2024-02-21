import { desc, eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { Rooms } from "../schema";

export const insertRoom = async (db: DrizzleD1Database, roomId: string) => {
  return db.insert(Rooms).values({ roomId }).execute();
};

export const getRoom = async (db: DrizzleD1Database, roomId: string) => {
  return db.select().from(Rooms).where(eq(Rooms.roomId, roomId)).get();
};

export const getAllRooms = async (db: DrizzleD1Database) => {
  return db.select().from(Rooms).orderBy(desc(Rooms.roomUpdated)).all();
};

export const updateRoom = async (
  db: DrizzleD1Database,
  roomId: string,
  room: typeof Rooms.$inferInsert,
) => {
  return db.update(Rooms).set(room).where(eq(Rooms.roomId, roomId)).execute();
};
