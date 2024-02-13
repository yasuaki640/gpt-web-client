import { MiddlewareHandler } from "hono";
import { basicAuth } from "hono/basic-auth";

import { AppEnv, Bindings, Variables } from "../types";

export const BasicAuthMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next,
) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  });
  return auth(c, next);
};
