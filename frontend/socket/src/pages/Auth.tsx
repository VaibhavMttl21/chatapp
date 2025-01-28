import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as cookie from "cookie";

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fn = () => {
    if (isSignIn) {
      fetch("http://localhost:3000/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Invalid credentials");
          }
          const cookieString = cookie.serialize("username", username, {
            path: "/",
          });
          document.cookie = cookieString;
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            navigate("/chat");
          }
        })
        .catch((error) => {
          console.error("Signin error:", error);
          setError(error.message);
        });
    } else {
      fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Signup failed");
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            const cookieString = cookie.serialize("username", username, {
              path: "/",
            });
            document.cookie = cookieString;
            navigate("/chat");
          }
        })
        .catch((error) => {
          console.error("Signup error:", error);
          setError(error.message);
        });
    }
  };

  const generatePositions = () => {
    const positions = [];
    // const gridSize = 40; // Grid size to prevent overlap
    const iconSize = 24; // Icon size in pixels
    const margin = 10; // Margin around icons

    const width = window.innerWidth/2;
    const height = window.innerHeight;
    const cols = Math.floor(width / (iconSize + margin));
    const rows = Math.floor(height / (iconSize + margin));

    const totalCells = cols * rows;

    // Generate random positions within grid cells
    for (let i = 0; i < Math.min(2000, totalCells); i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * (iconSize + margin) + Math.random() * margin;
      const y = row * (iconSize + margin) + Math.random() * margin;
      positions.push({ x, y });
    }
    return positions;
  };

  const iconPositions = generatePositions();

  return (
      
    <div className="relative flex flex-col md:flex-row min-h-screen bg-gradient-to-r bg-orange-50">
       <div className="absolute inset-0 z-0">
        {iconPositions.map((pos, i) => (
          <div
            key={i}
            className="absolute text-gray-700 opacity-10 animate-float"
            style={{
              top: `${pos.y}px`,
              left: `${pos.x}px`,
              transform: `scale(${Math.random() * 0.7 + 0.8}) rotate(${Math.random() * 360}deg)`,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
          </div>
        ))}
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="bg-orange-100 p-6 md:p-12 rounded-2xl shadow-xl transform transition duration-500 hover:scale-105 w-full max-w-xl opacity-100">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6 md:mb-8 text-center text-gray-900 tracking-wide animate-fadeIn">
            {isSignIn ? "Sign In to Your Account" : "Create Your Account"}
          </h2>
          <div className="mb-4 md:mb-6 animate-slideInLeft">
            <label
              className="block text-gray-900 text-sm md:text-base font-semibold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-600 bg-orange-50 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 shadow-md transition duration-300"
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-4 md:mb-6 animate-slideInRight">
            <label
              className="block text-gray-900 text-sm md:text-base font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-600 bg-orange-50 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 shadow-md transition duration-300"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <button
              onClick={fn}
              className="w-full  bg-orange-200 text-gray-900 py-2 md:py-3 rounded-lg font-bold hover:text-white hover:bg-black transform hover:-translate-y-1 transition duration-500"
            >
              {isSignIn ? "Log In" : "Sign Up"}
            </button>
          </div>
          <div className="flex items-center justify-between mt-4">
            {isSignIn ? (
              <>
                <a
                  href="#"
                  className="text-sm md:text-base text-gray-900 hover:text-gray-700 transition duration-300"
                >
                  Forgot Password?
                </a>
                <a
                  href="#"
                  onClick={() => setIsSignIn(false)}
                  className="text-sm md:text-base text-gray-900 hover:text-gray-700 transition duration-300"
                >
                  Don't have an account? Sign Up
                </a>
              </>
            ) : (
              <a
                href="#"
                onClick={() => setIsSignIn(true)}
                className="text-sm md:text-base text-slate-500 hover:text-gray-900 transition duration-300"
              >
                Already have an account? Sign In
              </a>
            )}
          </div>
          {error && (
            <div className="text-red-400 mt-4 md:mt-6 text-center text-lg font-medium animate-pulse">
              {error}
            </div>
          )}
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-r bg-orange-100 p-6 md:p-12">
        <div className="text-center p-8">
          <p className="text-gray-900 text-2xl md:text-4xl font-bold -translate-y-[3rem] transform transition duration-500 hover:scale-105">
            "Bringing people closer with every message. <br />
            Where conversations turn into connections."
          </p>
          <div className="text-gray-900 text-xl md:text-2xl font-semibold mt-5 ml-0 md:ml-[37rem] transform transition duration-500 hover:scale-105">
            Our Motive
          </div>
        </div>
      </div>
    </div>
  );
}