import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { BasicAuthMiddleware } from "./middleware/basic-auth";
import { LayoutMiddleware } from "./middleware/layout";
import { OpenaiMiddleware } from "./middleware/openai";
import {
  getMessagesByRoomId,
  insertMessage,
} from "./repositories/message-repository";
import {
  getAllRooms,
  getRoom,
  insertRoom,
  updateRoom,
} from "./repositories/room-repository";
import type { Messages } from "./schema";
import type { AppEnv } from "./types";
import { parseMarkdown } from "./utils/markdown";
import { fetchCompletion } from "./utils/openai-client";
import { NotFound } from "./views/NotFound";
import { Room } from "./views/Room";
import { RoomList } from "./views/RoomList";
import { Top } from "./views/Top";

const app = new Hono<AppEnv>();

// Middleware
app.use(BasicAuthMiddleware);
app.use(OpenaiMiddleware);
app.use(LayoutMiddleware);

app.get("/", (c) => c.render(<Top />));

app.get("/chats", async (c) => {
  const db = drizzle(c.env.DB);
  const rooms = await getAllRooms(db);

  return c.render(<RoomList props={{ rooms }} />);
});

app.get("/chats/new", async (c) => {
  const roomId = uuidv4();
  const db = drizzle(c.env.DB);
  await insertRoom(db, roomId);

  return c.redirect(`/chats/${roomId}`);
});

app.get("/chats/:roomId", async (c) => {
  const { roomId } = c.req.param();

  const db = drizzle(c.env.DB);
  const room = await getRoom(db, roomId);
  if (!room) {
    return c.render(<NotFound props={{ message: "Room Not Found." }} />);
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

  return c.render(<Room props={{ room, message: parsedMessages }} />);
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
    return c.render(<NotFound props={{ message: "Room Not Found." }} />);
  }

  const fetched = await getMessagesByRoomId(db, roomId);
  const messageHistory = fetched.map((m) => ({
    role: m.sender,
    content: m.message,
  }));

  // 題名の生成
  if (messageHistory.length === 0) {
    const completion = await fetchCompletion(
      c.var.openai,
      `次の質問に対して、短くわかりやすい題名をつけてください。「${newMessage}」`,
      undefined,
      { model: "gpt-4o-mini" },
    );
    const roomTitle = completion.choices[0].message.content;
    await updateRoom(db, roomId, { roomId, roomTitle });
  }

  // メッセージの生成と挿入
  const completion = await fetchCompletion(
    c.var.openai,
    newMessage,
    messageHistory,
    { model: "o1-preview" }, // MEMO: o1を使いたいが、日本語で返してくれないため、引き続き4oを使う
  );
  const resMessage = completion.choices.map<typeof Messages.$inferInsert>(
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
