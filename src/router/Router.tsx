import { createBrowserRouter } from "react-router-dom";
import { RoomList } from "../pages/RoomList.tsx";
import { Chat } from "../pages/Chat.tsx";
import { NotFound } from "../pages/404.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RoomList />,
  },
  {
    path: "/chat/:id",
    element: <Chat />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
