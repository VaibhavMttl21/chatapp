// import { set } from "mongoose"
import  { useState } from "react"
import cookie from "cookie"
// import Cookies from "js-cookie";
// import { useNavigate } from "react-router-dom";

export default function Signin () {
// const navigate = useNavigate();
// const goToContact = () => {
//   navigate("/contact");
// };
    const [username,setusername] = useState("")
    const [password,setPassword] = useState("")
    const[error,setError] = useState("")
    const fn = () => {
        fetch("http://localhost:3000/signin",{
            method:"POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username:username,
                password:password
            })
            
        }).then((response) => {
            const cookieString = cookie.serialize("username",username, {
            path: "/",    // Path for the cookie
            });
            document.cookie = cookieString;
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
                    SignIn
                </button>
                <div className="text-5xl">
                    {error}
                </div>
            </div>
        )
}