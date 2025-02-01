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
exports.deleteMessage = void 0;
const io_1 = require("../io");
const map_1 = require("../map");
const prisma_1 = require("../prisma");
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const message = yield prisma_1.prisma.message.findUnique({
            where: { id: messageId },
            include: { sender: true, receiver: true }
        });
        console.log('MESSAGEGHFHGFGGFHGHFFG', message);
        if (!message) {
            res.status(404).json({ error: "Message not foundddddd" });
            return;
        }
        console.log("reached");
        if (message.sender.username !== username && message.receiver.username !== username) {
            res.status(403).json({ error: "You can only delete your own messages" });
            return;
        }
        yield prisma_1.prisma.message.delete({
            where: { id: messageId }
        });
        const senderSocketId = map_1.map.get(message.sender.username);
        const receiverSocketId = map_1.map.get(message.receiver.username);
        if (senderSocketId) {
            io_1.io.to(senderSocketId).emit('delete-message', { messageId });
        }
        if (receiverSocketId) {
            io_1.io.to(receiverSocketId).emit('delete-message', { messageId });
        }
        res.json({ message: "Message deleted successfully" });
    }
    catch (error) {
        console.log(error);
        if (error.code === 'P2025') {
            res.status(404).json({ error: "Message not found" });
        }
        else {
            console.error("Error in delete-message route:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
exports.deleteMessage = deleteMessage;
