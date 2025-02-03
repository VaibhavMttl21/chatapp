export const Signin = () =>
{
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
}