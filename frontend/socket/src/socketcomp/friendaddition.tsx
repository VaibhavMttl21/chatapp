import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";

export const FriendAddition = (
  friendUsername: string,
  setContacts: Dispatch<SetStateAction<string[]>>
) => {
  setContacts((prevContacts) => [...prevContacts, friendUsername]);
  toast.success(`Friend ${friendUsername} added successfully!`);
};