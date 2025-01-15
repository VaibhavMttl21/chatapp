
import { BrowserRouter,Route,Routes } from "react-router-dom";
import App from "./pages/frontpage";
import Signup from "./pages/SignUp";
import Signin from "./pages/Siginin";
import ChatApp from "./pages/chat";

function Hello() {
  return (
    <div className="">
     <App/>
 <BrowserRouter>
    <Routes>
    {/* <Route path="/" element={<App />} /> */}
    <Route path="/signup" element={<Signup/>} />
    <Route path="/signin" element={<Signin />} />
    <Route path="/chat" element={<ChatApp/>} />
    </Routes>
 </BrowserRouter>
    </div>
  );
}

export default Hello;