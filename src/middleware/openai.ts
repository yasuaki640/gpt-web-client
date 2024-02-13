import { MiddlewareHandler } from "hono";
import OpenAI from "openai";

import { AppEnv } from "../types";

export const OpenaiMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const client = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY,
  });
  c.set("openai", client);
  await next();
};
