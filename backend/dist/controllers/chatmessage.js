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
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatmessage = void 0;
const io_1 = require("../io");
const map_1 = require("../map");
const prisma_1 = require("../prisma");
const chatmessage = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, username, friendUsername } = data;
    try {
        const sender = yield prisma_1.prisma.user.findUnique({
            where: { username },
        });
        const receiver = yield prisma_1.prisma.user.findUnique({
            where: { username: friendUsername },
        });
        if (!sender || !receiver) {
            socket.emit("chat message", { error: "User not found" });
            return;
        }
        const newMessage = yield prisma_1.prisma.message.create({
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
        const recipientSocketId = map_1.map.get(friendUsername);
        if (recipientSocketId) {
            io_1.io.to(recipientSocketId).emit("chat message", {
                message: newMessage,
                senderUsername: sender.username,
                id: message.id
            });
        }
        const senderSocketId = map_1.map.get(username);
        if (senderSocketId) {
            io_1.io.to(senderSocketId).emit("chat message", {
                message: newMessage,
                senderUsername: sender.username,
                id: message.id
            });
        }
    }
    catch (error) {
        console.error("Error handling chat message:", error);
        socket.emit("chat message", { error: "Failed to send message" });
    }
});
exports.chatmessage = chatmessage;
