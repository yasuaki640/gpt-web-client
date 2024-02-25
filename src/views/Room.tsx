import { FC } from "hono/dist/types/jsx";
import { Messages, Rooms } from "../schema";
import { formatTitle } from "../utils/format-tilte";

type Props = {
  room: typeof Rooms.$inferSelect;
  message: (typeof Messages.$inferSelect)[];
};

export const Room: FC<{ props: Props }> = ({ props }) => (
  <>
    <h1>{formatTitle(props.room)}</h1>
    <a href={"/chats"}>Back</a>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Created</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{props.room.roomId}</td>
          <td>{props.room.roomCreated}</td>
          <td>{props.room.roomUpdated}</td>
        </tr>
      </tbody>
    </table>
    <hr />
    {props.message.length === 0 && <p>No messages.</p>}
    {props.message.map((message) => (
      <div>
        <p>{message.messageCreated}</p>
        <p>{message.sender}</p>
        {/* biome-ignore lint: lint/security/noDangerouslySetInnerHtml */}
        <div dangerouslySetInnerHTML={{ __html: message.message }} />
        <hr />
      </div>
    ))}
    <form method={"post"} action={`/chats/${props.room.roomId}`}>
      <input type={"text"} name={"message"} />
      <button type={"submit"}>Send</button>
    </form>
  </>
);
