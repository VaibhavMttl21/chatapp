export const handleEditMessage = (
    messageId: number,
    newContent: string,
    socket,
    username,
    currentChat
  ) => {
    socket.current?.emit("edit-message", {
      messageId,
      username,
      newContent,
      friendUsername: currentChat.current,
    });
  
    fetch("http://localhost:3000/edit-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        messageId,
        newContent,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error || "Failed to edit message");
        }
      });
      console.log('Message edited')
  };