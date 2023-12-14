import { useParams } from "react-router-dom";
import { type FC } from "react";

export const Chat: FC = () => {
  const { id } = useParams();
  return <h1>Chat of {id}</h1>;
};
