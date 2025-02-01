
import { io } from "../serverconfig/io";
import { map } from "../serverconfig/map";

export const deletemessage = async (socket: any, data: any) => {
    const { message, username, friendUsername, messageId } = data;
        if (!messageId) {
          socket.emit('delete-message', { error: "Message ID is required" });
          return;
        }
        if (!username) {
          socket.emit('delete-message', { error: "Username is required" });
          return;
        }
        const senderSocketId = map.get(username);
        const receiverSocketId = map.get(friendUsername);
        io.to([senderSocketId || "",receiverSocketId || ""]).emit("delete-message", { messageId });
}