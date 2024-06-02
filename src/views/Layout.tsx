import type { FC } from "hono/dist/types/jsx";

export const Layout: FC = ({ children }) => (
  <html lang={"ja"}>
    <body>{children}</body>
  </html>
);
