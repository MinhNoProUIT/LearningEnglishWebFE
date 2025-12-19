"use client";
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Image from "next/image";
import { useRouter } from "next/navigation";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2d5f4f",
      light: "#4a7c6b",
      dark: "#1a3d31",
    },
    secondary: {
      main: "#5fa89a",
    },
    background: {
      default: "#f0f5f3",
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
});

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { username, password });
    // Xử lý đăng nhập - sau khi login thành công, chuyển về trang home
    router.push("/home");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2d5f4f 0%, #4a7c6b 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background circles */}
        {[
          { size: 200, top: "10%", left: "5%" },
          { size: 150, top: "60%", left: "15%" },
          { size: 100, top: "20%", right: "10%" },
          { size: 250, bottom: "10%", right: "5%" },
          { size: 80, bottom: "30%", left: "8%" },
        ].map((circle, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              width: circle.size,
              height: circle.size,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)",
              ...circle,
            }}
          />
        ))}

        {/* Main content */}
        <Paper
          elevation={10}
          sx={{
            display: "flex",
            maxWidth: 1100,
            width: "90%",
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
            backgroundColor: "white",
          }}
        >
          {/* Left side - Illustration */}
          <Box
            sx={{
              flex: 1,
              background: "linear-gradient(135deg, #f0f5f3 0%, #e8f0ed 100%)",
              p: 6,
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Image
                src="/images/english-logo.jpg"
                alt="Logo"
                width={80}
                height={80}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                }}
              />
            </Box>

            {/* Illustration Area as big image */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                my: 4,
              }}
            >
              <Image
                src="/images/english-background.jpg"
                alt="Illustration"
                width={500}
                height={350}
                style={{
                  borderRadius: 20,
                  objectFit: "cover",
                  width: "100%",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  height: "100%",
                }}
              />
            </Box>
          </Box>

          {/* Right side - Login form */}
          <Box
            sx={{
              flex: 1,
              background: "#2d5f4f",
              p: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 600,
                mb: 4,
              }}
            >
              Login
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  mb: 1,
                  fontSize: 14,
                }}
              >
                Username
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 2,
                    color: "white",
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5fa89a",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                    opacity: 1,
                  },
                }}
              />

              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  mb: 1,
                  fontSize: 14,
                }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 2,
                    color: "white",
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5fa89a",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                    opacity: 1,
                  },
                }}
              />

              <Box sx={{ textAlign: "right", mb: 3 }}>
                <Link
                  href="#"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontSize: 13,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{
                  background: "#5fa89a",
                  color: "white",
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 500,
                  mb: 3,
                  "&:hover": {
                    background: "#4d8d80",
                  },
                }}
              >
                Login to Evolingo
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: 14,
                    mb: 0.5,
                  }}
                >
                  Don't have an account?{" "}
                  <Link
                    href="/authentication/register"
                    sx={{
                      color: "#5fa89a",
                      textDecoration: "none",
                      fontWeight: 500,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Register Now
                  </Link>
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: 11,
                  }}
                >
                  Have a problem? Contact us at
                </Typography>
                <Link
                  href="mailto:tsc@maranatha.edu"
                  sx={{
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: 11,
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  tsc@maranatha.edu
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;
