"use client";

import { Box, Button, Stack, TextField, AppBar, Toolbar, Typography, Avatar, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from "../firebase";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setMessages([
          {
            role: "assistant",
            content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
          },
        ]);
      } else {
        setUser(null);
        setMessages([
          {
            role: "assistant",
            content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
          },
        ]);
        setOpen(true); // Show the login dialog if the user is not logged in
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setOpen(false);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
      setOpen(false);
    } catch (error) {
      console.error("Error during anonymous sign-in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !user) {
      setOpen(true); // Show the login dialog if the user is not logged in
      return; // Don't send the message if the user is not logged in
    }
    setIsLoading(true);
    setMessage(""); // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message }, // Add the user's message to the chat
      { role: "assistant", content: "" }, // Add a placeholder for the assistant's response
    ]);

    // Send the message to the server (AI API)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content: "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column">
      <AppBar position="static" sx={{ bgcolor: "primary.dark" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI Custumor Support
          </Typography>
          {user ? (
            <>
              <Typography variant="body1" sx={{ marginRight: 2 }}>
                {user.displayName || user.email || "Anonymous"}
              </Typography>
              <Avatar
                alt={user.displayName || "User"}
                src={user.photoURL}
                onClick={handleMenu}
                sx={{ bgcolor: "secondary.main", cursor: "pointer" }}
              />
              <Button color="inherit" onClick={handleLogout} sx={{ bgcolor: "secondary.main", marginLeft: 2 }}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => setOpen(true)} sx={{ bgcolor: "secondary.main" }}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Stack
          direction={"column"}
          width="500px"
          height="700px"
          border="1px solid black"
          p={2}
          spacing={3}
        >
          <Stack
            direction={"column"}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
              >
                <Box
                  bgcolor={
                    message.role === "assistant"
                      ? "primary.main"
                      : "secondary.main"
                  }
                  color="white"
                  borderRadius={16}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={"row"} spacing={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              rows={2}
              variant="outlined"
              disabled={!user} // Disable input until the user is logged in
              onClick={() => {
                if (!user) {
                  setOpen(true); // Show the login dialog if the user tries to interact without logging in
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={sendMessage}
              disabled={isLoading || !user}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To run AI customer support, please choose one of the options below. Without choosing, you can't proceed.
          </DialogContentText>
          <Stack spacing={2} mt={2}>
            <Button variant="contained" onClick={handleLogin}>
              Sign in with Google
            </Button>
            <Button variant="contained" onClick={handleAnonymousLogin}>
              Continue as Guest
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
