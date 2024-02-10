import { FC } from "hono/dist/types/jsx";

type Props = {
	rooms: {
		roomId: string;
		roomCreated: string;
		roomUpdated: string;
	}[];
};

export const RoomList: FC<{ props: Props }> = ({ props }) => (
	<html lang={"ja"}>
		<body>
			<h1>Chat Rooms.</h1>
			<a href={"/chats/new"}>New</a>
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Created</th>
						<th>Updated</th>
						<th>Link</th>
					</tr>
				</thead>
				{props.rooms.map((room) => (
					<tbody>
						<tr>
							<td>{room.roomId}</td>
							<td>{room.roomCreated}</td>
							<td>{room.roomUpdated}</td>
							<td>
								<a href={`/chats/${room.roomId}`}>Detail</a>
							</td>
						</tr>
					</tbody>
				))}
			</table>
		</body>
	</html>
);
