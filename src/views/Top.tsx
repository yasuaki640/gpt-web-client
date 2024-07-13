import type { FC } from "hono/jsx";

export const Top: FC = () => (
  <>
    <h1>gpt-web-client</h1>
    <a href={"/chats"}>Chats</a>
  </>
);
