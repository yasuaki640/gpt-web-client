import type { FC } from "hono/jsx";
import type { Messages, Rooms } from "../schema";
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
      <div key={message.messageId}>
        <p>{message.messageCreated}</p>
        <p>{message.sender}</p>
        {/* biome-ignore lint: lint/security/noDangerouslySetInnerHtml */}
        <div dangerouslySetInnerHTML={{ __html: message.message }} />
        <hr />
      </div>
    ))}
    <form method={"post"} action={`/chats/${props.room.roomId}`}>
      <textarea name={"message"} style={{ height: "200px" }} />
      <div>
        <button type={"submit"}>Send</button>
      </div>
    </form>
  </>
);
