// import { set } from "mongoose"
import  { useState } from "react"

export default function Signup () {
    const [username,setusername] = useState("")
    const [password,setPassword] = useState("")
    const[error,setError] = useState("")
    const fn = () => {
        fetch("http://localhost:3000/signup",{
            method:"POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username:username,
                password:password
            })
        }).then((response) => {
            return response.json()
        }
        ).then((data) => {
            console.log(data)
            if(data.error){
                setError(data.error)
            }
        })
    }
        return (
            <div>
                <input type="text" onChange={(event) =>
                    {
                        setusername(event.target.value);
                        
                    }
                }
                />
                 <input type="text" onChange={(event) =>
                    {
                        setPassword(event.target.value);
                        
                    }
                }
                />
                <button onClick={fn}>
                    SignUp
                </button>
                <div className="text-5xl">
                    {error}
                </div>
            </div>
        )
}