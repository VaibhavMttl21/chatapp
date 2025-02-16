import { Dispatch, SetStateAction } from "react";

interface Message {
  id: number;
  content: string;
  senderUsername: string;
  timestamp: string;
  edited: boolean;
}

export const Deletemessage = (
  setVisibleMessages: Dispatch<SetStateAction<Message[]>>,
  messageId: number
) => {
  setVisibleMessages((prevMessages) =>
    prevMessages.filter((message) => message.id !== messageId)
  );
};