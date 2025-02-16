interface Message {
    id: number;
    content: string;
    senderUsername: string;
    timestamp: string;
    edited: boolean;
  }
  
  export const Editmessage = (
    setVisibleMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    messageId: number,
    newContent: string
  ) => {
    setVisibleMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? { ...message, content: newContent, edited: true }
          : message
      )
    );
  };