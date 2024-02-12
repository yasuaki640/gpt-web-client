import { MiddlewareHandler } from "hono";
import { basicAuth } from "hono/basic-auth";
import { type Bindings, type Variables } from "../index";

export const BasicAuthMiddleware: MiddlewareHandler<{
	Bindings: Bindings;
	Variables: Variables;
}> = async (c, next) => {
	const auth = basicAuth({
		username: c.env.USERNAME,
		password: c.env.PASSWORD,
	});
	return auth(c, next);
};
