import { useState, useEffect, FormEvent } from "react";
import io, { Socket } from "socket.io-client";
import cookie from "cookie";
import Contactlist from "../components/contact";

export default function ChatApp() {
  const [messagesMap, setMessagesMap] = useState<Map<string, string[]>>(new Map());
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [addUserInput, setAddUserInput] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [authenticated, setAuthenticated] = useState("loading");
  const [currentChat, setCurrentChat] = useState<string>(""); 
  const [contacts, setContacts] = useState<string[]>([]);
  const [addUserError, setAddUserError] = useState<string>("");
  const cookies = cookie.parse(document.cookie);

  useEffect(() => {
    const socketIo = io("http://localhost:3000", { withCredentials: true });
    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("Connected to server. Socket ID:", socketIo.id);
      socketIo.emit("setusername", cookies.username);
      console.log("Sent username to server:", cookies.username);
    });

    socketIo.on("chat message", ({ message, username }: { message: string; username: string }) => {
      setMessagesMap((prevMessages) => {
        const friendMessages = prevMessages.get(username) || [];
        friendMessages.push(message);
        prevMessages.set(username, friendMessages);
        return new Map(prevMessages);
      });
      console.log("Received message from:", username);
      console.log("Current chat:", currentChat);
      if (username === currentChat) {
        setVisibleMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    fetch("http://localhost:3000/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cookies.username }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAuthenticated(data.message === "Success" ? "true" : "false");
      });

    fetch(`http://localhost:3000/getfriends?username=${cookies.username}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => setContacts(data));

    return () => {
      socketIo.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentChat) {
      console.log("Fetching messages for chat with:", currentChat);
      fetch(`http://localhost:3000/getmessages/?username=${cookies.username}&&friend=${currentChat}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          const messages = data.map((message: any) => message.content);
          setMessagesMap((prevMessages) => {
            prevMessages.set(currentChat, messages);
            return new Map(prevMessages);
          });
          setVisibleMessages(messages);
        });
    }
  }, [currentChat]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (socket && inputValue.trim() && currentChat) {
      fetch("http://localhost:3000/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          username: cookies.username,
          friendUsername: currentChat,
        }),
      });

      socket.emit("chat message", { message: inputValue, username: currentChat });

      setMessagesMap((prevMessages) => {
        const friendMessages = prevMessages.get(currentChat) || [];
        friendMessages.push(`You: ${inputValue}`);
        prevMessages.set(currentChat, friendMessages);
        return new Map(prevMessages);
      });

      setVisibleMessages((prevMessages) => [...prevMessages, `You: ${inputValue}`]);
      setInputValue("");
    }
  };

  const handleAddUser = () => {
    if (addUserInput.trim()) {
      if (contacts.includes(addUserInput)) {
        setAddUserError("Friend already added");
        return;
      }

      fetch("http://localhost:3000/add-friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cookies.username,
          friendUsername: addUserInput,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Success") {
            setContacts((prevContacts) => [...prevContacts, addUserInput]);
            setAddUserInput("");
            setAddUserError("");
          } else {
            setAddUserError(data.error || "Failed to add friend");
          }
        });
    }
  };

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
    <div className="flex flex-col h-screen bg-gray-700">
      <header className="bg-blue-500 text-white p-4 text-center">
        <h1 className="text-2xl">Chat App</h1>
      </header>
      <Contactlist
        contacts={contacts}
        setcontact={(friendUsername: string) => {
          setCurrentChat(friendUsername);
          const messages = messagesMap.get(friendUsername) || [];
          setVisibleMessages(messages);
          console.log("Switched to chat with:", friendUsername);
        }}
      />
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {visibleMessages.map((message, index) => (
            <div key={index} className="bg-white p-2 rounded shadow">
              {message}
            </div>
          ))}
        </div>
      </main>
      <footer className="p-4 bg-gray-200">
        <div className="mb-4 flex space-x-2">
          <input
            type="text"
            value={addUserInput}
            onChange={(e) => setAddUserInput(e.target.value)}
            className="flex-grow p-2 border rounded"
            placeholder="Add a user..."
          />
          <button onClick={handleAddUser} className="bg-green-500 text-white p-2 rounded">
            Add User
          </button>
        </div>
        {addUserError && <div className="text-red-500">{addUserError}</div>}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow p-2 border rounded"
            placeholder="Type your message..."
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}