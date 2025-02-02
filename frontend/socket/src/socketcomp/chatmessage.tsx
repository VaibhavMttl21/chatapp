export const Chatmessage = () =>
{
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
}