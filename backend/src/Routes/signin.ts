import { prisma } from "../prisma";

export const signin = async(req:any,res:any)=>
{
    prisma.user.findUnique({
        where: {
          username: req.body.username || ""
        }
      }).then((data) => {
        if (data?.password === req.body.password) {
          res.json({ message: "Success" });
        } else {
          res.status(401).json({ error: "Invalid credentials" });
        }
      }).catch((error) => {
        res.status(401).json({ error: "Invalid credentials" });
      });
}