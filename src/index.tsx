import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import OpenAI from "openai";
import { openaiMiddleware } from "./openai";

export type Bindings = {
	USERNAME: string;
	PASSWORD: string;
	OPENAI_API_KEY: string;
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
	const chatCompletion = await c.var.openai.chat.completions.create({
		messages: [{ role: "user", content: "Say this is a test" }],
		model: "gpt-3.5-turbo",
	});

	return c.html(
		<html lang={"ja"}>
			<body>
				<textarea id={"chat"} />
				<button type={"submit"}>Send</button>
			</body>
		</html>,
	);
});

export default app;
