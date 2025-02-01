
import { io } from "../serverconfig/io";
import { map } from "../serverconfig/map";
import { prisma } from "../serverconfig/prisma";

export const deleteMessage = async (req: any, res: any) => {
     const { username, messageId } = req.body;
      if (!messageId) {
        res.status(400).json({ error: "Message ID is required" });
        return;
      }
      if (!username) {
        res.status(400).json({ error: "Username is required" });
        return;
      }
      try {
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: { sender: true, receiver: true }
        });
        if (!message) {
          res.status(404).json({ error: "Message not foundddddd" });
          return;
        }
        if (message.sender.username !== username && message.receiver.username !== username) {
          res.status(403).json({ error: "You can only delete your own messages" });
          return;
        }
        await prisma.message.delete({
          where: { id: messageId }
        });
        const senderSocketId = map.get(message.sender.username);
        const receiverSocketId = map.get(message.receiver.username);
        if (senderSocketId) {
          io.to(senderSocketId).emit('delete-message', { messageId });
        }
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('delete-message', { messageId });
        }
        res.json({ message: "Message deleted successfully" });
      } catch (error:any) {
        if (error.code === 'P2025') {
          res.status(404).json({ error: "Message not found" });
        } else {
          res.status(500).json({ error: "Internal server error" });
        }
      }
}