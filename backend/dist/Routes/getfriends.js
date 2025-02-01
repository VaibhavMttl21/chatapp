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
exports.getFriends = void 0;
const prisma_1 = require("../prisma");
const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    const user = yield prisma_1.prisma.user.findUnique({
        where: {
            username: username
        }
    });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    const friends = yield prisma_1.prisma.user.findUnique({
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
exports.getFriends = getFriends;
