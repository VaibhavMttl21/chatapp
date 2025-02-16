interface Message {
  id: number;
  content: string;
  senderUsername: string;
  timestamp: string;
  edited: boolean;
}

interface ChatMessageProps {
  message: {
    message: {
      id: number;
      content: string;
      timestamp: string;
    };
    senderUsername: string;
  };
  currentChat: React.MutableRefObject<string>;
  username: string;
  setVisibleMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const Chatmessage = ({
  message,
  currentChat,
  username,
  setVisibleMessages,
}: ChatMessageProps) => {
  const newMessage: Message = {
    id: message.message.id,
    senderUsername: message.senderUsername,
    content: message.message.content,
    timestamp: message.message.timestamp,
    edited: false,
  };

  if (
    message.senderUsername === currentChat.current ||
    username === message.senderUsername
  ) {
    setVisibleMessages((prevMessages) => [...prevMessages, newMessage]);
  }
};