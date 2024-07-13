import type { FC } from "hono/jsx";

export const Layout: FC = ({ children }) => (
  <html lang={"ja"}>
    <body>{children}</body>
  </html>
);
