import { useState } from "react";
import { handleDeleteUser } from "../utils/deleteuser";
import { handleAddUser } from "../utils/addfriend";

interface DeleteUserProps {
  contacts: string[];
  setVisibleMessages: React.Dispatch<React.SetStateAction<any[]>>;
  currentChat: React.MutableRefObject<string>;
  username: string;
  setContacts: React.Dispatch<React.SetStateAction<string[]>>;
  isSidebarOpen: boolean;
  messagesMap: Map<string, any[]>;
}

export const Deleteuser = ({
  contacts,
  setVisibleMessages,
  currentChat,
  username,
  setContacts,
  isSidebarOpen,
  messagesMap,
}: DeleteUserProps) => {
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [addUserError,] = useState<string>("");
  const [addUserInput, setAddUserInput] = useState<string>("");

  return (
    <div
      className={`flex flex-col bg-orange-100 text-gray-900 transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-16"
      } h-full`}
    >
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
            <button
              onClick={() =>
                handleAddUser(
                  addUserInput,
                  contacts,
                  username,
                  setVisibleMessages,
                  currentChat
                )
              }
              className="bg-orange-200 text-gray-900 p-2 mt-2 rounded w-full"
            >
              Add User
            </button>
            {addUserError && <div className="text-red-500">{addUserError}</div>}
          </div>
          <div className="flex-grow overflow-y-auto">
            {contacts.map((contact) => (
              <button
                key={contact}
                className={`p-2 w-full text-left cursor-pointer hover:bg-orange-200 transition duration-300 border-b border-gray-300 ${
                  currentChat.current === contact ? "bg-orange-200" : ""
                }`}
                onClick={() => {
                  if (currentChat.current === contact) {
                    currentChat.current = "";
                    setVisibleMessages([]);
                  } else {
                    currentChat.current = contact;
                    const messages = messagesMap.get(contact) || [];
                    setVisibleMessages(messages);
                  }
                  setIsDeleteMode(false);
                }}
              >
                {contact}
              </button>
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
                <button
                  key={contact}
                  className="p-2 w-full text-left cursor-pointer hover:bg-orange-200 transition duration-300 border-b border-gray-300"
                  onClick={() =>
                    handleDeleteUser(
                      contact,
                      username,
                      setContacts,
                      currentChat,
                      setVisibleMessages
                    )
                  }
                >
                  {contact}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};