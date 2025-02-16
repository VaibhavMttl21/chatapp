import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import * as cookie from "cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SendMessage } from "../components/SendMessage";
import { Ed } from "../components/Message";
import { Background } from "../components/Background";
import { Logout } from "../components/Logout";
import { Deleteuser } from "../components/Deleteuser";
import { verify } from "../utils/verify";
import { getfriends } from "../utils/getfriends";
import { Chatmessage } from "../socketcomp/chatmessage";
import { Deletemessage } from "../socketcomp/deletemessage";
import { Editmessage } from "../socketcomp/editmessage";
import { FriendAddition } from "../socketcomp/friendaddition";
import { Onconnect } from "../socketcomp/onconnect";

interface Message {
  id: number;
  content: string;
  senderUsername: string;
  timestamp: string;
  edited: boolean;
}

export default function ChatApp() {
  const [messagesMap] = useState<Map<string, Message[]>>(new Map());
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const socket = useRef<Socket>();
  const [authenticated, setAuthenticated] = useState("loading");
  const currentChat = useRef<string>("");
  const [contacts, setContacts] = useState<string[]>([]);
  const [isSidebarOpen] = useState<boolean>(true);
  const cookies = cookie.parse(document.cookie);
  const username = cookies.username || "";

  useEffect(() => {
    const socketIo = io("http://localhost:3000", { withCredentials: true });
    socket.current = socketIo;

    socket.current.on("connect", () => {
      if (username) {
        Onconnect(socket, username);
      } else {
        console.error("Username is undefined");
      }
    });

    socket.current.on("chat message", (message: any) => {
      Chatmessage({ message, currentChat, username, setVisibleMessages });
    });

    socket.current.on(
      "delete-message",
      ({ messageId }: { messageId: number }) => {
        Deletemessage(setVisibleMessages, messageId);
      }
    );

    socket.current.on(
      "edit-message",
      ({
        messageId,
        newContent,
      }: {
        messageId: number;
        newContent: string;
      }) => {
        Editmessage(setVisibleMessages, messageId, newContent);
      }
    );

    socket.current.on(
      "friend-added",
      ({ friendUsername }: { friendUsername: string }) => {
        FriendAddition(friendUsername, setContacts);
      }
    );

    verify(username, setAuthenticated);
    getfriends(username, setContacts);

    return () => {
      socket.current?.disconnect();
    };
  }, [username]);

  if (authenticated === "loading") return <div>Loading...</div>;
  if (authenticated === "false") {
    return (
      <div>
        Not authenticated
        <a href="/signin">Signin</a>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-r bg-orange-50 ">
      <ToastContainer />
      <div className="flex flex-col h-screen bg-gradient-to-r bg-orange-50 z-10">
        <div className="flex flex-grow overflow-hidden">
          <Deleteuser
            contacts={contacts}
            setContacts={setContacts}
            currentChat={currentChat}
            setVisibleMessages={setVisibleMessages}
            messagesMap={messagesMap}
            username={username}
            isSidebarOpen={isSidebarOpen}
          />
          <div className="flex flex-col flex-grow relative chat-container">
            <Logout currentChat={currentChat}></Logout>
            <main className="flex-grow p-4 overflow-y-auto relative">
              <Background
                currentChat={currentChat}
                visibleMessages={visibleMessages}
                isSidebarOpen={isSidebarOpen}
              ></Background>
              <div className="flex flex-col space-y-4 relative z-10">
                <Ed
                  username={username}
                  socket={socket}
                  currentChat={currentChat}
                  visibleMessages={visibleMessages}
                  setVisibleMessages={setVisibleMessages}
                ></Ed>
              </div>
            </main>
            <footer className="p-4 bg-orange-100 flex items-center">
              <SendMessage
                currentChat={currentChat}
                username={username}
                socket={socket}
              />
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}