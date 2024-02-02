import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { openaiMiddleware } from "./openai";
import { Messages, Rooms } from "./schema";

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

app.get("/", (c) =>
	c.html(
		<html lang={"ja"}>
			<body>
				<h1>Hello World</h1>
				<a href={"/chats"}>Chats</a>
			</body>
		</html>,
	),
);

app.get("/chats", async (c) => {
	const db = drizzle(c.env.DB);
	const rooms = await db
		.select()
		.from(Rooms)
		.orderBy(desc(Rooms.roomUpdated))
		.all();

	return c.html(
		<html lang={"ja"}>
			<body>
				<h1>Chat Rooms.</h1>
				<a href={"/chats/new"}>New</a>
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Created</th>
							<th>Updated</th>
							<th>Link</th>
						</tr>
					</thead>
					{rooms.map((room) => (
						<tbody>
							<tr>
								<td>{room.roomId}</td>
								<td>{room.roomCreated}</td>
								<td>{room.roomUpdated}</td>
								<td>
									<a href={`/chats/${room.roomId}`}>Detail</a>
								</td>
							</tr>
						</tbody>
					))}
				</table>
			</body>
		</html>,
	);
});

app.get("/chats/new", async (c) => {
	const roomId = uuidv4();
	const db = drizzle(c.env.DB);
	await db.insert(Rooms).values({ roomId }).execute();

	return c.redirect(`/chats/${roomId}`);
});

app.get("/chats/:roomId", async (c) => {
	const { roomId } = c.req.param();

	const db = drizzle(c.env.DB);
	const room = await db
		.select()
		.from(Rooms)
		.where(eq(Rooms.roomId, roomId))
		.get();
	if (!room) {
		return c.html(
			<html lang={"ja"}>
				<body>
					<h1>Room Not Found.</h1>
					<a href={"/chats"}>Back</a>
				</body>
			</html>,
		);
	}

	const messages = await db
		.select()
		.from(Messages)
		.where(eq(Messages.roomId, roomId))
		.all();

	return c.html(
		<html lang={"ja"}>
			<body>
				<h1>{room.roomId}</h1>
				<a href={"/chats"}>Back</a>
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Created</th>
							<th>Updated</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{room.roomId}</td>
							<td>{room.roomCreated}</td>
							<td>{room.roomUpdated}</td>
						</tr>
					</tbody>
				</table>
				<hr />
				{messages.length === 0 && <p>No messages.</p>}
				{messages.map((message) => (
					<div>
						<p>{message.messageCreated}</p>
						<p>{message.sender}</p>
						<p>{message.message}</p>
						<hr />
					</div>
				))}
				<form method={"post"} action={`/chats/${room.roomId}`}>
					<input type={"text"} name={"message"} />
					<button type={"submit"}>Send</button>
				</form>
			</body>
		</html>,
	);
});

app.post("/chats/:roomId", async (c) => {
	const { roomId } = c.req.param();
	const formData = await c.req.formData();
	const newMessage = formData.get("message");
	if (!(typeof newMessage === "string")) {
		return c.redirect(`/chats/${roomId}`);
	}

	const db = drizzle(c.env.DB);
	const room = await db
		.select()
		.from(Rooms)
		.where(eq(Rooms.roomId, roomId))
		.get();
	if (!room) {
		return c.html(
			<html lang={"ja"}>
				<body>
					<h1>Room Not Found.</h1>
					<a href={"/chats"}>Back</a>
				</body>
			</html>,
		);
	}

	const messages = await db
		.select()
		.from(Messages)
		.where(eq(Messages.roomId, roomId))
		.all();

	const rest = messages.map((m) => ({ role: m.sender, content: m.message }));

	// @todo 後で型を治す、schemaの名称をopenaiクライアントに寄せたい
	const res = await c.var.openai.chat.completions.create({
		messages: [...rest, { role: "user", content: newMessage }],
		model: "gpt-4-turbo-preview",
	});

	await db
		.insert(Messages)
		.values([
			{
				messageId: uuidv4(),
				roomId,
				sender: "user",
				message: newMessage,
			},
			{
				messageId: uuidv4(),
				roomId,
				sender: "assistant",
				message: res.choices[0].message.content || "",
			},
		])
		.execute();

	return c.redirect(`/chats/${roomId}`);
});

export default app;
