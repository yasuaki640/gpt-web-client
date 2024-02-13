import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { BasicAuthMiddleware } from "./middleware/basic-auth";
import { OpenaiMiddleware } from "./middleware/openai";
import {
  getMessagesByRoomId,
  insertMessage,
} from "./repositories/message-repository";
import { getAllRooms, getRoom } from "./repositories/room-repository";
import { Messages, Rooms } from "./schema";
import type { AppEnv } from "./types";
import { parseMarkdown } from "./utils/markdown";
import { NotFound } from "./views/NotFound";
import { Room } from "./views/Room";
import { RoomList } from "./views/RoomList";
import { Top } from "./views/Top";

const app = new Hono<AppEnv>();

// Middleware
app.use(BasicAuthMiddleware);
app.use(OpenaiMiddleware);

app.get("/", (c) => c.html(<Top />));

app.get("/chats", async (c) => {
  const db = drizzle(c.env.DB);
  const rooms = await getAllRooms(db);

  return c.html(<RoomList props={{ rooms }} />);
});

app.get("/chats/new", async (c) => {
  const roomId = uuidv4();
  const db = drizzle(c.env.DB);
  await db.insert(Rooms).values({ roomId }).execute();

  return c.redirect(`/chats/${roomId}`);
});

app.get("/chats/:roomId", async (c) => {
  const { roomId } = c.req.param();

  const db = drizzle(c.env.DB);
  const room = await getRoom(db, roomId);
  if (!room) {
    return c.html(<NotFound props={{ message: "Room Not Found." }} />, 404);
  }

  const fetched = await getMessagesByRoomId(db, roomId);
  const parsedMessages = await Promise.all(
    fetched.map(async (message) => {
      const html = await parseMarkdown(message.message);
      return {
        ...message,
        message: html,
      };
    }),
  );

  return c.html(<Room props={{ room, message: parsedMessages }} />);
});

app.post("/chats/:roomId", async (c) => {
  const { roomId } = c.req.param();
  const formData = await c.req.formData();
  const newMessage = formData.get("message");
  if (!(typeof newMessage === "string")) {
    return c.redirect(`/chats/${roomId}`);
  }

  const db = drizzle(c.env.DB);
  const room = await getRoom(db, roomId);
  if (!room) {
    return c.html(<NotFound props={{ message: "Room Not Found." }} />, 404);
  }

  const fetched = await getMessagesByRoomId(db, roomId);
  const messageHistory = fetched.map((m) => ({
    role: m.sender,
    content: m.message,
  }));
  const openaiRes = await c.var.openai.chat.completions.create({
    messages: [...messageHistory, { role: "user", content: newMessage }],
    model: "gpt-4-turbo-preview",
  });

  const resMessage = openaiRes.choices.map<typeof Messages.$inferInsert>(
    (c) => ({
      messageId: uuidv4(),
      roomId,
      sender: "assistant",
      message: c.message.content || "",
    }),
  );
  const reqMessage: typeof Messages.$inferInsert = {
    messageId: uuidv4(),
    roomId,
    sender: "user",
    message: newMessage,
  };
  await insertMessage(db, [reqMessage, ...resMessage]);

  return c.redirect(`/chats/${roomId}`);
});

export default app;
