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
exports.Messages = void 0;
const prisma_1 = require("../prisma");
const Messages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, friendUsername, message } = req.body;
    const sender = yield prisma_1.prisma.user.findUnique({
        where: { username }
    });
    const receiver = yield prisma_1.prisma.user.findUnique({
        where: { username: friendUsername }
    });
    if (!sender || !receiver) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    const newMessage = yield prisma_1.prisma.message.create({
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
exports.Messages = Messages;
