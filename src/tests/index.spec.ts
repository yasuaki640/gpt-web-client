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

const MOCK_BINDINGS = {
  USERNAME: "test",
  PASSWORD: "test",
};

vi.mock("openai", () => {
  return {
    default: class {},
  };
});

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

describe("GET /chats", () => {
  it("should return a list of chat rooms", async () => {
    vi.mocked(getAllRooms).mockResolvedValue([
      {
        roomId: "test-roomId1",
        roomTitle: "test-roomTitle1",
        roomCreated: "2021-01-01T00:00:00Z",
        roomUpdated: "2021-01-02T00:00:00Z",
      },
      {
        roomId: "test-roomId2",
        roomTitle: "test-roomTitle2",
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
    expect(actual).toContain("test-roomId2");
    // @todo fix this
    // expect(actual).toContain("test-roomTitle1");
    // expect(actual).toContain("test-roomTitle2");
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

// describe("POST /chats/:roomId", () => {
//   it("should accept a new message and return to the chat room", async () => {
//     const roomId = "test-room-id";
//     const message = "Hello, World!";
//     mockGetRoom.mockResolvedValue({
//       roomId,
//       roomTitle: "Test Room",
//       roomCreated: "2021-01-01T00:00:00Z",
//       roomUpdated: "2021-01-02T00:00:00Z",
//     });
//
//     const res = await app.request(
//       `/chats/${roomId}`,
//       {
//         method: "POST",
//         body: new URLSearchParams({ message }),
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           Authorization: "Basic dGVzdDp0ZXN0",
//         },
//       },
//       MOCK_BINDINGS,
//     );
//
//     expect(res.status).toBe(302); // メッセージ投稿後はリダイレクトされる
//     expect(res.headers.get("Location")).toBe(`/chats/${roomId}`);
//     expect(mockInsertMessage).toHaveBeenCalledWith(
//       expect.anything(),
//       expect.arrayContaining([expect.objectContaining({ message })]),
//     );
//   });
// });
