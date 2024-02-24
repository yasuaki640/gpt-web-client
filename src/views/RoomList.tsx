import { FC } from "hono/dist/types/jsx";
import {Rooms} from "../schema";

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
          <th>ID</th>
          <th>Created</th>
          <th>Updated</th>
          <th>Link</th>
        </tr>
      </thead>
      {props.rooms.map((room) => (
        <tbody>
          <tr>
            <td>{room.roomTitle}</td>
            <td>{room.roomCreated}</td>
            <td>{room.roomUpdated}</td>
            <td>
              <a href={`/chats/${room.roomId}`}>Detail</a>
            </td>
          </tr>
        </tbody>
      ))}
    </table>
  </>
);
