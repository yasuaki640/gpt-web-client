import { MiddlewareHandler } from "hono";
import OpenAI from "openai";
import { type Bindings, type Variables } from "../index";

export const OpenaiMiddleware: MiddlewareHandler<{
	Bindings: Bindings;
	Variables: Variables;
}> = async (c, next) => {
	const client = new OpenAI({
		apiKey: c.env.OPENAI_API_KEY,
	});
	c.set("openai", client);
	await next();
};
