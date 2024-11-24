import type OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";

export const fetchCompletion = async (
  openai: OpenAI,
  newMessage: string,
  messageHistory?: ChatCompletionMessageParam[],
  bodyOverride?: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming>,
) =>
  openai.chat.completions.create({
    messages: [
      ...(messageHistory ?? []),
      { role: "user", content: newMessage },
    ],
    model: "o1-preview",
    ...bodyOverride,
  });
