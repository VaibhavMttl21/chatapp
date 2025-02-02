import { useRef, useState, useEffect } from "react";
import { handleDeleteMessage } from "../utils/Deletefunctn";
import { handleEditMessage } from "../utils/Editmessage";

interface Message {
  id: number;
  content: string;
  senderUsername: string;
  timestamp: string;
  edited: Boolean;
}

export const Ed = ({ socket, username, currentChat,visibleMessages,setVisibleMessages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    if (currentChat.current) {
      fetch(
        `http://localhost:3000/getmessages/?username=${username}&&friend=${currentChat.current}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          const messages = data.map((message: any) => ({
            id: message.id,
            content: message.content,
            senderUsername: message.sender.username,
            timestamp: message.timestamp,
            edited: message.edited,
          }));
          setVisibleMessages(messages);
        });
    }
  }, [currentChat.current, username]);

  return (
    <>
      {visibleMessages.map((message) => (
        <div
          key={message.id}
          className={`max-w-max p-2 rounded shadow flex flex-col ${
            message.senderUsername === username
              ? "bg-orange-100 self-end"
              : "bg-gray-100 self-start"
          } relative group`}
        >
          <div className="flex items-center">
            {editingMessageId === message.id ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="p-2 border rounded bg-orange-100"
                  autoFocus
                />
                <button
                  onClick={() => {
                    handleEditMessage(
                      message.id,
                      editedContent,
                      socket,
                      username,
                      currentChat
                    );
                    setEditingMessageId(null);
                  }}
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <span>{message.content}</span>
            )}

            {message.senderUsername === username && (
              <div className="relative ml-2">
                <button
                  onClick={() =>
                    setDropdownVisible(
                      dropdownVisible === message.id ? null : message.id
                    )
                  }
                  className="text-gray-900 hover:text-gray-700 transition duration-300 opacity-0 group-hover:opacity-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6h.01M12 12h.01M12 18h.01"
                    />
                  </svg>
                </button>

                {dropdownVisible === message.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    <button
                      onClick={() => {
                        setEditingMessageId(message.id);
                        setEditedContent(message.content);
                        setDropdownVisible(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteMessage(
                          message.id,
                          socket,
                          username,
                          setVisibleMessages
                        );
                        setDropdownVisible(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-gray-500 text-xs italic mt-1">
            {message.edited && <span>(edited)</span>}
            <span className="block text-right">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};