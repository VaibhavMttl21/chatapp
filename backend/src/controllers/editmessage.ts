import { io } from "../serverconfig/io";
import { map } from "../serverconfig/map";

export const editmessage = async(socket:any, data: any) =>
{
    const {  username, friendUsername, messageId,newContent } = data;
    console.log("edit request received:", { messageId, username,friendUsername,newContent }); // Debugging log
  
    if (!messageId) {
      socket.emit('edit-message', { error: "Message ID is required" });
      return;
    }
  
    if (!username) {
      socket.emit('edit-message', { error: "Username is required" });
      return;
    }
    
    const senderSocketId = map.get(username);
    const receiverSocketId = map.get(friendUsername);
    console.log("edit request received:", { messageId, username });
    // console.log(senderSocketId) // Debugging log
    // console .log(receiverSocketId) // Debugging log

    io.to([senderSocketId || "",receiverSocketId || ""]).emit("edit-message", { messageId,newContent });
}