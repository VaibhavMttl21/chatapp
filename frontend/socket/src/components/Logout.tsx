export const Logout = (currentChat) =>
{
    return (
        <div>
                <header className="bg-orange-200 text-gray-900 p-4 flex justify-between items-center">
              <h1 className="text-2xl">
                {currentChat.current
                  ? `Chatting with ${currentChat.current}`
                  : "Select a user to chat"}
              </h1>
              <a
                href="/"
                className="text-sm md:text-base text-gray-900 hover:text-gray-700 transition duration-300"
              >
                LOGOUT
              </a>
            </header>
        </div>
    );
}