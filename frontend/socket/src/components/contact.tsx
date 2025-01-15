import { useEffect, useState } from "react";
import cookie from 'cookie';

export default function Contactlist({ contacts, setcontact }: { contacts: string[], setcontact: any }) {
    const [localContacts, setLocalContacts] = useState<string[]>(contacts);
    const cookies = cookie.parse(document.cookie);

    useEffect(() => {
        setLocalContacts(contacts);
    }, [contacts]);

    useEffect(() => {
        fetch("http://localhost:3000/getfriends?username=" + cookies.username, {
            method: "GET",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((data) => {
            console.log(data)
            setLocalContacts(data)
        })
    }, []);

    return (
        <div>
            {localContacts.map((contact: any, index: number) => {
                return (
                    <div key={index} onClick={() => setcontact(contact)}>
                        {contact}
                    </div>
                );
            })}
        </div>
    );
}