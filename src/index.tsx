import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import OpenAI from "openai";
import { openaiMiddleware } from "./openai";
import { rooms } from "./schema";

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
			</body>
		</html>,
	),
);

app.get("/chat", async (c) => {
	const db = drizzle(c.env.DB);
	const res = await db.select().from(rooms).all();
	// await db.insert(rooms).values({ roomId: "test" }).run();
	console.log(res);
	const chatCompletion = await c.var.openai.chat.completions.create({
		messages: [{ role: "user", content: "Say this is a test" }],
		model: "gpt-3.5-turbo",
	});

	return c.html(
		<html lang={"ja"}>
			<body>
				<h1>{JSON.stringify(res)}</h1>
				<ul>
					{chatCompletion.choices.map((c) => (
						<li>
							{c.message.role} : {c.message.content}
						</li>
					))}
				</ul>
				<form action={"/chat"} method={"post"}>
					<textarea id={"chat"} />
					<button type={"submit"}>Send</button>
				</form>
			</body>
		</html>,
	);
});

export default app;
