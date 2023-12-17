import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";

type Bindings = {
	USERNAME: string;
	PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(async (c, next) => {
	const auth = basicAuth({
		username: c.env.USERNAME,
		password: c.env.PASSWORD,
	});
	return auth(c, next);
});

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
