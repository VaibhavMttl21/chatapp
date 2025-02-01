import { join } from "node:path";
import express from "express";
import cors from 'cors';
import { app, io, server } from "./serverconfig/io";
import { map } from "./serverconfig/map";
import { addFriend } from "./Routes/addfriend";
import { verify } from "./Routes/verify";
import { signin } from "./Routes/signin";
import { signup } from "./Routes/signup";
import { getMessages } from "./Routes/getmessages";
import { Messages } from "./Routes/message";
import { getFriends } from "./Routes/getfriends";
import { deleteFriend } from "./Routes/deletefriend";
import { editMessage } from "./Routes/editmessage";
import { deleteMessage } from "./Routes/deletemessage";
import { chatmessage } from "./controllers/chatmessage";
import { setusername } from "./controllers/setusername";
import { deletemessage } from "./controllers/deletemessage";
import { editmessage } from "./controllers/editmessage";

const buildPath = join(__dirname, "../../frontend/socket/dist");
app.use(cors({
  origin: ["http://localhost:5173","https://ms3fdsn4-5173.inc1.devtunnels.ms"],
  methods: ["GET", "POST"],
  credentials: true
})); 
app.use(express.static(buildPath));
app.use(express.json()); 

io.use((socket, next) => {
  console.log("Query:", socket.handshake.headers.cookie);
  socket.data.username = socket.handshake.headers.cookie?.split("=")[1];
  if (!socket.data.username) {
    return next(new Error("Authentication"));
  }
  console.log(socket.data.username);
  next();
});

app.post("/signup",signup);
app.post("/signin", signin);
app.post("/verify", verify);
app.post("/add-friend",addFriend );
app.get("/getmessages", getMessages);
app.post("/message", Messages);
app.get("/getfriends", getFriends);
app.post("/delete-friend", deleteFriend);
app.post("/delete-message", deleteMessage);
app.post("/edit-message", editMessage);

io.on("connection", (socket) => {
  socket.on("chat message", async (data: any) => {
      chatmessage(socket,data);
  });

  socket.on('setusername', (username: string) => {
    setusername(socket,username)
  });

  socket.on('disconnect', () => {
    map.delete(socket.data.username);
  });

  socket.on('delete-message', async (data: any) => {
      deletemessage(socket,data)
  });

  socket.on('edit-message', async (data: any) => {
   editmessage(socket,data)
  });

});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});