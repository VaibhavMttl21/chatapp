import express from "express";
import { createServer } from "node:http";
import { Server } from 'socket.io';

export const app = express();
export const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","https://ms3fdsn4-5173.inc1.devtunnels.ms"],
    methods: ["GET", "POST"],
    credentials: true
  }
});