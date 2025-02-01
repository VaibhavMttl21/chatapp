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
const node_path_1 = require("node:path");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const io_1 = require("./io");
const map_1 = require("./map");
const addfriend_1 = require("./Routes/addfriend");
const verify_1 = require("./Routes/verify");
const signin_1 = require("./Routes/signin");
const signup_1 = require("./Routes/signup");
const getmessages_1 = require("./Routes/getmessages");
const message_1 = require("./Routes/message");
const getfriends_1 = require("./Routes/getfriends");
const deletefriend_1 = require("./Routes/deletefriend");
const editmessage_1 = require("./Routes/editmessage");
const deletemessage_1 = require("./Routes/deletemessage");
const chatmessage_1 = require("./controllers/chatmessage");
const setusername_1 = require("./controllers/setusername");
const deletemessage_2 = require("./controllers/deletemessage");
const editmessage_2 = require("./controllers/editmessage");
const buildPath = (0, node_path_1.join)(__dirname, "../../frontend/socket/dist");
io_1.app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "https://ms3fdsn4-5173.inc1.devtunnels.ms"],
    methods: ["GET", "POST"],
    credentials: true
}));
io_1.app.use(express_1.default.static(buildPath));
io_1.app.use(express_1.default.json());
io_1.io.use((socket, next) => {
    var _a;
    console.log("Query:", socket.handshake.headers.cookie);
    socket.data.username = (_a = socket.handshake.headers.cookie) === null || _a === void 0 ? void 0 : _a.split("=")[1];
    if (!socket.data.username) {
        return next(new Error("Authentication"));
    }
    console.log(socket.data.username);
    next();
});
io_1.app.post("/signup", signup_1.signup);
io_1.app.post("/signin", signin_1.signin);
io_1.app.post("/verify", verify_1.verify);
io_1.app.post("/add-friend", addfriend_1.addFriend);
io_1.app.get("/getmessages", getmessages_1.getMessages);
io_1.app.post("/message", message_1.Messages);
io_1.app.get("/getfriends", getfriends_1.getFriends);
io_1.app.post("/delete-friend", deletefriend_1.deleteFriend);
io_1.app.post("/delete-message", deletemessage_1.deleteMessage);
io_1.app.post("/edit-message", editmessage_1.editMessage);
io_1.io.on("connection", (socket) => {
    socket.on("chat message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        (0, chatmessage_1.chatmessage)(socket, data);
    }));
    socket.on('setusername', (username) => {
        (0, setusername_1.setusername)(socket, username);
    });
    socket.on('disconnect', () => {
        map_1.map.delete(socket.data.username);
    });
    socket.on('delete-message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        (0, deletemessage_2.deletemessage)(socket, data);
    }));
    socket.on('edit-message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        (0, editmessage_2.editmessage)(socket, data);
    }));
});
io_1.server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
