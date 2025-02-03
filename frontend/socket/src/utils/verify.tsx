export const verify = (
    username: string,
    setAuthenticated: React.Dispatch<React.SetStateAction<string>>
  ) => {
    fetch("http://localhost:3000/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAuthenticated(data.message === "Success" ? "true" : "false");
      });
  };