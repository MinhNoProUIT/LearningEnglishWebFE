"use client";
// src/app/authentication/register/page.tsx
// ==================== REGISTER PAGE ====================

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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Visibility, VisibilityOff, CheckCircle } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Auth imports
import { useRegisterMutation } from "@/services/AuthService";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

// ==================== THEME - Using CSS Variables ====================
const theme = createTheme({
  palette: {
    primary: {
      main: "#2d5f4f", // var(--auth-primary)
      light: "#4a7c6b", // var(--auth-primary-light)
      dark: "#1a3d31", // var(--auth-primary-dark)
    },
    secondary: {
      main: "#5fa89a", // var(--auth-secondary)
    },
    background: {
      default: "#f0f5f3", // var(--auth-bg-light)
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
});

// Common styles using CSS variables
const authStyles = {
  pageBackground: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--auth-gradient)",
    position: "relative",
    overflow: "hidden",
    py: 4,
  },
  circle: {
    position: "absolute",
    borderRadius: "50%",
    background: "var(--auth-circle-bg)",
  },
  paper: {
    display: "flex",
    maxWidth: 1100,
    width: "90%",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
    backgroundColor: "white",
  },
  leftPanel: {
    flex: 1,
    background: "var(--auth-gradient-light)",
    p: 6,
    display: { xs: "none", md: "flex" },
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
  },
  rightPanel: {
    flex: 1,
    background: "var(--auth-primary)",
    p: { xs: 4, md: 5 },
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  textField: {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      background: "var(--auth-input-bg)",
      borderRadius: 2,
      color: "white",
      "& fieldset": { borderColor: "var(--auth-input-border)" },
      "&:hover fieldset": { borderColor: "var(--auth-input-border-hover)" },
      "&.Mui-focused fieldset": { borderColor: "var(--auth-secondary)" },
    },
    "& .MuiInputBase-input::placeholder": { color: "var(--auth-input-placeholder)", opacity: 1 },
    "& .MuiFormHelperText-root": { color: "var(--auth-error-text)" },
  },
  submitButton: {
    background: "var(--auth-secondary)",
    color: "white",
    py: 1.5,
    borderRadius: 2,
    textTransform: "none",
    fontSize: 16,
    fontWeight: 500,
    mb: 2,
    "&:hover": {
      background: "var(--auth-secondary-hover)",
    },
    "&:disabled": {
      background: "rgba(95, 168, 154, 0.5)",
      color: "rgba(255, 255, 255, 0.7)",
    },
  },
};

// ==================== COMPONENT ====================
const RegisterPage = () => {
  const router = useRouter();

  // State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // RTK Query mutation
  const [registerUser, { isLoading }] = useRegisterMutation();

  // React Hook Form với Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch password để hiển thị requirements
  const password = watch("password");

  // Password requirements check (API chỉ yêu cầu 6 ký tự)
  const passwordRequirements = {
    minLength: password?.length >= 6,
  };

  // Clear API error after 5 seconds
  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => setApiError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  // ==================== HANDLE SUBMIT ====================
  const onSubmit = async (data: RegisterFormData) => {
    // Validate terms checkbox
    if (!agreedToTerms) {
      setTermsError("You must agree to the Terms and Conditions");
      return;
    }

    setApiError(null);
    setTermsError(null);

    try {
      await registerUser(data).unwrap();

      // Lưu email để hiển thị ở trang verify OTP
      sessionStorage.setItem("verifyEmail", data.email);

      // Redirect to verify OTP page
      router.push(
        `/authentication/verify?email=${encodeURIComponent(data.email)}`
      );
    } catch (error: unknown) {
      // Xử lý error từ API
      const err = error as { data?: { error?: string; message?: string } };
      const errorMessage =
        err.data?.error ||
        err.data?.message ||
        "Registration failed. Please try again.";
      setApiError(errorMessage);
    }
  };

  // Background circles config
  const circles = [
    { size: 200, top: "10%", left: "5%" },
    { size: 150, top: "60%", left: "15%" },
    { size: 100, top: "20%", right: "10%" },
    { size: 250, bottom: "10%", right: "5%" },
    { size: 80, bottom: "30%", left: "8%" },
  ];

  // ==================== RENDER ====================
  return (
    <ThemeProvider theme={theme}>
      <Box sx={authStyles.pageBackground}>
        {/* Background circles */}
        {circles.map((circle, index) => (
          <Box
            key={index}
            sx={{
              ...authStyles.circle,
              width: circle.size,
              height: circle.size,
              ...circle,
            }}
          />
        ))}

        {/* Main content */}
        <Paper elevation={10} sx={authStyles.paper}>
          {/* Left side - Welcome message */}
          <Box sx={authStyles.leftPanel}>
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

            {/* Welcome content */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", my: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "var(--auth-primary)",
                  mb: 2,
                  lineHeight: 1.2,
                }}
              >
                Welcome to
                <br />
                Evolingo!
              </Typography>
              <Typography
                sx={{
                  color: "var(--auth-primary-light)",
                  fontSize: 15,
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Join our community and start your learning journey today. Create
                your account to access all features.
              </Typography>

              {/* Features list */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {[
                  "Interactive learning experience",
                  "Track your progress",
                  "Connect with peers",
                  "Access premium content",
                ].map((feature, index) => (
                  <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircle sx={{ color: "var(--auth-secondary)", fontSize: 22 }} />
                    <Typography sx={{ color: "var(--auth-primary)", fontSize: 14 }}>{feature}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Sign In Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "var(--auth-primary-light)", fontSize: 14, mb: 1.5 }}>
                Already have an account?
              </Typography>
              <Button
                variant="outlined"
                onClick={() => router.push("/authentication/login")}
                sx={{
                  borderColor: "var(--auth-primary)",
                  color: "var(--auth-primary)",
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "var(--auth-primary-dark)",
                    backgroundColor: "rgba(45, 95, 79, 0.04)",
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>

          {/* Right side - Registration form */}
          <Box sx={authStyles.rightPanel}>
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 600,
                mb: 1,
              }}
            >
              Create Account
            </Typography>
            <Typography
              sx={{
                color: "var(--auth-text-white-muted)",
                fontSize: 14,
                mb: 3,
              }}
            >
              Fill in your details to get started
            </Typography>

            {/* API Error Alert */}
            {apiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {apiError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Full Name Field */}
              <Typography sx={{ color: "var(--auth-text-white)", mb: 1, fontSize: 14 }}>
                Full Name
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your full name"
                {...register("fullname")}
                error={!!errors.fullname}
                helperText={errors.fullname?.message}
                disabled={isLoading}
                sx={{
                  ...authStyles.textField,
                  "& .MuiOutlinedInput-root": {
                    ...authStyles.textField["& .MuiOutlinedInput-root"],
                    "& fieldset": { borderColor: errors.fullname ? "var(--auth-error)" : "transparent" },
                    "&:hover fieldset": { borderColor: errors.fullname ? "var(--auth-error)" : "var(--auth-input-border-hover)" },
                    "&.Mui-focused fieldset": { borderColor: errors.fullname ? "var(--auth-error)" : "var(--auth-secondary)" },
                  },
                }}
              />

              {/* Email Field */}
              <Typography sx={{ color: "var(--auth-text-white)", mb: 1, fontSize: 14 }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                placeholder="your.email@example.com"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
                sx={{
                  ...authStyles.textField,
                  "& .MuiOutlinedInput-root": {
                    ...authStyles.textField["& .MuiOutlinedInput-root"],
                    "& fieldset": { borderColor: errors.email ? "var(--auth-error)" : "transparent" },
                    "&:hover fieldset": { borderColor: errors.email ? "var(--auth-error)" : "var(--auth-input-border-hover)" },
                    "&.Mui-focused fieldset": { borderColor: errors.email ? "var(--auth-error)" : "var(--auth-secondary)" },
                  },
                }}
              />

              {/* Password Field */}
              <Typography sx={{ color: "var(--auth-text-white)", mb: 1, fontSize: 14 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
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
                          sx={{ color: "var(--auth-text-white-muted)" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  ...authStyles.textField,
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    ...authStyles.textField["& .MuiOutlinedInput-root"],
                    "& fieldset": { borderColor: errors.password ? "var(--auth-error)" : "transparent" },
                    "&:hover fieldset": { borderColor: errors.password ? "var(--auth-error)" : "var(--auth-input-border-hover)" },
                    "&.Mui-focused fieldset": { borderColor: errors.password ? "var(--auth-error)" : "var(--auth-secondary)" },
                  },
                }}
              />

              {/* Password Requirements */}
              {password && (
                <Box sx={{ mb: 2, p: 1.5, backgroundColor: "var(--auth-input-bg)", borderRadius: 2 }}>
                  <Typography sx={{ color: "var(--auth-text-white-faint)", fontSize: 12, mb: 0.5 }}>
                    Password must have:
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CheckCircle
                      sx={{
                        fontSize: 14,
                        color: passwordRequirements.minLength ? "var(--auth-secondary)" : "var(--auth-text-white-faint)",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: passwordRequirements.minLength ? "var(--auth-secondary)" : "var(--auth-text-white-faint)",
                      }}
                    >
                      6+ characters
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Confirm Password Field */}
              <Typography sx={{ color: "var(--auth-text-white)", mb: 1, fontSize: 14 }}>
                Confirm Password
              </Typography>
              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={isLoading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: "var(--auth-text-white-muted)" }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  ...authStyles.textField,
                  "& .MuiOutlinedInput-root": {
                    ...authStyles.textField["& .MuiOutlinedInput-root"],
                    "& fieldset": { borderColor: errors.confirmPassword ? "var(--auth-error)" : "transparent" },
                    "&:hover fieldset": { borderColor: errors.confirmPassword ? "var(--auth-error)" : "var(--auth-input-border-hover)" },
                    "&.Mui-focused fieldset": { borderColor: errors.confirmPassword ? "var(--auth-error)" : "var(--auth-secondary)" },
                  },
                }}
              />

              {/* Terms checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (termsError) setTermsError(null);
                    }}
                    disabled={isLoading}
                    sx={{
                      color: "var(--auth-text-white-muted)",
                      "&.Mui-checked": { color: "var(--auth-secondary)" },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: "var(--auth-text-white-muted)", fontSize: 13 }}>
                    I agree to the{" "}
                    <Link href="#" sx={{ color: "var(--auth-secondary)", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                      Terms and Conditions
                    </Link>
                  </Typography>
                }
                sx={{ mb: 1 }}
              />
              {termsError && (
                <Typography sx={{ color: "var(--auth-error-text)", fontSize: 12, mb: 2 }}>{termsError}</Typography>
              )}

              {/* Submit Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={authStyles.submitButton}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Mobile: Sign In Link */}
              <Box sx={{ textAlign: "center", display: { xs: "block", md: "none" } }}>
                <Typography sx={{ color: "var(--auth-text-white-muted)", fontSize: 14 }}>
                  Already have an account?{" "}
                  <Link
                    href="/authentication/login"
                    sx={{
                      color: "var(--auth-secondary)",
                      textDecoration: "none",
                      fontWeight: 500,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>

              {/* Contact Support */}
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography sx={{ color: "var(--auth-text-white-faint)", fontSize: 11 }}>
                  Need help? Contact us at
                </Typography>
                <Link
                  href="mailto:tsc@maranatha.edu"
                  sx={{
                    color: "var(--auth-text-white-faint)",
                    fontSize: 11,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
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

export default RegisterPage;
