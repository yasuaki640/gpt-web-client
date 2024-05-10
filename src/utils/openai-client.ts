import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";

export const fetchCompletion = async (
  openai: OpenAI,
  newMessage: string,
  messageHistory?: ChatCompletionMessageParam[],
) =>
  openai.chat.completions.create({
    messages: [
      ...(messageHistory ?? []),
      { role: "user", content: newMessage },
    ],
    model: "gpt-4-turbo",
  });
