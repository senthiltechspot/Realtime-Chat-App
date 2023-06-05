import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://chat-app-api-senthiltechspot.onrender.com/");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  // const messages = [];

  useEffect(() => {
    // Listen for incoming messages
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      // console.log(message);
      // messages.push(messages)
    });

    // return () => {
    //   // Clean up the socket connection
    //   socket.disconnect();
    // };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div>
      <h1>Real-time Chat App</h1>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
