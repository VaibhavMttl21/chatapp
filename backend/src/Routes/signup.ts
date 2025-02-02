import { prisma } from "../serverconfig/prisma";

export const signup = async (req : any, res: any) =>
{
     const { username, password } = req.body;
    
      if (!username || !password) {
         res.status(400).json({ error: "Enter valid username or password" });
      }
    
      prisma.user.create({
        data: {
          username: username,
          password: password
        }
      }).then((data) => {
        res.json(data);
      }).catch((error) => {
        if (error.code === 'P2002' && error.meta?.target.includes('username')) {
          res.status(409).json({ error: "Username already exists" });
        } else {
          res.status(502).json({ error: "An error occurred" });
        }
      });
}