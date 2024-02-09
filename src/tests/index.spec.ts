import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../index";

const MOCK_ENV = {
	USERNAME: "test",
	PASSWORD: "test",
};

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
		// @todo pathなんとかする configでrootを指定するとか？
		vi.mock("../repositories/RoomRepositories", () => {
			const RoomRepositories = vi.fn();
			RoomRepositories.prototype.getRoom = vi.fn();
			RoomRepositories.prototype.getRoom.mockResolvedValue(null);
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
	});
});
