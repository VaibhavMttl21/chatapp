import { Dispatch, SetStateAction } from "react";
import { Socket } from "socket.io-client";

interface Message {
  id: number;
  content: string;
  senderUsername: string;
  timestamp: string;
  edited: boolean;
}

export const handleDeleteMessage = (
  messageId: number,
  socket: React.MutableRefObject<Socket | undefined>,
  username: string,
  setVisibleMessages: Dispatch<SetStateAction<Message[]>>
) => {
  socket.current?.emit("delete-message", { messageId, username });

  setVisibleMessages((prevMessages) =>
    prevMessages.filter((message) => message.id !== messageId)
  );

  fetch(`${import.meta.env.VITE_BACKEND_URL}/delete-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      messageId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error || "Failed to delete message");
      }
    });
};