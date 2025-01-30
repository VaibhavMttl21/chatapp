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
io.use((socket, next) => {
  console.log("Query:", socket.handshake.headers.cookie);
  socket.data.username = socket.handshake.headers.cookie?.split("=")[1];
  if (!socket.data.username) {
    return next(new Error("Authentication"));
  }
  console.log(socket.data.username);
  next();
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

  const userSocketId = map.get(username);
  const friendSocketId = map.get(friendUsername);

  if (userSocketId) {
    io.to(userSocketId).emit('friend-added', { friendUsername });
  }

  if (friendSocketId) {
    io.to(friendSocketId).emit('friend-added', { friendUsername: username });
  }

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
    },
    include: {
      sender: true, // Include the sender field
      receiver: true // Include the receiver field
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

//delete
app.post("/delete-message", async (req, res) => {
  const { username, messageId } = req.body;
  
  console.log("Delete request received:", { username, messageId }); // Debugging log

  if (!messageId) {
    res.status(400).json({ error: "Message ID is required" });
    return;
  }

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { sender: true, receiver: true }
    });
    console.log('MESSAGEGHFHGFGGFHGHFFG',message)
    if (!message) {
      res.status(404).json({ error: "Message not foundddddd" });
      return;
    }
console.log("reached")
    if (message.sender.username !== username && message.receiver.username !== username) {
      res.status(403).json({ error: "You can only delete your own messages" });
      return;
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    const senderSocketId = map.get(message.sender.username);
    const receiverSocketId = map.get(message.receiver.username);

    if (senderSocketId) {
      io.to(senderSocketId).emit('delete-message', { messageId });
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('delete-message', { messageId });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error:any) {
    console.log(error)
    if (error.code === 'P2025') {
      res.status(404).json({ error: "Message not found" });
    } else {
      console.error("Error in delete-message route:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

io.on("connection", (socket) => {
  socket.on("chat message", async (data: any) => {
    const { message, username, friendUsername } = data;

    try {
      // Retrieve sender and receiver from the database
      const sender = await prisma.user.findUnique({
        where: { username },
      });

      const receiver = await prisma.user.findUnique({
        where: { username: friendUsername },
      });

      if (!sender || !receiver) {
        socket.emit("chat message", { error: "User not found" });
        return;
      }

      // Store the message in the database
      const newMessage = await prisma.message.create({
        data: {
          content: message,
          sender: {
            connect: { id: sender.id },
          },
          receiver: {
            connect: { id: receiver.id },
          },
        },
        include: {
          sender: true,
          receiver: true,
        },
      });

      // Emit the message to the receiver (if online)
      const recipientSocketId = map.get(friendUsername);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("chat message", {
          message: newMessage,
          senderUsername: sender.username,
          id: message.id
        });
      }
      const senderSocketId = map.get(username);
      // Emit the message back to the sender
      if (senderSocketId) {
        io.to(senderSocketId).emit("chat message", {
          message: newMessage,
          senderUsername: sender.username,
          id: message.id
        });
      }

    } catch (error) {
      console.error("Error handling chat message:", error);
      socket.emit("chat message", { error: "Failed to send message" });
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

  socket.on('delete-message', async (data: any) => {
    const { message, username, friendUsername, messageId } = data;
    console.log("Delete request received:", { messageId, username }); // Debugging log

    if (!messageId) {
      socket.emit('delete-message', { error: "Message ID is required" });
      return;
    }

    if (!username) {
      socket.emit('delete-message', { error: "Username is required" });
      return;
    }
    
    const senderSocketId = map.get(username);
    const receiverSocketId = map.get(friendUsername);
    console.log("Delete request received:", { messageId, username });
    // console.log(senderSocketId) // Debugging log
    // console .log(receiverSocketId) // Debugging log
    io.to([senderSocketId || "",receiverSocketId || ""]).emit("delete-message", { messageId });
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});