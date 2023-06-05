const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
// const cors = require("cors");

const app = express();
// app.use(cors()); // Enable CORS for all routes

const server = http.createServer(app);
// const io = socketIO(server);

// Store messages in memory
const messages = [];
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Define socket.io event listeners
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Emit initial messages to the connected client
  socket.emit("messages", messages);

  // Handle new messages
  socket.on("message", (message) => {
    console.log("New message:", message);
    // Add message to the array
    messages.push({ message });
    // Emit the updated messages to all connected clients
    io.emit("message", message);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
