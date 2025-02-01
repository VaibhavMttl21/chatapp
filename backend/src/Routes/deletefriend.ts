import { prisma } from "../serverconfig/prisma";

export const deleteFriend = async (req: any, res: any) => {
     const { username, friendUsername } = req.body;
      const user = await prisma.user.findUnique({
        where: {
          username: username
        }
      });
      const friend = await prisma.user.findUnique({
        where: {
          username: friendUsername
        }
      });
      if (!user || !friend) {
        res.status(404).json({ error: "User not found" });
        return;
      }
    
      await prisma.user.update({
        where: { id: user.id },
        data: {
          friends: {
            disconnect: { id: friend.id }
          }
        }
      });
    
      await prisma.user.update({
        where: { id: friend.id },
        data: {
          friends: {
            disconnect: { id: user.id }
          }
        }
      });
      res.json({ message: "Success" });
}