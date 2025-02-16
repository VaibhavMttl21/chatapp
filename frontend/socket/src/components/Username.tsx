import  { useState } from "react"

export default function User ({fn}:{fn:any}) {
    const [username,setusername] = useState("")
        return (
            <div>
                <input type="text" onChange={(event) =>
                    {
                        setusername(event.target.value);
                        
                    }
                }
                />
                <button onClick={fn(username)}>
                    Submit
                </button>
            </div>
        )
}