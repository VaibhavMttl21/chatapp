import { prisma } from "../prisma";

export const Messages = async (req: any, res: any) => {
     const { username, friendUsername, message } = req.body;
    
      const sender = await prisma.user.findUnique({
        where: { username }
      });
    
      const receiver = await prisma.user.findUnique({
        where: { username: friendUsername }
      });
    
      if (!sender || !receiver) {
        res.status(404).json({ error: "User not found" });
        return;
      }
    
      const newMessage = await prisma.message.create({
        data: {
          content: message || "",
          sender: {
            connect: { id: sender.id }
          },
          receiver: {
            connect: { id: receiver.id }
          }
        }
      });
      res.json(newMessage);
}