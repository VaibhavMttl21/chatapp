import { Socket } from "socket.io-client";

export const Onconnect = (socket: React.MutableRefObject<Socket | undefined>, username: string) => {
  if (!socket.current) {
    console.log("Socket not connected");
  } else {
    socket.current.emit("setusername", username);
    console.log("Sent username to server:", username);
  }
};