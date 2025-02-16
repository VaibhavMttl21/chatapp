export const getfriends = (
    username: string,
    setContacts: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/getfriends?username=${username}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => setContacts(data));
  };