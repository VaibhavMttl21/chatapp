import { io } from "../io";
import { map } from "../map";
import { prisma } from "../prisma";

export const chatmessage  = async(socket:any,data: any)=>
{
const { message, username, friendUsername } = data;

    try {
      const sender = await prisma.user.findUnique({
        where: { username },
      });

      const receiver = await prisma.user.findUnique({
        where: { username: friendUsername },
      });

      if (!sender || !receiver) {
        socket.emit("chat message", { error: "User not found" });
        return;
      }
      const newMessage = await prisma.message.create({
        data: {
          content: message,
          sender: {
            connect: { id: sender.id },
          },
          receiver: {
            connect: { id: receiver.id },
          },
        },
        include: {
          sender: true,
          receiver: true,
        },
      });
      const recipientSocketId = map.get(friendUsername);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("chat message", {
          message: newMessage,
          senderUsername: sender.username,
          id: message.id
        });
      }
      const senderSocketId = map.get(username);

      if (senderSocketId) {
        io.to(senderSocketId).emit("chat message", {
          message: newMessage,
          senderUsername: sender.username,
          id: message.id
        });
      }

    } catch (error) {
      console.error("Error handling chat message:", error);
      socket.emit("chat message", { error: "Failed to send message" });
    }
}