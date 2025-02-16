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
exports.editMessage = void 0;
const io_1 = require("../serverconfig/io");
const map_1 = require("../serverconfig/map");
const prisma_1 = require("../serverconfig/prisma");
const editMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, messageId, newContent } = req.body;
    if (!messageId || !newContent) {
        res.status(400).json({ error: "Message ID and new content are required" });
        return;
    }
    try {
        const message = yield prisma_1.prisma.message.findUnique({
            where: { id: messageId },
            include: { sender: true, receiver: true }
        });
        if (!message) {
            res.status(404).json({ error: "Message not found" });
            return;
        }
        if (message.sender.username !== username && message.receiver.username !== username) {
            res.status(403).json({ error: "You can only edit your own messages" });
            return;
        }
        yield prisma_1.prisma.message.update({
            where: { id: messageId },
            data: { content: newContent, edited: true }
        });
        const senderSocketId = map_1.map.get(message.sender.username);
        const receiverSocketId = map_1.map.get(message.receiver.username);
        if (senderSocketId) {
            io_1.io.to(senderSocketId).emit('edit-message', { messageId, newContent });
        }
        if (receiverSocketId) {
            io_1.io.to(receiverSocketId).emit('edit-message', { messageId, newContent });
        }
        res.json({ message: "Message edited successfully" });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ error: "Message not found" });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
exports.editMessage = editMessage;
