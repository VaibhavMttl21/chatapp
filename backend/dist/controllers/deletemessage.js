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
exports.deletemessage = void 0;
const io_1 = require("../serverconfig/io");
const map_1 = require("../serverconfig/map");
const deletemessage = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, username, friendUsername, messageId } = data;
    if (!messageId) {
        socket.emit('delete-message', { error: "Message ID is required" });
        return;
    }
    if (!username) {
        socket.emit('delete-message', { error: "Username is required" });
        return;
    }
    const senderSocketId = map_1.map.get(username);
    const receiverSocketId = map_1.map.get(friendUsername);
    io_1.io.to([senderSocketId || "", receiverSocketId || ""]).emit("delete-message", { messageId });
});
exports.deletemessage = deletemessage;
