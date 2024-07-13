import type { FC } from "hono/jsx";

type Props = { message?: string };

export const NotFound: FC<{ props: Props }> = ({ props }) => (
  <>
    <h1>{props.message ? props.message : "Not Found"}</h1>
    <a href={"/chats"}>Back</a>
  </>
);
