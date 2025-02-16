import { Socket } from "socket.io-client";

export const handleEditMessage = (
  messageId: number,
  newContent: string,
  socket: React.MutableRefObject<Socket | undefined>,
  username: string,
  currentChat: React.MutableRefObject<string>
) => {
  socket.current?.emit("edit-message", {
    messageId,
    username,
    newContent,
    friendUsername: currentChat.current,
  });

  fetch(`${import.meta.env.VITE_BACKEND_URL}/edit-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      messageId,
      newContent,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error || "Failed to edit message");
      }
    });
  console.log("Message edited");
};