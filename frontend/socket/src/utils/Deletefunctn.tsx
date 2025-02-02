export const handleDeleteMessage = (messageId,socket,username,setVisibleMessages) => {
    socket.current?.emit("delete-message", { messageId, username });

    setVisibleMessages((prevMessages:any) =>
      prevMessages.filter((message:any) => message.id !== messageId)
    );

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