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
        });
    }
  }, [currentChat.current, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

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
        return;
      }
      if(addUserInput === username) {
        setAddUserError("You cannot add yourself as a friend");
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
        // .then((data) => {
        //   if (data.message === "Success") {
        //     setContacts((prevContacts) => [...prevContacts, addUserInput]);
        //     setAddUserInput("");
        //     setAddUserError("");
        //     toast.success("User added successfully!");
        //   } else {
        //     setAddUserError(data.error || "Failed to add friend");
        //   }
        // });
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
      <ToastContainer />
      <div className="flex flex-col h-screen bg-gray-700">
        <div className="flex flex-grow overflow-hidden">
          <div className={`flex flex-col bg-gray-800 text-white transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"}`}>
            <button
              className="bg-green-500 text-white p-2 m-2 rounded"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? "Collapse" : "Expand"}
            </button>
            {isSidebarOpen && (
              <>
                <div className="p-2">
                  <input
                    type="text"
                    value={addUserInput}
                    onChange={(e) => setAddUserInput(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Add a user..."
                  />
                  <button onClick={handleAddUser} className="bg-green-500 text-white p-2 mt-2 rounded w-full">
                    Add User
                  </button>
                  {addUserError && <div className="text-red-500">{addUserError}</div>}
                </div>
                <div className="flex-grow overflow-y-auto">
                  {contacts.map((contact) => (
                    <div
                      key={contact}
                      className={`p-2 cursor-pointer hover:bg-gray-700 transition duration-300 ${currentChat.current === contact ? "bg-gray-700" : ""}`}
                      onClick={() => {
                        currentChat.current = contact;
                        const messages = messagesMap.get(contact) || [];
                        setVisibleMessages(messages);
                        setIsDeleteMode(false);
                      }}
                    >
                      {contact}
                    </div>
                  ))}
                </div>
                <button
                  className="bg-red-500 text-white p-2 m-2 rounded"
                  onClick={() => setIsDeleteMode(!isDeleteMode)}
                >
                  {isDeleteMode ? "Cancel" : "Delete User"}
                </button>
                {isDeleteMode && (
                  <div className="p-2">
                    {contacts.map((contact) => (
                      <div
                        key={contact}
                        className="p-2 cursor-pointer hover:bg-gray-700 transition duration-300"
                        onClick={() => handleDeleteUser(contact)}
                      >
                        {contact}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col flex-grow">
            <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
              <h1 className="text-2xl">{currentChat.current ? `Chatting with ${currentChat.current}` : "Select a user to chat"}</h1>
              <a href="/logout" className="text-sm md:text-base text-gray-900 hover:text-gray-700 transition duration-300">
                LOGOUT
              </a>
            </header>
            <main className="flex-grow p-4 overflow-y-auto">
              <div className="flex flex-col space-y-4">
                {visibleMessages.map((message) => (
                  <div key={message.id} className={`bg-white p-2 rounded shadow flex justify-between items-center ${message.senderUsername === username ? "bg-blue-100" : ""}`}>
                    <span>{message.content} {message.timestamp}</span>
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
                <div ref={messagesEndRef} />
              </div>
            </main>
            <footer className="p-4 bg-gray-200">
              <button onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}>😀</button>
              {emojiPickerVisible && <EmojiPicker onEmojiClick={(emojiObject) => setInputValue(inputValue + emojiObject.emoji)} />}
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <textarea
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
        </div>
      </div>
    </div>
  );
}