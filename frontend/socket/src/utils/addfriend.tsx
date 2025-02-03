import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";

export const handleAddUser = (
  addUserInput: string,
  contacts: string[],
  username: string,
  setVisibleMessages: Dispatch<SetStateAction<any[]>>,
  currentChat: React.MutableRefObject<string>
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
      .then((data) => {
        if (data.message === "Success") {
          currentChat.current = "";
          setVisibleMessages([]);
          toast.success(`Friend ${addUserInput} added successfully!`);
        } else {
          toast.error(data.error || "Failed to add friend");
        }
      })
      .catch(() => {
        toast.error("Username does not exist");
      });
  }
};