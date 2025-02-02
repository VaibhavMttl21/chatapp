import { toast } from "react-toastify";

export const handleAddUser = (
  addUserInput,
  contacts,
  username,
  setVisibleMessages,
  currentChat
) => {
  if (addUserInput.trim()) {
    if (contacts.includes(addUserInput)) {
      toast.error("Friend already added");
      return;
    }
    if (addUserInput === username) {
      toast.error("You cannot add yourself as a friend");
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
      .catch(() => {
        toast.error("Username does not exist");
      });
  }
};