import { prisma } from "../serverconfig/prisma";

export const getFriends = async (req: any, res: any) => {
     const username = req.query.username as string;
      const user = await prisma.user.findUnique({
        where: {
          username: username
        }
      });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const friends = await prisma.user.findUnique({
        where: {
          username: username
        }
      }).friends();
      if (!friends) {
        res.json([]);
        return;
      }
      res.json(friends.map((friend) => friend.username));
}