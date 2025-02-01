import { io } from "../serverconfig/io";
import { map } from "../serverconfig/map";
import { prisma } from "../serverconfig/prisma";

export const addFriend = async (req:any, res:any) => {
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
        connect: { id: friend.id }
      }
    }
  });

  await prisma.user.update({
    where: { id: friend.id },
    data: {
      friends: {
        connect: { id: user.id }
      }
    }
  });

  const userSocketId = map.get(username);
  const friendSocketId = map.get(friendUsername);

  if (userSocketId) {
    io.to(userSocketId).emit('friend-added', { friendUsername });
  }

  if (friendSocketId) {
    io.to(friendSocketId).emit('friend-added', { friendUsername: username });
  }

  res.json({ message: "Success" });
}