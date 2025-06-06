import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";

export const handleDeleteUser = (
  friendUsername: string,
  username: string,
  setContacts: Dispatch<SetStateAction<string[]>>,
  currentChat: React.MutableRefObject<string>,
  setVisibleMessages: Dispatch<SetStateAction<any[]>>
) => {
  fetch(`${import.meta.env.VITE_BACKEND_URL}/delete-friend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      friendUsername,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Success") {
        setContacts((prevContacts) =>
          prevContacts.filter((contact) => contact !== friendUsername)
        );
        toast.success("User deleted successfully!");
        if (currentChat.current === friendUsername) {
          currentChat.current = "";
          setVisibleMessages([]);
        }
      } else {
        toast.error(data.error || "Failed to delete friend");
      }
    })
    .catch(() => {
      toast.error("Failed to delete friend");
    });
};