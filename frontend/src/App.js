import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Grid,
} from "@mui/material";
import { styled, ThemeProvider } from "@mui/system";
import { createTheme } from "@mui/material/styles";

const socket = io("http://localhost:5000");

const ChatContainer = styled(Container)({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  justifyContent: "center",
  alignItems: "center",
});

const ChatBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "80%",
  width: "90%",
  padding: theme.spacing(2),
}));

const MessagesContainer = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  overflow: "auto",
  marginBottom: theme.spacing(2),
}));

const MessageItem = styled(ListItem)(({ isCurrentUser }) => ({
  marginBottom: theme.spacing(1),
  display: "flex",
  justifyContent: isCurrentUser ? "flex-end" : "flex-start",
}));

const MessageText = styled(ListItemText)(({ isCurrentUser }) => ({
  wordBreak: "break-word",
  backgroundColor: isCurrentUser
    ? theme.palette.primary.main
    : theme.palette.secondary.main,
  color: theme.palette.getContrastText(
    isCurrentUser ? theme.palette.primary.main : theme.palette.secondary.main
  ),
  borderRadius: "10px",
  padding: theme.spacing(1),
}));


const theme = createTheme();

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const register = (e) => {
    e.preventDefault();
    socket.emit("register", userName);
    setIsRegistered(true);
  };

  useEffect(() => {
    socket.on("message", handleIncomingMessage);

    return () => {
      socket.off("message", handleIncomingMessage);
    };
  }, []);

  const handleIncomingMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    console.log(message);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("message", message);
      setMessage("");
    }
  };

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <ThemeProvider theme={theme}>
      <ChatContainer>
        {!isRegistered ? (
          <ChatBox>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              Register
            </Typography>
            <form onSubmit={register}>
              <Grid
                container
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <Grid item xs={12} sm={8} md={6} lg={4}>
                  <TextField
                    type="text"
                    fullWidth
                    value={userName}
                    placeholder="Username"
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={2} lg={2}>
                  <Button type="submit" variant="contained" fullWidth>
                    Login
                  </Button>
                </Grid>
              </Grid>
            </form>
          </ChatBox>
        ) : (
          <ChatBox>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              Real-time Chat App
            </Typography>
            <MessagesContainer id="messages-container">
              <List>
                {messages.map((msg, index) => (
                  <MessageItem
                    key={index}
                    alignItems="flex-start"
                    isCurrentUser={msg.userId === socket.id}
                  >
                    <MessageText
                      primary={msg.userName === userName ? "You" : msg.userName}
                      secondary={msg.message}
                      isCurrentUser={msg.userId === socket.id}
                    />
                  </MessageItem>
                ))}
              </List>
            </MessagesContainer>
            <form onSubmit={handleSendMessage}>
              <Grid
                container
                spacing={2}
                alignItems="center"
                justifyContent="center"
              >
                <Grid item xs={12} sm={8} md={6} lg={4}>
                  <TextField
                    type="text"
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={2} lg={2}>
                  <Button type="submit" variant="contained" fullWidth>
                    Send
                  </Button>
                </Grid>
              </Grid>
            </form>
          </ChatBox>
        )}
      </ChatContainer>
    </ThemeProvider>
  );
}

export default App;
