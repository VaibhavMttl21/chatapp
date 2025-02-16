export const verify = (
    username: string,
    setAuthenticated: React.Dispatch<React.SetStateAction<string>>
  ) => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAuthenticated(data.message === "Success" ? "true" : "false");
      });
  };