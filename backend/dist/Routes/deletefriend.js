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
exports.deleteFriend = void 0;
const prisma_1 = require("../serverconfig/prisma");
const deleteFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, friendUsername } = req.body;
    const user = yield prisma_1.prisma.user.findUnique({
        where: {
            username: username
        }
    });
    const friend = yield prisma_1.prisma.user.findUnique({
        where: {
            username: friendUsername
        }
    });
    if (!user || !friend) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    yield prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            friends: {
                disconnect: { id: friend.id }
            }
        }
    });
    yield prisma_1.prisma.user.update({
        where: { id: friend.id },
        data: {
            friends: {
                disconnect: { id: user.id }
            }
        }
    });
    res.json({ message: "Success" });
});
exports.deleteFriend = deleteFriend;
