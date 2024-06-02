import { describe, expect, it } from "vitest";
import type { Rooms } from "../schema";
import { formatTitle } from "./format-tilte";

describe("formatTitle", () => {
  it("should return the room ID if roomTitle is falsy", () => {
    const room: typeof Rooms.$inferSelect = {
      roomId: "test-room-id",
      roomTitle: null,
      roomCreated: "2021-01-01T00:00:00Z",
      roomUpdated: "2021-01-01T00:00:00Z",
    };

    const result = formatTitle(room);

    expect(result).toBe("test-room-id");
  });

  it("should truncate the roomTitle if it exceeds the specified length", () => {
    const room: typeof Rooms.$inferSelect = {
      roomId: "test-room-id",
      roomTitle: "This is a very long room title",
      roomCreated: "2021-01-01T00:00:00Z",
      roomUpdated: "2021-01-01T00:00:00Z",
    };

    const result = formatTitle(room, 10);

    expect(result).toBe("This is a ...");
  });

  it("should return the roomTitle as is if it does not exceed the specified length", () => {
    const room: typeof Rooms.$inferSelect = {
      roomId: "test-room-id",
      roomTitle: "Short title",
      roomCreated: "2021-01-01T00:00:00Z",
      roomUpdated: "2021-01-01T00:00:00Z",
    };

    const result = formatTitle(room, 20);

    expect(result).toBe("Short title");
  });
});
