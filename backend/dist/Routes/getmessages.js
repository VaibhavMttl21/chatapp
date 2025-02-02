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
exports.getMessages = void 0;
const prisma_1 = require("../serverconfig/prisma");
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    const friend = req.query.friend;
    const sender = yield prisma_1.prisma.user.findUnique({
        where: {
            username: username
        }
    }).catch((error) => {
        res.status(502).json({ error: "Invalid credentials" });
    });
    const receiver = yield prisma_1.prisma.user.findUnique({
        where: {
            username: friend
        }
    }).catch((error) => {
        res.status(502).json({ error: "Invalid credentials" });
    });
    const messages = yield prisma_1.prisma.message.findMany({
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
});
exports.getMessages = getMessages;
