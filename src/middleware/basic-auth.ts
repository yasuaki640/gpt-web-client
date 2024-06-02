import { basicAuth } from "hono/basic-auth";
import { createMiddleware } from "hono/factory";

import type { AppEnv } from "../types";

export const BasicAuthMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  });
  return auth(c, next);
});
