import { FC } from "hono/dist/types/jsx";
import { Rooms } from "../schema";
import { formatTitle } from "../utils/format-tilte";

type Props = {
  rooms: (typeof Rooms.$inferSelect)[];
};

export const RoomList: FC<{ props: Props }> = ({ props }) => (
  <>
    <h1>Chat Rooms.</h1>
    <a href={"/chats/new"}>New</a>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Created</th>
          <th>Updated</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        {props.rooms.map((room) => (
          <tr>
            <td>{formatTitle(room)}</td>
            <td>{room.roomCreated}</td>
            <td>{room.roomUpdated}</td>
            <td>
              <a href={`/chats/${room.roomId}`}>Detail</a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);
