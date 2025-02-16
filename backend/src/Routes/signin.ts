import { prisma } from "../serverconfig/prisma";
import bcrypt from "bcrypt";

export const signin = async (req: any, res: any) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Enter valid username or password" });
    return;
  }

  prisma.user
    .findUnique({
      where: {
        username: username,
      },
    })
    .then(async (data) => {
      if (data && (await bcrypt.compare(password, data.password))) {
        res.json({ message: "Success" });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    })
    .catch((error) => {
      res.status(401).json({ error: "Invalid credentials" });
    });
};