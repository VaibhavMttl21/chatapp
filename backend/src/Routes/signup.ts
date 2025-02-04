import { prisma } from "../serverconfig/prisma";
import bcrypt from "bcrypt";

export const signup = async (req: any, res: any) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Enter valid username or password" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  prisma.user
    .create({
      data: {
        username: username,
        password: hashedPassword,
      },
    })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      if (error.code === "P2002" && error.meta?.target.includes("username")) {
        res.status(409).json({ error: "Username already exists" });
      } else {
        res.status(502).json({ error: "An error occurred" });
      }
    });
};