import { useState, useEffect, FormEvent, useRef } from "react";
import io, { Socket } from "socket.io-client";
import * as cookie from "cookie";
import Contactlist from "../components/contact";

interface Message {
  id: number;
  content: string;
  senderUsername: string;
}

export default function ChatApp() {
  const [messagesMap, setMessagesMap] = useState<Map<string, Message[]>>(new Map());
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [addUserInput, setAddUserInput] = useState<string>("");
  const socket = useRef<Socket>();
  const [authenticated, setAuthenticated] = useState("loading");
  const currentChat = useRef<string>(""); 
  const [contacts, setContacts] = useState<string[]>([]);
  const [addUserError, setAddUserError] = useState<string>("");
  const cookies = cookie.parse(document.cookie);
  const username = cookies.username;

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

    socket.current.on("chat message", ({ message, username }: { message: Message; username: string }) => {
      setMessagesMap((prevMessages) => {
        const friendMessages = prevMessages.get(username) || [];
        prevMessages.set(username, [...friendMessages, message]);
        return new Map(prevMessages);
      });
      if (username === currentChat.current) {
        setVisibleMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    socket.current.on("delete-message", ({ messageId }: { messageId: number }) => {
      setVisibleMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId));
      setMessagesMap((prevMessages) => {
        const friendMessages = prevMessages.get(currentChat.current) || [];
        const updatedMessages = friendMessages.filter((message) => message.id !== messageId);
        prevMessages.set(currentChat.current, updatedMessages);
        return new Map(prevMessages);
      });
    });

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

  useEffect(() => {
    if (currentChat.current) {
      fetch(`http://localhost:3000/getmessages/?username=${username}&&friend=${currentChat.current}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          const messages = data.map((message: any) => ({
            id: message.id,
            content: message.content,
            senderUsername: message.sender.username
          }));
          setMessagesMap((prevMessages) => {
            prevMessages.set(currentChat.current, messages);
            return new Map(prevMessages);
          });
          setVisibleMessages(messages);
        });
    }
  }, [currentChat.current, username]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (socket && inputValue.trim() && currentChat.current) {
      fetch("http://localhost:3000/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          username,
          friendUsername: currentChat.current,
        }),
      })
        .then((response) => response.json())
        .then((newMessage) => {
          socket.current?.emit("chat message", { message: newMessage, username: currentChat.current });

          setMessagesMap((prevMessages) => {
            const friendMessages = prevMessages.get(currentChat.current) || [];
            prevMessages.set(currentChat.current, [...friendMessages, newMessage]);
            return new Map(prevMessages);
          });
          setVisibleMessages((prevMessages) => [...prevMessages, newMessage]);
          setInputValue("");
        });
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
          username,
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

  const handleDeleteUser = (friendUsername: string) => {
    fetch("http://localhost:3000/delete-friend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        friendUsername,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Success") {
          setContacts((prevContacts) => prevContacts.filter((contact) => contact !== friendUsername));
          if (currentChat.current === friendUsername) {
            currentChat.current = "";
            setVisibleMessages([]);
          }
        } else {
          console.error(data.error || "Failed to delete friend");
        }
      });
  };

  const handleDeleteMessage = (messageId: number) => {
    fetch("http://localhost:3000/delete-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        messageId,
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Message deleted successfully") {
        socket.current?.emit("delete-message", { messageId });
      } else {
        console.error(data.error || "Failed to delete message");
      }
    });
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
          currentChat.current = friendUsername;
          const messages = messagesMap.get(friendUsername) || [];
          setVisibleMessages(messages);
          console.log("Switched to chat with:", friendUsername);
        }}
      />
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {visibleMessages.map((message) => (
            <div key={message.id} className={`bg-white p-2 rounded shadow flex justify-between items-center ${message.senderUsername === username ? "bg-blue-100" : ""}`}>
              <span>{message.content}</span>
              {message.senderUsername === username && (
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="text-red-500 hover:text-red-700 transition duration-300"
                >
                  Delete
                </button>
              )}
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
        <div className="mt-4">
          <h2 className="text-xl text-white mb-2">Contacts</h2>
          <ul>
            {contacts.map((contact) => (
              <li key={contact} className="flex justify-between items-center mb-2">
                <span className="text-white">{contact}</span>
                <button
                  onClick={() => handleDeleteUser(contact)}
                  className="text-red-500 hover:text-red-700 transition duration-300"
                >
                  Delete User
                </button>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}