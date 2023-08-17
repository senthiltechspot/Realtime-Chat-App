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

// Store registered users' usernames and socket IDs in memory
const registeredUsernames = {};
const socketIdToUsername = {};

// Store messages in memory
const messages = [];

function emitActiveUsers() {
  const activeUserNames = Object.values(registeredUsernames);
  io.emit("activeUsers", activeUserNames);
  io.emit("Allmessages", messages)
}

// Define socket.io event listeners
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Emit initial messages and active users to the connected client
  socket.emit("messages", messages);
  emitActiveUsers();

  // Handle new messages
  socket.on("message", (message) => {
    // Add message to the array
    messages.push({
      message,
      userId: socket.id,
      userName: registeredUsernames[socket.id],
    });
    // Emit the updated messages to all connected clients
    io.emit("message", {
      message,
      userId: socket.id,
      userName: registeredUsernames[socket.id],
    });
  });

  // Handle user registration
  socket.on("register", (userName, callback) => {
    if (
      !socketIdToUsername[socket.id] &&
      !Object.values(registeredUsernames).includes(userName)
    ) {
      console.log("User registered:", userName);
      registeredUsernames[socket.id] = userName;
      socketIdToUsername[socket.id] = userName;
      emitActiveUsers();
      callback({ success: true });
    } else {
      console.log("User registration failed:", userName);
      callback({
        success: false,
        message: "Username already taken. Please try another.",
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove the user from the registered users object
    const userName = socketIdToUsername[socket.id];
    delete registeredUsernames[socket.id];
    delete socketIdToUsername[socket.id];
    emitActiveUsers();
  });
});

// Enable CORS for all routes
app.use(cors());

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
