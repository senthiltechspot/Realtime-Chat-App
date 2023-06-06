const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store users in memory
const users = {};

// Store messages in memory
const messages = [];

// Define socket.io event listeners
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Emit initial messages to the connected client
  socket.emit("messages", messages);

  // Handle new messages
  socket.on("message", (message) => {
    console.log("New message:", message);
    // Add message to the array
    messages.push({ message, userId: socket.id, userName: users[socket.id] });
    // Emit the updated messages to all connected clients
    io.emit("message", { message, userId: socket.id, userName: users[socket.id] });
  });

  // Handle user registration
  socket.on("register", (userName) => {
    console.log("User registered:", userName);
    // Store the user's name with their ID
    users[socket.id] = userName;
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove the user from the users object
    delete users[socket.id];
  });
});

// Enable CORS for all routes
app.use(cors());

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
