"use client";

<<<<<<< Updated upstream

import { useState, useRef, useEffect } from "react";


=======
import { useState, useRef, useEffect } from "react";
>>>>>>> Stashed changes
import {
  Box,
  Button,
  Stack,
  TextField,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
<<<<<<< Updated upstream
} from "@mui/material";

=======
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
>>>>>>> Stashed changes
import {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
<<<<<<< Updated upstream
} from "../firebase";

=======
} from "../firebase.js";
>>>>>>> Stashed changes
import Head from "next/head";
import Script from "next/script";
import { createTheme, ThemeProvider } from "@mui/material/styles";

<<<<<<< Updated upstream
=======
// Define available languages
const languages = [
  { code: "en", label: "English" },
  { code: "pt", label: "Portuguese" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "fi", label: "Finnish" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
];

>>>>>>> Stashed changes
export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
<<<<<<< Updated upstream
      content:
        `Hi! I'm the Headstarter support assistant. How can I help you today?`,
=======
      content: `Hi! I'm the Headstarter support assistant. How can I help you today?`,
>>>>>>> Stashed changes
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
<<<<<<< Updated upstream
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(true);
=======
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false); // Dark mode state

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const appTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
      },
      primary: {
        main: darkMode ? '#bb86fc' : '#3f51b5',
      },
      secondary: {
        main: darkMode ? '#03dac6' : '#1e88e5',
      },
    },
  });
>>>>>>> Stashed changes

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setMessages([
          {
            role: "assistant",
<<<<<<< Updated upstream
            content:
              `Hi! I'm the Headstarter support assistant. How can I help you today?`,
=======
            content: `Hi! I'm the Headstarter support assistant. How can I help you today?`,
>>>>>>> Stashed changes
          },
        ]);
      } else {
        setUser(null);
        setMessages([
          {
            role: "assistant",
<<<<<<< Updated upstream
            content:
              `Hi! I'm the Headstarter support assistant. How can I help you today?`,
=======
            content: `Hi! I'm the Headstarter support assistant. How can I help you today?`,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          content:
            `I'm sorry, but I encountered an error. Please try again later.`,
=======
          content: `I'm sorry, but I encountered an error. Please try again later.`,
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  return (
    <>
      <Box width="100vw" height="100vh" display="flex" flexDirection="column">
        <AppBar position="static" sx={{ bgcolor: "primary.dark" }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              AI Customer Support
            </Typography>
=======
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);

    // Update the global translation API or change language setting
    if (window.globalseo) {
      window.globalseo.setLanguage(newLanguage);
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        bgcolor={appTheme.palette.background.default}
      >
        <AppBar
          position="static"
          sx={{
            bgcolor: darkMode ? "#333" : "#3f51b5",
            height: "64px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              AI Headstarter Assistant
            </Typography>
            <Button onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ bgcolor: "secondary.main", marginLeft: 2 }}
=======
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  sx={{ mt: "45px" }}
                >
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    bgcolor: "secondary.main",
                    marginLeft: 2,
                    '&:hover': {
                      bgcolor: "secondary.dark",
                    },
                    transition: "background-color 0.3s ease",
                  }}
>>>>>>> Stashed changes
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                onClick={() => setOpen(true)}
<<<<<<< Updated upstream
                sx={{ bgcolor: "secondary.main" }}
=======
                sx={{
                  bgcolor: "secondary.main",
                  '&:hover': {
                    bgcolor: "secondary.dark",
                  },
                  transition: "background-color 0.3s ease",
                }}
>>>>>>> Stashed changes
              >
                Login
              </Button>
            )}
          </Toolbar>
        </AppBar>
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
        <Head>
          <link
            href="https://unpkg.com/globalseo/dist/translate.css"
            rel="stylesheet"
          />
        </Head>
        <Script
          src="https://unpkg.com/globalseo/dist/translate.js"
          data-globalseo-key="4f877b72-17b5-4833-8b32-7878abc392a0"
          data-use-browser-language="true"
          data-original-language="en"
          data-allowed-languages="pt, fr, es, fi, it, nl"
          data-exclude-classes=""
        ></Script>

        <Box
<<<<<<< Updated upstream
          width="100vw"
          height="100vh"
=======
          width="100%"
>>>>>>> Stashed changes
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
<<<<<<< Updated upstream
        >
          <div className="globalseo-select globalseo-lang-selector-wrapper globalseo-exclude">
            <details role="group">
              <summary
                role="button"
                className="globalseo-lang-selector-loading"
              >
                <svg
                  className="globalseo-lang-selector-loading-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.7906 28.9982C14.131 28.9516 11.5622 28.0231 9.48748 26.3584C7.4128 24.6937 5.94973 22.3871 5.328 19.8007M16.7906 28.9982C13.4777 28.9404 10.8853 23.521 11.0009 16.8953C11.1166 10.2697 13.8966 4.94402 17.2094 5.00185M16.7906 28.9982C17.4055 29.0089 18.0021 28.8342 18.5667 28.5M16.7906 28.9982C17.4353 29.0094 17.904 28.9456 18.4338 28.8411M5.328 19.8007C8.73815 21.7699 12.6799 22.9255 16.8953 22.9991C17.5541 23.0116 18.2116 22.9969 18.8663 22.9553M5.328 19.8007C5.09283 18.8151 4.98323 17.8037 5.00182 16.7906C5.03917 14.6509 5.63417 12.6503 6.64706 10.9277M17.2094 5.00185C20.5222 5.05968 23.1147 10.4791 22.9991 17.1047C22.9878 17.7501 22.9513 18.3831 22.8914 19M17.2094 5.00185C19.3374 5.03811 21.4175 5.63986 23.2362 6.74538C25.0548 7.8509 26.5467 9.42037 27.5585 11.2928M17.2094 5.00185C15.0814 4.96382 12.9816 5.49262 11.1255 6.53399C9.26935 7.57536 7.72367 9.09181 6.64706 10.9277M27.5585 11.2928C24.612 13.7563 20.8749 15.0729 17.0349 15.0003C13.0382 14.9306 9.40832 13.4003 6.64706 10.9277M27.5585 11.2928C28.5415 13.1075 29.0375 15.146 28.9982 17.2095C28.9905 17.6459 28.9597 18.0764 28.9068 18.5"
                    stroke="#000000"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <g
                    style={{
                      animation: "globalseospin 2s linear infinite",
                      transformOrigin: "26px 26px",
                    }}
                  >
                    <circle
                      cx="26"
                      cy="26"
                      r="7.125"
                      stroke="#000000"
                      strokeWidth="1.75"
                      strokeDasharray="31.42"
                      strokeDashoffset="10.47"
                    ></circle>
                  </g>
                </svg>
              </summary>
            </details>
          </div>
          <Stack
            direction={"column"}
            width="500px"
            height="700px"
            border="1px solid black"
            p={2}
            spacing={3}
=======
          sx={{
            backgroundColor: darkMode ? '#121212' : '#f5f5f5',
            padding: "20px",
          }}
        >
          {/* Language Selector */}
          <Box
            position="fixed"
            top={10}
            left="50%"
            transform="translateX(-50%)"
            bgcolor="background.paper"
            p={2}
            borderRadius={1}
            boxShadow={1}
            zIndex={1000} // Ensure it appears above other elements
          >
            <FormControl variant="outlined" fullWidth>
              <InputLabel htmlFor="language-selector">Language</InputLabel>
              <Select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                label="Language"
                inputProps={{ id: "language-selector" }}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Stack
            direction={"column"}
            width={isSmallScreen ? "90%" : "500px"}
            height="700px"
            p={3}
            spacing={3}
            bgcolor="white"
            borderRadius={4}
            boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
            overflow="hidden"
>>>>>>> Stashed changes
          >
            <Stack
              direction={"column"}
              spacing={2}
              flexGrow={1}
              overflow="auto"
<<<<<<< Updated upstream
              maxHeight="100%"
=======
              sx={{
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: "8px",
                },
              }}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                    bgcolor={
                      message.role === "assistant"
                        ? "primary.main"
                        : "secondary.main"
                    }
                    color="white"
                    borderRadius={16}
                    p={3}
=======
                    sx={{
                      bgcolor:
                        message.role === "assistant"
                          ? "primary.main"
                          : "secondary.main",
                      color: "white",
                      borderRadius: 2,
                      p: 2,
                      maxWidth: "80%",
                      wordBreak: "break-word",
                    }}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                disabled={!user} // Disable input until the user is logged in
=======
                disabled={!user}
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ccc",
                    },
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                    },
                  },
                }}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                onKeyDown={handleKeyPress}
=======
                sx={{
                  minWidth: "100px",
                  bgcolor: "primary.main",
                  '&:hover': {
                    bgcolor: "primary.dark",
                  },
                  transition: "background-color 0.3s ease",
                }}
>>>>>>> Stashed changes
              >
                Send
              </Button>
            </Stack>
          </Stack>
        </Box>

<<<<<<< Updated upstream
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Login</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To run AI customer support, please choose one of the options
              below. Without choosing, you can not proceed.
=======
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: 3,
              padding: "20px",
            },
          }}
        >
          <DialogTitle sx={{ textAlign: "center" }}>Login</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ textAlign: "center", mb: 2 }}>
              To run AI customer support, please choose one of the options
              below. Without choosing, you cannot proceed.
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            <Button onClick={() => setOpen(false)}>Cancel</Button>
=======
            <Button onClick={() => setOpen(false)} color="primary">
              Cancel
            </Button>
>>>>>>> Stashed changes
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}