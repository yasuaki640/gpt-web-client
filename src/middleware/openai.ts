import { createMiddleware } from "hono/factory";
import OpenAI from "openai";
import type { AppEnv } from "../types";

export const OpenaiMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const client = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY,
  });
  c.set("openai", client);
  await next();
});
