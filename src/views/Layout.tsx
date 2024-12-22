import type { PropsWithChildren } from "hono/jsx";

export const Layout = ({ children }: PropsWithChildren) => (
  <html lang={"ja"}>
    <head>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
      />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" />
      <script>hljs.highlightAll();</script>
      <title>gpt-web-client</title>
    </head>
    <body>{children}</body>
  </html>
);
