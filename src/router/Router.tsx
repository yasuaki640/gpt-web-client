import { createBrowserRouter } from "react-router-dom";
import { RoomList } from "../pages/RoomList.tsx";
import { Chat } from "../pages/Chat.tsx";

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
    element: <h1>404</h1>,
  },
]);
