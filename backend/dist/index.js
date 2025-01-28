"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const node_path_1 = require("node:path");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const node_inspector_1 = require("node:inspector");
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://ms3fdsn4-5173.inc1.devtunnels.ms"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
const prisma = new client_1.PrismaClient();
const map = new Map();
const buildPath = (0, node_path_1.join)(__dirname, "../../frontend/socket/dist");
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "https://ms3fdsn4-5173.inc1.devtunnels.ms"],
    methods: ["GET", "POST"],
    credentials: true
})); // Enable CORS for all routes
app.use(express_1.default.static(buildPath));
app.use(express_1.default.json()); // To parse JSON bodies
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
        var _a;
        if (error.code === 'P2002' && ((_a = error.meta) === null || _a === void 0 ? void 0 : _a.target.includes('username'))) {
            res.status(409).json({ error: "Username already exists" });
        }
        else {
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
        if ((data === null || data === void 0 ? void 0 : data.password) === req.body.password) {
            res.json({ message: "Success" });
        }
        else {
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
        }
        else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    }).catch((error) => {
        res.status(401).json({ error: "Invalid credentials" });
    });
});
app.post("/add-friend", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, friendUsername } = req.body;
    const user = yield prisma.user.findUnique({
        where: {
            username: username
        }
    });
    const friend = yield prisma.user.findUnique({
        where: {
            username: friendUsername
        }
    });
    if (!user || !friend) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    yield prisma.user.update({
        where: { id: user.id },
        data: {
            friends: {
                connect: { id: friend.id }
            }
        }
    });
    yield prisma.user.update({
        where: { id: friend.id },
        data: {
            friends: {
                connect: { id: user.id }
            }
        }
    });
    res.json({ message: "Success" });
}));
app.get("/getmessages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    const friend = req.query.friend;
    const sender = yield prisma.user.findUnique({
        where: {
            username: username
        }
    }).catch((error) => {
        res.status(502).json({ error: "Invalid credentials" });
    });
    const receiver = yield prisma.user.findUnique({
        where: {
            username: friend
        }
    }).catch((error) => {
        res.status(502).json({ error: "Invalid credentials" });
    });
    const messages = yield prisma.message.findMany({
        where: {
            OR: [
                {
                    senderId: sender === null || sender === void 0 ? void 0 : sender.id,
                    receiverId: receiver === null || receiver === void 0 ? void 0 : receiver.id
                },
                {
                    senderId: receiver === null || receiver === void 0 ? void 0 : receiver.id,
                    receiverId: sender === null || sender === void 0 ? void 0 : sender.id
                }
            ]
        },
        include: {
            sender: true, // Include the sender field
            receiver: true // Include the receiver field
        }
    });
    res.json(messages);
}));
app.post("/message", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, friendUsername, message } = req.body;
    const sender = yield prisma.user.findUnique({
        where: { username }
    });
    const receiver = yield prisma.user.findUnique({
        where: { username: friendUsername }
    });
    if (!sender || !receiver) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    const newMessage = yield prisma.message.create({
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
}));
app.get("/getfriends", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    const user = yield prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    const friends = yield prisma.user.findUnique({
        where: {
            username: username
        }
    }).friends();
    if (!friends) {
        res.json([]);
        return;
    }
    res.json(friends.map((friend) => friend.username));
}));
io.use((socket, next) => {
    var _a;
    node_inspector_1.console.log("Query:", socket.handshake.headers.cookie);
    socket.data.username = (_a = socket.handshake.headers.cookie) === null || _a === void 0 ? void 0 : _a.split("=")[1];
    if (!socket.data.username) {
        return next(new Error("Authentication"));
    }
    node_inspector_1.console.log(socket.data.username);
    next();
});
// Delete Friend
app.post("/delete-friend", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, friendUsername } = req.body;
    const user = yield prisma.user.findUnique({
        where: {
            username: username
        }
    });
    const friend = yield prisma.user.findUnique({
        where: {
            username: friendUsername
        }
    });
    if (!user || !friend) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    yield prisma.user.update({
        where: { id: user.id },
        data: {
            friends: {
                disconnect: { id: friend.id }
            }
        }
    });
    yield prisma.user.update({
        where: { id: friend.id },
        data: {
            friends: {
                disconnect: { id: user.id }
            }
        }
    });
    res.json({ message: "Success" });
}));
//delete
app.post("/delete-message", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, messageId } = req.body;
    node_inspector_1.console.log("Delete request received:", { username, messageId }); // Debugging log
    if (!messageId) {
        res.status(400).json({ error: "Message ID is required" });
        return;
    }
    if (!username) {
        res.status(400).json({ error: "Username is required" });
        return;
    }
    try {
        const message = yield prisma.message.findUnique({
            where: { id: messageId },
            include: { sender: true, receiver: true }
        });
        node_inspector_1.console.log('MESSAGEGHFHGFGGFHGHFFG', message);
        if (!message) {
            res.status(404).json({ error: "Message not foundddddd" });
            return;
        }
        node_inspector_1.console.log("reached");
        if (message.sender.username !== username && message.receiver.username !== username) {
            res.status(403).json({ error: "You can only delete your own messages" });
            return;
        }
        yield prisma.message.delete({
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
    }
    catch (error) {
        node_inspector_1.console.log(error);
        if (error.code === 'P2025') {
            res.status(404).json({ error: "Message not found" });
        }
        else {
            node_inspector_1.console.error("Error in delete-message route:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}));
io.on("connection", (socket) => {
    socket.on("chat message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { message, username, friendUsername } = data;
        try {
            // Retrieve sender and receiver from the database
            const sender = yield prisma.user.findUnique({
                where: { username },
            });
            const receiver = yield prisma.user.findUnique({
                where: { username: friendUsername },
            });
            if (!sender || !receiver) {
                socket.emit("chat message", { error: "User not found" });
                return;
            }
            // Store the message in the database
            const newMessage = yield prisma.message.create({
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
        }
        catch (error) {
            node_inspector_1.console.error("Error handling chat message:", error);
            socket.emit("chat message", { error: "Failed to send message" });
        }
    }));
    socket.on('setusername', (username) => {
        map.set(username, socket.id);
        socket.data.username = username;
        node_inspector_1.console.log(map);
    });
    socket.on('disconnect', () => {
        map.delete(socket.data.username);
    });
    socket.on('delete-message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { message, username, friendUsername, messageId } = data;
        node_inspector_1.console.log("Delete request received:", { messageId, username }); // Debugging log
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
        node_inspector_1.console.log("Delete request received:", { messageId, username });
        // console.log(senderSocketId) // Debugging log
        // console .log(receiverSocketId) // Debugging log
        io.to([senderSocketId || "", receiverSocketId || ""]).emit("delete-message", { messageId });
    }));
});
server.listen(3000, () => {
    node_inspector_1.console.log("Server running at http://localhost:3000");
});
