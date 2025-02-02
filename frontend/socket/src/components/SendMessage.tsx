import EmojiPicker from "emoji-picker-react";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";

export const SendMessage = ({ socket, currentChat, username }) => {
  const [emojiPickerVisible, setEmojiPickerVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const handleSendMessage = (e: FormEvent) => {
    console.log("sdjbksjd",socket.current)
    e.preventDefault();
    if (inputValue.trim() && currentChat.current) {
      socket.current?.emit("chat message", {
        message: inputValue,
        username,
        friendUsername: currentChat.current,
      });
      setInputValue("");
    } else {
      toast.error("Please select a user to chat with!");
      setInputValue("");
    }
  };

  return (
    <>
      <form onSubmit={handleSendMessage} className="flex-grow flex space-x-2">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow p-2 border rounded"
          placeholder="Type your message..."
        />
        <button
          type="button"
          onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
          className="bg-orange-200 text-gray-900 p-2 rounded"
        >
          😀
        </button>
        <button
          type="submit"
          className="bg-orange-200 text-gray-900 p-2 rounded"
        >
          Send
        </button>
      </form>
      {emojiPickerVisible && (
        <EmojiPicker
          onEmojiClick={(emojiObject) =>
            setInputValue((prev) => prev + emojiObject.emoji)
          }
        />
      )}
    </>
  );
};