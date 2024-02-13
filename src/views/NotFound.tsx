import { FC } from "hono/dist/types/jsx";

type Props = { message?: string };

export const NotFound: FC<{ props: Props }> = ({ props }) => (
  <html lang={"ja"}>
    <body>
      <h1>{props.message ? props.message : "Not Found"}</h1>
      <a href={"/chats"}>Back</a>
    </body>
  </html>
);
