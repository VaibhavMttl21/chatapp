import { useEffect, useState } from "react";

export const Background = ({currentChat,visibleMessages,isSidebarOpen}) => {
  
    const generatePositions = (
        sidebarWidth: number,
        footerHeight: number,
        chatHeight: number
      ) => {
        const positions = [];
        const iconSize = 24; // Icon size in pixels
        const margin = 10; // Margin around icons
    
        const width = window.innerWidth - sidebarWidth;
        const height = chatHeight - footerHeight;
        const cols = Math.floor(width / (iconSize + margin));
        const rows = Math.floor(height / (iconSize + margin));
    
        // Generate positions for each grid cell
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * (iconSize + margin) + Math.random() * margin;
            const y = row * (iconSize + margin) + Math.random() * margin;
            positions.push({ x, y });
          }
        }
        return positions;
      };
    
      const [iconPositions, setIconPositions] = useState(() =>
        generatePositions(isSidebarOpen ? 256 : 64, 64, window.innerHeight)
      );
    
      useEffect(() => {
        const updateIcons = () => {
          const chatContainer = document.querySelector(".chat-container");
          const chatHeight = chatContainer
            ? chatContainer.clientHeight
            : window.innerHeight;
          const sidebarWidth = isSidebarOpen ? 256 : 64;
          setIconPositions(generatePositions(sidebarWidth, 64, chatHeight));
        };
    
        updateIcons();
    
        // Update icons dynamically on resize or content changes
        const resizeObserver = new ResizeObserver(() => updateIcons());
        const chatContainer = document.querySelector(".chat-container");
        if (chatContainer) {
          resizeObserver.observe(chatContainer);
        }
    
        window.addEventListener("resize", updateIcons);
        return () => {
          resizeObserver.disconnect();
          window.removeEventListener("resize", updateIcons);
        };
      }, [isSidebarOpen, visibleMessages]);

  return (
  <>
    {currentChat.current ? (
      <div className="absolute inset-0 z-0 chat-container">
              {iconPositions.map((pos, i) => (
                <div
                key={i}
                className="absolute text-gray-700 opacity-10 animate-float"
                  style={{
                    top: `${pos.y}px`,
                    left: `${pos.x}px`,
                    transform: `scale(${
                      Math.random() * 0.7 + 0.8
                    }) rotate(${Math.random() * 360}deg)`,
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
          ) : (
            <div className="flex items-center justify-center h-full text-gray-700">
              Select a user to chat
            </div>
          )}
          </>
  )
}