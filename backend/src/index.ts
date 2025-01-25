import express from "express";
import { createServer } from "node:http";
import { join } from "node:path";
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from "@prisma/client";
const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","https://ms3fdsn4-5173.inc1.devtunnels.ms"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
const prisma = new PrismaClient();
const map = new Map<string, string>();
const buildPath = join(__dirname, "../../frontend/socket/dist");

app.use(cors({
  origin: ["http://localhost:5173","https://ms3fdsn4-5173.inc1.devtunnels.ms"],
  methods: ["GET", "POST"],
  credentials: true
})); // Enable CORS for all routes
app.use(express.static(buildPath));
app.use(express.json()); // To parse JSON bodies

// Signup
app.post("/signup", (req, res) => {
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
});

// Signin
app.post("/signin", (req, res) => {
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
});

app.post("/verify", (req, res) => {
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
});

app.post("/add-friend", async (req, res) => {
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
  res.json({ message: "Success" });
});

app.get("/getmessages", async (req, res) => {
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
    }
  });
  res.json(messages);
});

app.post("/message", async (req, res) => {
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
});

app.get("/getfriends", async (req, res) => {
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
});

io.use((socket, next) => {
  console.log("Query:", socket.handshake.headers.cookie);
  socket.data.username = socket.handshake.headers.cookie?.split("=")[1];
  if (!socket.data.username) {
    return next(new Error("Authentication"));
  }
  console.log(socket.data.username);
  next();
});

// Delete Friend
app.post("/delete-friend", async (req, res) => {
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
});

// Delete Message
app.post("/delete-message", async (req, res) => {
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

  const deletedMessage = await prisma.message.deleteMany({
    where: {
      content: message,
      senderId: sender.id,
      receiverId: receiver.id
    }
  });

  if (deletedMessage.count > 0) {
    res.json({ message: "Success" });
  } else {
    res.status(404).json({ error: "Message not found or you are not the sender" });
  }
});

io.on("connection", (socket) => {
  socket.on('chat message', (data: any) => {
    const { message, username } = data;
    const recipientSocketId = map.get(username);
    console.log("Recipient:", recipientSocketId, message, username);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('chat message', { message, username: socket.data.username });
    }
  });

  socket.on('setusername', (username: string) => {
    map.set(username, socket.id);
    socket.data.username = username;
    console.log(map);
  });

  socket.on('disconnect', () => {
    map.delete(socket.data.username);
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});