"use client";
// src/app/authentication/login/page.tsx
// ==================== LOGIN PAGE ====================

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";

// Auth imports
import { useLoginMutation } from "@/services/AuthService";
import { setCredentials } from "@/redux/slices/authSlice";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import type { AppDispatch } from "@/redux/store";

// ==================== THEME ====================
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

// ==================== COMPONENT ====================
const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  // State
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // RTK Query mutation
  const [login, { isLoading }] = useLoginMutation();

  // React Hook Form với Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear API error khi user bắt đầu nhập
  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => setApiError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  // ==================== HANDLE SUBMIT ====================
  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);

    try {
      const result = await login(data).unwrap();

      // Lưu credentials vào Redux (sẽ tự động sync với localStorage và Cookie)
      dispatch(
        setCredentials({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          userId: result.userId,
          role: result.role,
        })
      );

      // ==================== REDIRECT BACK LOGIC ====================
      // Nếu user bị redirect từ protected route, quay lại route đó
      // Ví dụ: User ở /checkout -> bị đá về /login?redirect=/checkout
      // Sau login thành công -> quay lại /checkout
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/home");
      }
    } catch (error: unknown) {
      // Xử lý error từ API
      const err = error as { data?: { error?: string; message?: string } };
      const errorMessage =
        err.data?.error || err.data?.message || "Login failed. Please try again.";
      setApiError(errorMessage);
    }
  };

  // ==================== RENDER ====================
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

            {/* Illustration Area */}
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

            {/* API Error Alert */}
            {apiError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {apiError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  mb: 1,
                  fontSize: 14,
                }}
              >
                Email
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 2,
                    color: "white",
                    "& fieldset": {
                      borderColor: errors.email ? "#f44336" : "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.email
                        ? "#f44336"
                        : "rgba(255, 255, 255, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.email ? "#f44336" : "#5fa89a",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                    opacity: 1,
                  },
                  "& .MuiFormHelperText-root": {
                    color: "#ff8a80",
                  },
                }}
              />

              {/* Password Field */}
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
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                slotProps={{
                  input: {
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
                  },
                }}
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 2,
                    color: "white",
                    "& fieldset": {
                      borderColor: errors.password ? "#f44336" : "transparent",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.password
                        ? "#f44336"
                        : "rgba(255, 255, 255, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.password ? "#f44336" : "#5fa89a",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                    opacity: 1,
                  },
                  "& .MuiFormHelperText-root": {
                    color: "#ff8a80",
                  },
                }}
              />

              {/* Forgot Password Link */}
              <Box sx={{ textAlign: "right", mb: 3 }}>
                <Link
                  href="/authentication/forgot-password"
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

              {/* Submit Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading}
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
                  "&:disabled": {
                    background: "rgba(95, 168, 154, 0.5)",
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Login to Evolingo"
                )}
              </Button>

              {/* Register Link */}
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: 14,
                    mb: 0.5,
                  }}
                >
                  Don&apos;t have an account?{" "}
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

              {/* Contact Support */}
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
