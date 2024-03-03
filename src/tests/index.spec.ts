import { DrizzleD1Database } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../index";
import {
  getMessagesByRoomId,
  insertMessage,
} from "../repositories/message-repository";
import {
  getAllRooms,
  getRoom,
  insertRoom,
} from "../repositories/room-repository";
import { fetchCompletion } from "../utils/openai-client";

const MOCK_BINDINGS = {
  USERNAME: "test",
  PASSWORD: "test",
};

vi.mock("openai", () => {
  return {
    default: class {},
  };
});

const { mockFetchCompletion } = vi.hoisted(() => ({
  mockFetchCompletion: vi
    .fn<
      Parameters<typeof fetchCompletion>,
      ReturnType<typeof fetchCompletion>
    >()
    .mockResolvedValue({
      // @ts-expect-error
      choices: [{ message: { content: "test" } }],
    }),
}));
vi.mock("../utils/openai-client", () => ({
  fetchCompletion: mockFetchCompletion,
}));

const { mockInsertRoom, mockGetRoom, mockGetAllRooms } = vi.hoisted(() => ({
  mockInsertRoom: vi.fn<
    Parameters<typeof insertRoom>,
    ReturnType<typeof insertRoom>
  >(),
  mockGetRoom: vi
    .fn<Parameters<typeof getRoom>, ReturnType<typeof getRoom>>()
    .mockResolvedValue({
      roomId: "test-room-id",
      roomTitle: "test-room-title",
      roomCreated: "2021-01-01T00:00:00Z",
      roomUpdated: "2021-01-01T00:00:00Z",
    }),
  mockGetAllRooms: vi
    .fn<Parameters<typeof getAllRooms>, ReturnType<typeof getAllRooms>>()
    .mockResolvedValue([
      {
        roomId: "test-room-id-1",
        roomTitle: "test-room-title-1",
        roomCreated: "2021-01-01",
        roomUpdated: "2021-01-01",
      },
      {
        roomId: "test-room-id-2",
        roomTitle: "test-room-title-2",
        roomCreated: "2023-01-01T00:00:00Z",
        roomUpdated: "2023-01-01T00:00:00Z",
      },
    ]),
}));
vi.mock("../repositories/room-repository", () => ({
  insertRoom: mockInsertRoom,
  getRoom: mockGetRoom,
  getAllRooms: mockGetAllRooms,
}));

const { mockGetMessagesByRoomId, mockInsertMessage } = vi.hoisted(() => ({
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
  mockInsertMessage: vi.fn<
    Parameters<typeof insertMessage>,
    ReturnType<typeof insertMessage>
  >(),
}));
vi.mock("../repositories/message-repository", () => ({
  getMessagesByRoomId: mockGetMessagesByRoomId,
  insertMessage: mockInsertMessage,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /chats", () => {
  it("should return a list of chat rooms", async () => {
    vi.mocked(getAllRooms).mockResolvedValue([
      {
        roomId: "test-roomId1",
        roomTitle: null,
        roomCreated: "2021-01-01T00:00:00Z",
        roomUpdated: "2021-01-02T00:00:00Z",
      },
      {
        roomId: "test-roomId2",
        roomTitle: "test-roomTitle2test-roomTitle2test-roomTitle2",
        roomCreated: "2033-02-01T00:00:00Z",
        roomUpdated: "2033-02-02T00:00:00Z",
      },
    ]);

    const res = await app.request(
      "/chats",
      {
        headers: {
          Authorization: "Basic dGVzdDp0ZXN0",
        },
      },
      MOCK_BINDINGS,
    );
    expect(res.status).toBe(200);
    const actual = await res.text();
    expect(actual).toContain("test-roomId1");
    expect(actual).not.toContain("<td>test-roomId2</td>");
    expect(actual).toContain("test-roomTitle2test-...");
    expect(actual).toContain("2021-01-01T00:00:00Z");
    expect(actual).toContain("2033-02-01T00:00:00Z");
  });
});

describe("GET /chats/new", () => {
  it("should create a new chat room and redirect", async () => {
    const res = await app.request(
      "/chats/new",
      {
        method: "GET",
        headers: {
          Authorization: "Basic dGVzdDp0ZXN0",
        },
      },
      MOCK_BINDINGS,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toMatch(/^\/chats\/[a-z0-9-]+$/);
  });
});

describe("GET /chats/:roomId", () => {
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
    expect(actual).toContain("test-room-title");
    expect(actual).toContain("2021-01-01T00:00:00Z");
    expect(actual).toContain("2023-01-01T00:00:00Z");
  });
});

describe("POST /chats/:roomId", () => {
  it("should accept a new message and return to the chat room", async () => {
    mockGetRoom.mockResolvedValue({
      roomId: "test-room-id",
      roomTitle: "Test Room",
      roomCreated: "2021-01-01T00:00:00Z",
      roomUpdated: "2021-01-02T00:00:00Z",
    });

    const res = await app.request(
      "/chats/test-room-id",
      {
        method: "POST",
        body: new URLSearchParams({ message: "Hello, World!" }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic dGVzdDp0ZXN0",
        },
      },
      MOCK_BINDINGS,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/chats/test-room-id");
    expect(mockInsertMessage).toHaveBeenCalledWith(
      expect.any(DrizzleD1Database),
      expect.arrayContaining([
        expect.objectContaining({ message: "Hello, World!" }),
      ]),
    );
  });
});
