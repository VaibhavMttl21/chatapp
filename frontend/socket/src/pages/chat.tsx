import { useState, useEffect, FormEvent, useRef } from "react";
import io, { Socket } from "socket.io-client";
import * as cookie from "cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmojiPicker from "emoji-picker-react";

interface Message {
  id: number;
  content: string;
  senderUsername: string;
  timestamp: string;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const cookies = cookie.parse(document.cookie);
  const username = cookies.username;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState<boolean>(false);
  const [showDeleteButton, setShowDeleteButton] = useState<number | null>(null);
  const [iconPositions, setIconPositions] = useState<{ x: number; y: number }[]>([]);
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
      const newMessage = {
        id: message.message.id,
        senderUsername: message.senderUsername,
        content: message.message.content,
        timestamp: message.message.timestamp,
      } as Message;
      setMessagesMap((prevMessages) => {
        const friendMessages = prevMessages.get(message.senderUsername) || [];
        prevMessages.set(message.senderUsername, [...friendMessages, newMessage]);
        return new Map(prevMessages);
      });
      if (message.senderUsername === currentChat.current || username === message.senderUsername) {
        setVisibleMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    socket.current.on("delete-message", ({ messageId }: { messageId: number }) => {
      setMessagesMap((prevMessages) => {
        const updatedMessagesMap = new Map(prevMessages);
        updatedMessagesMap.forEach((messages, username) => {
          const updatedMessages = messages.filter((message) => message.id !== messageId);
          updatedMessagesMap.set(username, updatedMessages);
        });
        return updatedMessagesMap;
      });

      setVisibleMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId));
    });

    socket.current.on("friend-added", ({ friendUsername }: { friendUsername: string }) => {
      setContacts((prevContacts) => [...prevContacts, friendUsername]);
      toast.success(`Friend ${friendUsername} added successfully!`);
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
            senderUsername: message.sender.username,
            timestamp: message.timestamp,
          }));
          setMessagesMap((prevMessages) => {
            prevMessages.set(currentChat.current, messages);
            return new Map(prevMessages);
          });
          setVisibleMessages(messages);
          setInitialScroll(true); // Set initial scroll to true when messages are loaded
        });
    }
  }, [currentChat.current, username]);

  useEffect(() => {
    if (initialScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setInitialScroll(false); // Reset initial scroll after scrolling
    }
  }, [visibleMessages, initialScroll]);

  useEffect(() => {
    const generatePositions = () => {
      const positions = [];
      const iconSize = 24; // Icon size in pixels
      const margin = 10; // Margin around icons

      const width = window.innerWidth;
      const height = window.innerHeight;
      const cols = Math.floor(width / (iconSize + margin));
      const rows = Math.floor(height / (iconSize + margin));

      const totalCells = cols * rows;

      // Generate random positions within grid cells
      for (let i = 0; i < Math.min(2000, totalCells); i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * (iconSize + margin) + Math.random() * margin;
        const y = row * (iconSize + margin) + Math.random() * margin;
        positions.push({ x, y });
      }
      return positions;
    };

    setIconPositions(generatePositions());
  }, []);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && currentChat.current) {
      socket.current?.emit("chat message", { message: inputValue, username, friendUsername: currentChat.current });
      setInputValue("");
    }
  };

  const handleAddUser = () => {
    if (addUserInput.trim()) {
      if (contacts.includes(addUserInput)) {
        setAddUserError("Friend already added");
        setTimeout(() => setAddUserError(""), 5000);
        return;
      }
      if (addUserInput === username) {
        setAddUserError("You cannot add yourself as a friend");
        setTimeout(() => setAddUserError(""), 5000);
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
          if (data.error) {
            setAddUserError(data.error);
            setTimeout(() => setAddUserError(""), 5000);
          } else {
            setAddUserInput("");
            setAddUserError("");
            toast.success("User added successfully!");
          }
        })
        .catch(() => {
          setAddUserError("Username does not exist");
          setTimeout(() => setAddUserError(""), 5000);
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
          toast.success("User deleted successfully!");
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
    socket.current?.emit("delete-message", { messageId, username });

    setVisibleMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId));
    setMessagesMap((prevMessages) => {
      const friendMessages = prevMessages.get(currentChat.current) || [];
      const updatedMessages = friendMessages.filter((message) => message.id !== messageId);
      prevMessages.set(currentChat.current, updatedMessages);
      return new Map(prevMessages);
    });

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
        if (data.error) {
          console.error(data.error || "Failed to delete message");
        }
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
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
    <div className="relative flex flex-col h-screen bg-gradient-to-r bg-orange-50">
      <ToastContainer />
      <div className="flex flex-col h-screen bg-gradient-to-r bg-orange-50 z-10">
        <div className="flex flex-grow overflow-hidden">
          <div className={`flex flex-col bg-orange-100 text-gray-900 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"}`}>
            <button
              className="bg-orange-200 text-gray-900 p-2 m-2 rounded"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              onKeyDown={(e) => handleKeyDown(e, () => setIsSidebarOpen(!isSidebarOpen))}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 7.5h16.5m-16.5 7.5h16.5" />
              </svg>
            </button>
            {isSidebarOpen && (
              <>
                <div className="p-2">
                  <input
                    type="text"
                    value={addUserInput}
                    onChange={(e) => setAddUserInput(e.target.value)}
                    className="w-full p-2 border rounded text-gray-900"
                    placeholder="Add a user..."
                  />
                  <button onClick={handleAddUser} className="bg-orange-200 text-gray-900 p-2 mt-2 rounded w-full" onKeyDown={(e) => handleKeyDown(e, handleAddUser)}>
                    Add User
                  </button>
                  {addUserError && <div className="text-red-500">{addUserError}</div>}
                </div>
                <div className="flex-grow overflow-y-auto">
                  {contacts.map((contact) => (
                    <button
                      key={contact}
                      className={`p-2 w-full text-left cursor-pointer hover:bg-orange-200 transition duration-300 ${currentChat.current === contact ? "bg-orange-200" : ""}`}
                      onClick={() => {
                        currentChat.current = contact;
                        const messages = messagesMap.get(contact) || [];
                        setVisibleMessages(messages);
                        setIsDeleteMode(false);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, () => {
                        currentChat.current = contact;
                        const messages = messagesMap.get(contact) || [];
                        setVisibleMessages(messages);
                        setIsDeleteMode(false);
                      })}
                    >
                      {contact}
                    </button>
                  ))}
                </div>
                <button
                  className="bg-red-500 text-white p-2 m-2 rounded"
                  onClick={() => setIsDeleteMode(!isDeleteMode)}
                  onKeyDown={(e) => handleKeyDown(e, () => setIsDeleteMode(!isDeleteMode))}
                >
                  {isDeleteMode ? "Cancel" : "Delete User"}
                </button>
                {isDeleteMode && (
                  <div className="p-2">
                    {contacts.map((contact) => (
                      <button
                        key={contact}
                        className="p-2 w-full text-left cursor-pointer hover:bg-orange-200 transition duration-300"
                        onClick={() => handleDeleteUser(contact)}
                        onKeyDown={(e) => handleKeyDown(e, () => handleDeleteUser(contact))}
                      >
                        {contact}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col flex-grow relative">
            <header className="bg-orange-200 text-gray-900 p-4 flex justify-between items-center">
              <h1 className="text-2xl">{currentChat.current ? `Chatting with ${currentChat.current}` : "Select a user to chat"}</h1>
              <a href="/logout" className="text-sm md:text-base text-gray-900 hover:text-gray-700 transition duration-300">
                LOGOUT
              </a>
            </header>
            <main className="flex-grow p-4 overflow-y-auto relative">
              <div className="absolute inset-0 z-0">
                {iconPositions.map((pos, i) => (
                  <div
                    key={i}
                    className="absolute text-gray-700 opacity-10 animate-float"
                    style={{
                      top: `${pos.y}px`,
                      left: `${pos.x}px`,
                      transform: `scale(${Math.random() * 0.7 + 0.8}) rotate(${Math.random() * 360}deg)`,
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                      />
                    </svg>
                  </div>
                ))}
              </div>
              <div className="flex flex-col space-y-4 relative z-10">
                {visibleMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-max p-2 rounded shadow ${message.senderUsername === username ? "bg-orange-100 self-end" : "bg-gray-100 self-start"}`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setShowDeleteButton(message.id);
                    }}
                  >
                    <span>{message.content}</span>
                    <span className="text-gray-500 text-xs block text-right">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    {showDeleteButton === message.id && message.senderUsername === username && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-red-500 hover:text-red-700 transition duration-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </main>
            <footer className="p-4 bg-orange-100">
              <button onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}>😀</button>
              {emojiPickerVisible && <EmojiPicker onEmojiClick={(emojiObject) => setInputValue(inputValue + emojiObject.emoji)} />}
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-grow p-2 border rounded"
                  placeholder="Type your message..."
                />
                <button type="submit" className="bg-orange-200 text-gray-900 p-2 rounded">
                  Send
                </button>
              </form>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}