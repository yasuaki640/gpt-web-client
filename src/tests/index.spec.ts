import {beforeEach, describe, expect, it, vi} from "vitest";
import app from "../index";

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

const { RoomRepositories } = vi.hoisted(() => {
	const RoomRepositories = vi.fn();
	RoomRepositories.prototype.getRoom = vi.fn();
	RoomRepositories.prototype.getRoom.mockResolvedValue({
		roomId: "1",
		roomName: "test",
	});
	return { RoomRepositories };
});

beforeEach(() => {
	vi.clearAllMocks();
});

describe("GET /chats/:id", () => {
	it("should return when basic auth failed", async () => {
		const res = await app.request("/chats/1", {}, MOCK_ENV);
		expect(res.status).toBe(401);
	});

	it("should return when specified room does not exist", async () => {
		vi.mock("openai", () => {
			return {
				default: class {
					constructor() {}
				},
			};
		});

		vi.mock("../repositories/RoomRepositories", () => {
			RoomRepositories.prototype.getRoom.mockResolvedValue(undefined);
			return { RoomRepositories };
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

		expect(res.status).toBe(404);
		expect(await res.text()).toBe(
			'<html lang="ja"><body><h1>Room Not Found.</h1><a href="/chats">Back</a></body></html>',
		);
	});
});