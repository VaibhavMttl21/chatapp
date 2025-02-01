"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
exports.app = (0, express_1.default)();
exports.server = (0, node_http_1.createServer)(exports.app);
exports.io = new socket_io_1.Server(exports.server, {
    cors: {
        origin: ["http://localhost:5173", "https://ms3fdsn4-5173.inc1.devtunnels.ms"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
