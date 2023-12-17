import { Hono } from "hono";

const app = new Hono();e

app.get("/", (c) =>
	c.html(
		<html lang={"ja"}>
			<body>
				<h1>Hello World</h1>
			</body>
		</html>,
	),
);

export default app;
