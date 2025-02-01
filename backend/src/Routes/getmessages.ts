import { prisma } from "../serverconfig/prisma";

export const getMessages = async (req: any, res: any) => {
      const username = req.query.username as string;
      const friend = req.query.friend as string;
      const sender = await prisma.user.findUnique({
        where: {
          username: username
        }
      }).catch((error) => {
        res.status(502).json({ error: "Invalid credentials" });
      });
      const receiver = await prisma.user.findUnique({
        where: {
          username: friend
        }
      }).catch((error) => {
        res.status(502).json({ error: "Invalid credentials" });
      });
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: sender?.id,
              receiverId: receiver?.id
            },
            {
              senderId: receiver?.id,
              receiverId: sender?.id
            }
          ]
        },
        include: {
          sender: true, // Include the sender field
          receiver: true // Include the receiver field
        }
      });
      res.json(messages);
}