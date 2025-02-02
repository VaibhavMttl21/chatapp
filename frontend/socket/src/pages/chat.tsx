import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import * as cookie from "cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SendMessage } from "../components/SendMessage";
import { Ed } from "../components/Message";
import { Background } from "../components/Background";
import { Logout } from "../components/Logout";
import { Deleteuser } from "../components/Deleteuser";

interface Message {
  id: number;
  content: string;
  senderUsername: string;
  timestamp: string;
  edited: Boolean;
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
  const username = cookies.username;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialScroll, setInitialScroll] = useState<boolean>(true);

  
  useEffect(() => {
    const socketIo = io("http://localhost:3000", { withCredentials: true });
    socket.current = socketIo;

    socket.current.on("connect", () => {
      if (!socket.current) {
        console.log("Socket not connected");
      } else {
        socket.current.emit("setusername", username);
        console.log("Sent username to server:", username);
      }
    });

    socket.current.on("chat message", (message: any) => {
      console.log("newMessage",message)
      const newMessage = {
        id: message.message.id,
        senderUsername: message.senderUsername,
        content: message.message.content,
        timestamp: message.message.timestamp,
      } as Message;
      if (
        message.senderUsername === currentChat.current ||
        username === message.senderUsername
      ) {
        setVisibleMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    socket.current.on(
      "delete-message",
      ({ messageId }: { messageId: number }) => {
        setVisibleMessages((prevMessages) =>
          prevMessages.filter((message) => message.id !== messageId)
        );
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
        setVisibleMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === messageId
              ? { ...message, content: newContent, edited: true }
              : message
          )
        );
      }
    );

    socket.current.on(
      "friend-added",
      ({ friendUsername }: { friendUsername: string }) => {
        setContacts((prevContacts) => [...prevContacts, friendUsername]);
        toast.success(`Friend ${friendUsername} added successfully!`);
      }
    );

    fetch("http://localhost:3000/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAuthenticated(data.message === "Success" ? "true" : "false");
      });

    fetch(`http://localhost:3000/getfriends?username=${username}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => setContacts(data));

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