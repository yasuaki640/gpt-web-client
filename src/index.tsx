import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import OpenAI from "openai";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { v4 as uuidv4 } from "uuid";
import { openaiMiddleware } from "./openai";
import {
	getMessagesByRoomId,
	insertMessage,
} from "./repositories/message-repository";
import { getAllRooms, getRoom } from "./repositories/room-repository";
import { Rooms } from "./schema";
import { NotFound } from "./views/NotFound";
import { Room } from "./views/Room";
import { RoomList } from "./views/RoomList";
import { Top } from "./views/Top";

export type Bindings = {
	USERNAME: string;
	PASSWORD: string;
	OPENAI_API_KEY: string;
	DB: D1Database;
};

export type Variables = {
	openai: OpenAI;
};

const app = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>();

app.use("*", async (c, next) => {
	const auth = basicAuth({
		username: c.env.USERNAME,
		password: c.env.PASSWORD,
	});
	return auth(c, next);
});

app.use("*", openaiMiddleware);

app.get("/", (c) => c.html(<Top />));

app.get("/chats", async (c) => {
	const db = drizzle(c.env.DB);
	const rooms = await getAllRooms(db);

	return c.html(<RoomList props={{ rooms }} />);
});

app.get("/chats/new", async (c) => {
	const roomId = uuidv4();
	const db = drizzle(c.env.DB);
	await db.insert(Rooms).values({ roomId }).execute();

	return c.redirect(`/chats/${roomId}`);
});

// @todo 後でテスト
const toHtml = async (md: string) => {
	const file = await unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeSanitize)
		.use(rehypeStringify)
		.process(md);

	return String(file);
};

app.get("/chats/:roomId", async (c) => {
	const { roomId } = c.req.param();

	const db = drizzle(c.env.DB);
	const room = await getRoom(db, roomId);
	if (!room) {
		return c.html(<NotFound props={{ message: "Room Not Found." }} />, 404);
	}

	const messages = await getMessagesByRoomId(db, roomId);

	const messagesHtml = await Promise.all(
		messages.map(async (message) => {
			const html = await toHtml(message.message);
			return {
				...message,
				message: html,
			};
		}),
	);

	return c.html(<Room props={{ room, message: messagesHtml }} />);
});

app.post("/chats/:roomId", async (c) => {
	const { roomId } = c.req.param();
	const formData = await c.req.formData();
	const newMessage = formData.get("message");
	if (!(typeof newMessage === "string")) {
		return c.redirect(`/chats/${roomId}`);
	}

	const db = drizzle(c.env.DB);
	const room = await getRoom(db, roomId);
	if (!room) {
		return c.html(<NotFound props={{ message: "Room Not Found." }} />, 404);
	}

	const messages = await getMessagesByRoomId(db, roomId);

	const rest = messages.map((m) => ({ role: m.sender, content: m.message }));

	// @todo 後で型を治す、schemaの名称をopenaiクライアントに寄せたい
	const res = await c.var.openai.chat.completions.create({
		messages: [...rest, { role: "user", content: newMessage }],
		model: "gpt-4-turbo-preview",
	});

	const resMessage = res.choices.map((c) => ({
		messageId: uuidv4(),
		roomId,
		sender: "assistant",
		message: c.message.content || "",
	}));

	await insertMessage(db, [
		{
			messageId: uuidv4(),
			roomId,
			sender: "user",
			message: newMessage,
		},
		...resMessage,
	]);

	return c.redirect(`/chats/${roomId}`);
});

export default app;
