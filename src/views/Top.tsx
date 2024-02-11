import { FC } from "hono/dist/types/jsx";

export const Top: FC = () => (
	<html lang={"ja"}>
		<body>
			<h1>gpt-web-client</h1>
			<a href={"/chats"}>Chats</a>
		</body>
	</html>
);
