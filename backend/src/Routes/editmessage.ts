import { io } from "../serverconfig/io";
import { map } from "../serverconfig/map";
import { prisma } from "../serverconfig/prisma";

export const editMessage = async (req: any, res: any) => {
    const { username, messageId, newContent } = req.body;
      console.log(messageId)
      console.log(newContent)
      if (!messageId || !newContent) {
        res.status(400).json({ error: "Message ID and new content are required" });
        return;
      }
    
      try {
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: { sender: true, receiver: true }
        });
    
        if (!message) {
          res.status(404).json({ error: "Message not found" });
          return;
        }
    
        if (message.sender.username !== username && message.receiver.username !== username) {
          res.status(403).json({ error: "You can only edit your own messages" });
          return;
        }
    
        await prisma.message.update({
          where: { id: messageId },
          data: { content: newContent , edited: true}
        });
    
        const senderSocketId = map.get(message.sender.username);
        const receiverSocketId = map.get(message.receiver.username);
    
        if (senderSocketId) {
          io.to(senderSocketId).emit('edit-message', { messageId, newContent });
        }
    
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('edit-message', { messageId, newContent });
        }
    
        res.json({ message: "Message edited successfully" });
      } catch (error:any) {
        if (error.code === 'P2025') {
          res.status(404).json({ error: "Message not found" });
        } else {
          console.error("Error in edit-message route:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      }
}