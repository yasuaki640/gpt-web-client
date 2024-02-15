import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../index";
import { getMessagesByRoomId } from "../repositories/message-repository";
import { getRoom } from "../repositories/room-repository";

const MOCK_BINDINGS = {
  USERNAME: "test",
  PASSWORD: "test",
};

vi.mock("openai", () => {
  return {
    default: class {},
  };
});

const { mockGetRoom } = vi.hoisted(() => ({
  mockGetRoom: vi
    .fn<Parameters<typeof getRoom>, ReturnType<typeof getRoom>>()
    .mockResolvedValue({
      roomId: "test-room-id",
      roomTitle: "test-room-title",
      roomCreated: "2021-01-01T00:00:00Z",
      roomUpdated: "2021-01-01T00:00:00Z",
    }),
}));
vi.mock("../repositories/room-repository", () => ({
  getRoom: mockGetRoom,
}));

const { mockGetMessagesByRoomId } = vi.hoisted(() => ({
  mockGetMessagesByRoomId: vi
    .fn<
      Parameters<typeof getMessagesByRoomId>,
      ReturnType<typeof getMessagesByRoomId>
    >()
    .mockResolvedValue([
      {
        messageId: "test",
        roomId: "test",
        sender: "user",
        message: "test",
        messageCreated: "2021-01-01T00:00:00Z",
      },
    ]),
}));
vi.mock("../repositories/message-repository", () => ({
  getMessagesByRoomId: mockGetMessagesByRoomId,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /chats/:id", () => {
  it("should return when basic auth failed", async () => {
    const res = await app.request("/chats/1", {}, MOCK_BINDINGS);
    expect(res.status).toBe(401);
  });

  it("should return when specified room does not exist", async () => {
    mockGetRoom.mockResolvedValue(undefined);

    const res = await app.request(
      "/chats/do-not-exist",
      {
        headers: {
          Authorization: "Basic dGVzdDp0ZXN0",
        },
      },
      MOCK_BINDINGS,
    );

    expect(await res.text()).toContain("Room Not Found.");
  });

  it("should return when specified room exists", async () => {
    mockGetRoom.mockResolvedValue({
      roomId: "test-room-id",
      roomTitle: "test-room-title",
      roomCreated: "2021-01-01T00:00:00Z",
      roomUpdated: "2023-01-01T00:00:00Z",
    });

    const res = await app.request(
      "/chats/do-not-exist",
      {
        headers: {
          Authorization: "Basic dGVzdDp0ZXN0",
        },
      },
      MOCK_BINDINGS,
    );

    const actual = await res.text();
    expect(actual).toContain("test-room-id");
    // @todo fix this
    // expect(actual).toContain("test-room-title");
    expect(actual).toContain("2021-01-01T00:00:00Z");
    expect(actual).toContain("2023-01-01T00:00:00Z");
  });
});
