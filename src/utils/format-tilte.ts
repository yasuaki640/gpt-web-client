import { Rooms } from "../schema";

export const formatTitle = (room: typeof Rooms.$inferSelect, len = 20) => {
  if (!room.roomTitle) {
    return room.roomId;
  }
  return room.roomTitle.length > len
    ? `${room.roomTitle.slice(0, len)}...`
    : room.roomTitle;
};
