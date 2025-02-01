import { map } from "../serverconfig/map";

export const setusername = async(socket:any,username: string) => {
    map.set(username, socket.id);
    socket.data.username = username;
    console.log(map);
}