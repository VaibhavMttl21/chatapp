
import { io } from "../serverconfig/io";
import { map } from "../serverconfig/map";

export const deletemessage = async (socket: any, data: any) => {
    const { message, username, friendUsername, messageId } = data;
        console.log("Delete request received:", { messageId, username }); // Debugging log
    
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
        console.log("Delete request received:", { messageId, username });
        // console.log(senderSocketId) // Debugging log
        // console .log(receiverSocketId) // Debugging log
        io.to([senderSocketId || "",receiverSocketId || ""]).emit("delete-message", { messageId });
}