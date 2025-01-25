import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth";
import ChatApp from "./pages/chat";

function App() {
  return (
    <div className="">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/chat" element={<ChatApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;