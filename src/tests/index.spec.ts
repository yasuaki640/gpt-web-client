import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../index";
import { Messages, Rooms } from "../schema";

const MOCK_ENV = {
	USERNAME: "test",
	PASSWORD: "test",
};

vi.mock("openai", () => {
	return {
		default: class {
			constructor() {}
		},
	};
});

const { getRoom } = vi.hoisted(() => ({
	getRoom: vi
		.fn<any, typeof Rooms.$inferSelect | undefined>()
		.mockResolvedValue({
			roomId: "test",
			roomTitle: "test",
			roomCreated: "2021-01-01T00:00:00Z",
			roomUpdated: "2021-01-01T00:00:00Z",
		}),
}));
vi.mock("../repositories/room-repository", () => ({
	getRoom,
}));

const { getMessagesByRoomId } = vi.hoisted(() => ({
	getMessagesByRoomId: vi
		.fn<any, (typeof Messages.$inferSelect)[]>()
		.mockResolvedValue([
			{
				messageId: "test",
				roomId: "test",
				sender: "test",
				message: "test",
				messageCreated: "2021-01-01T00:00:00Z",
			},
		]),
}));
vi.mock("../repositories/message-repository", () => ({
	getMessagesByRoomId,
}));

beforeEach(() => {
	vi.clearAllMocks();
});

describe("GET /chats/:id", () => {
	it("should return when basic auth failed", async () => {
		const res = await app.request("/chats/1", {}, MOCK_ENV);
		expect(res.status).toBe(401);
	});

	it("should return when specified room does not exist", async () => {
		getRoom.mockResolvedValue(undefined);

		const res = await app.request(
			"/chats/do-not-exist",
			{
				headers: {
					Authorization: "Basic dGVzdDp0ZXN0",
				},
			},
			MOCK_ENV,
		);

		expect(res.status).toBe(404);
		expect(await res.text()).toBe(
			'<html lang="ja"><body><h1>Room Not Found.</h1><a href="/chats">Back</a></body></html>',
		);
	});

	it("should return when specified room exists", async () => {
		getRoom.mockResolvedValue({
			roomId: "test",
			roomTitle: "test",
			roomCreated: "2021-01-01T00:00:00Z",
			roomUpdated: "2021-01-01T00:00:00Z",
		});

		const res = await app.request(
			"/chats/do-not-exist",
			{
				headers: {
					Authorization: "Basic dGVzdDp0ZXN0",
				},
			},
			MOCK_ENV,
		);

		expect(res.status).toBe(200);
		expect(await res.text()).toBe(
			'<html lang="ja"><body><h1>test</h1><a href="/chats">Back</a><table><thead><tr><th>ID</th><th>Created</th><th>Updated</th></tr></thead><tbody><tr><td>test</td><td>2021-01-01T00:00:00Z</td><td>2021-01-01T00:00:00Z</td></tr></tbody></table><hr/><div><p>2021-01-01T00:00:00Z</p><p>test</p><div><p>test</p></div><hr/></div><form method="post" action="/chats/test"><input type="text" name="message"/><button type="submit">Send</button></form></body></html>',
		);
	});
});
