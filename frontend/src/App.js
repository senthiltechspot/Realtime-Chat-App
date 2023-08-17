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
  Chip,
} from "@mui/material";
import { styled, ThemeProvider } from "@mui/system";
import { createTheme } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const socket = io(process.env.REACT_APP_API);

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
  backgroundColor: "#D0F0C0",
}));

const MessageItem = styled(ListItem)(({ isCurrentUser }) => ({
  display: "flex",
  width: "fit-content",
  justifyContent: isCurrentUser ? "flex-end" : "flex-start",
  marginLeft: isCurrentUser ? "auto" : 1,
  maxWidth: "75%",
}));

const MessageText = styled(ListItemText)(({ isCurrentUser }) => ({
  wordBreak: "break-word",
  padding: "8px 12px",
  borderRadius: isCurrentUser ? "10px 0 10px 10px" : "0 10px 10px 10px",
  backgroundColor: isCurrentUser ? "#F4D03F" : "#FF3CAC",
  backgroundImage: isCurrentUser
    ? "linear-gradient(132deg, #F4D03F 0%, #16A085 100%)"
    : " linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)",
  color: "white",
}));

const theme = createTheme();

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  const register = async (e) => {
    e.preventDefault();
    if (userName.trim() !== "") {
      await socket.emit("register", userName, (response) => {
        if (response.success) {
          // await socket.on("Allmessages", handleExistingMessage);
          setIsRegistered(true);
          setRegistrationError("");
        } else {
          setRegistrationError(response.message);
        }
      });
    } else {
      setRegistrationError("Enter a valid Username");
    }
  };

  useEffect(() => {
    socket.on("message", handleIncomingMessage);
    socket.on("activeUsers", handleActiveUsers);
    socket.on("Allmessages", handleExistingMessage);

    return () => {
      socket.off("message", handleIncomingMessage);
    };
  }, []);
  const handleExistingMessage = (items) => {
    setMessages((prevMessages) => [...prevMessages, ...items]);
  };
  const handleIncomingMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };
  const handleActiveUsers = (users) => {
    setActiveUsers(users);
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
      <ChatContainer
        sx={{
          backgroundColor: "#85FFBD",
          backgroundImage: "linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%)",
        }}
      >
        <Typography variant="h6" component="h6" align="center" gutterBottom>
          Active Users :
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {activeUsers.length > 0 ? (
            activeUsers.map((user, i) => (
              <Chip
                key={i}
                icon={<AccountCircleIcon />}
                color="success"
                label={user}
              />
            ))
          ) : (
            <Chip
              icon={<AccountCircleIcon />}
              // color="success"

              label="No Active Users"
            />
          )}
        </Box>
        {!isRegistered &&
        (userName !== "" || userName !== null || userName !== undefined) ? (
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
              {registrationError && (
                <Typography color="error" align="center">
                  {registrationError}
                </Typography>
              )}
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
                      sx={{ color: "white" }}
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
                    placeholder="Enter Message"
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
