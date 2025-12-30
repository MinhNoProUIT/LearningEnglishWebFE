"use client";
// src/app/authentication/verify/page.tsx
// ==================== VERIFY OTP PAGE ====================

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import { Mail, ArrowBack, CheckCircle } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useVerifyOTPMutation, useResendOTPMutation } from "@/services/AuthService";

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
export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // RTK Query mutations
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();

  useEffect(() => {
    // Get email from URL params or session storage
    const params = new URLSearchParams(window.location.search);
    const emailParam =
      params.get("email") || sessionStorage.getItem("verifyEmail");

    if (!emailParam) {
      router.push("/authentication/register");
      return;
    }
    setEmail(emailParam);
  }, [router]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError("");

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Check if pasted data is exactly 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      setError("");

      // Focus on the last input
      const lastInput = document.getElementById("otp-5");
      lastInput?.focus();
    }
  };

  const handleVerify = async () => {
    if (!otp.every((digit) => digit !== "")) {
      setError("Please enter the complete verification code");
      return;
    }

    setError("");

    try {
      const otpCode = otp.join("");

      await verifyOTP({ email, otp: otpCode }).unwrap();

      // Clear stored email
      sessionStorage.removeItem("verifyEmail");

      // Redirect to login with success message
      router.push("/authentication/login?verified=true");
    } catch (err: unknown) {
      const error = err as { data?: { error?: string; message?: string } };
      const errorMessage =
        error.data?.error ||
        error.data?.message ||
        "Invalid verification code. Please try again.";
      setError(errorMessage);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setError("");

    try {
      await resendOTP({ email }).unwrap();

      // Reset countdown
      setCanResend(false);
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      setSuccessMessage("Verification code has been resent to your email!");

      // Focus on first input
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();
    } catch (err: unknown) {
      const error = err as { data?: { error?: string; message?: string } };
      const errorMessage =
        error.data?.error ||
        error.data?.message ||
        "Failed to resend OTP. Please try again.";
      setError(errorMessage);
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

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--auth-gradient)",
          position: "relative",
          overflow: "hidden",
          py: 4,
        }}
      >
        {/* Background circles */}
        {circles.map((circle, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              width: circle.size,
              height: circle.size,
              borderRadius: "50%",
              background: "var(--auth-circle-bg)",
              ...circle,
            }}
          />
        ))}

        {/* Main content */}
        <Paper
          elevation={10}
          sx={{
            maxWidth: 480,
            width: "90%",
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
            backgroundColor: "white",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "var(--auth-primary)",
              p: 4,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "var(--auth-input-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <Mail sx={{ fontSize: 40, color: "var(--auth-secondary)" }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: "white",
                fontWeight: 600,
                mb: 1,
              }}
            >
              Verify Your Email
            </Typography>
            <Typography
              sx={{
                color: "var(--auth-text-white-muted)",
                fontSize: 14,
              }}
            >
              We&apos;ve sent a 6-digit verification code to
            </Typography>
            <Typography
              sx={{
                color: "var(--auth-secondary)",
                fontWeight: 600,
                fontSize: 15,
                mt: 0.5,
              }}
            >
              {email}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {/* Success Message */}
            {successMessage && (
              <Alert
                severity="success"
                icon={<CheckCircle />}
                sx={{ mb: 3 }}
              >
                {successMessage}
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* OTP Input */}
            <Typography
              sx={{
                color: "var(--auth-primary)",
                fontSize: 14,
                fontWeight: 500,
                textAlign: "center",
                mb: 2,
              }}
            >
              Enter Verification Code
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                mb: 3,
              }}
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={isVerifying}
                  style={{
                    width: 50,
                    height: 56,
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: 600,
                    border: `2px solid ${digit ? "var(--auth-secondary)" : "#e0e0e0"}`,
                    borderRadius: 12,
                    outline: "none",
                    transition: "all 0.2s",
                    color: "var(--auth-primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--auth-secondary)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(95, 168, 154, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = digit ? "var(--auth-secondary)" : "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              ))}
            </Box>

            {/* Verify Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerify}
              disabled={isVerifying || !otp.every((digit) => digit !== "")}
              sx={{
                background: "var(--auth-secondary)",
                color: "white",
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: 16,
                fontWeight: 500,
                mb: 3,
                "&:hover": {
                  background: "var(--auth-secondary-hover)",
                },
                "&:disabled": {
                  background: "rgba(95, 168, 154, 0.5)",
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
            >
              {isVerifying ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Verify Email"
              )}
            </Button>

            {/* Resend OTP */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography sx={{ color: "#666", fontSize: 14 }}>
                Didn&apos;t receive the code?{" "}
                {canResend ? (
                  <Button
                    onClick={handleResend}
                    disabled={isResending}
                    sx={{
                      color: "var(--auth-secondary)",
                      textTransform: "none",
                      fontWeight: 600,
                      p: 0,
                      minWidth: "auto",
                      "&:hover": {
                        backgroundColor: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {isResending ? "Sending..." : "Resend Code"}
                  </Button>
                ) : (
                  <Typography
                    component="span"
                    sx={{ color: "#999", fontSize: 14 }}
                  >
                    Resend in {countdown}s
                  </Typography>
                )}
              </Typography>
            </Box>

            {/* Back to Register */}
            <Box
              sx={{
                textAlign: "center",
                pt: 2,
                borderTop: "1px solid #e0e0e0",
              }}
            >
              <Button
                startIcon={<ArrowBack />}
                onClick={() => router.push("/authentication/register")}
                sx={{
                  color: "var(--auth-primary)",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "rgba(45, 95, 79, 0.04)",
                  },
                }}
              >
                Back to Registration
              </Button>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              textAlign: "center",
              pb: 3,
              px: 4,
            }}
          >
            <Typography sx={{ color: "#999", fontSize: 11 }}>
              Need help?{" "}
              <Link
                href="mailto:tsc@maranatha.edu"
                sx={{
                  color: "var(--auth-secondary)",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Contact Support
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
