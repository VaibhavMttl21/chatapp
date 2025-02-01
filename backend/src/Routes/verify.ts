import { prisma } from "../serverconfig/prisma";

export const verify = async (req:any, res:any)=>
{
    const username = req.body.username;
      prisma.user.findUnique({
        where: {
          username: username
        }
      }).then((data) => {
        if (data) {
          res.json({ message: "Success" });
        } else {
          res.status(401).json({ error: "Invalid credentials" });
        }
      }).catch((error) => {
        res.status(401).json({ error: "Invalid credentials" });
      });
}