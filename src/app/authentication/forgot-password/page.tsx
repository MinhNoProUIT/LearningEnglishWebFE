// =====================================================
// FILE 1: app/forgot-password/page.tsx
// Màn hình quên mật khẩu - Nhập email để gửi link reset
// =====================================================

"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, BookOpen, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call to send reset password email
    try {
      // Replace with your API endpoint
      // await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   body: JSON.stringify({ email })
      // });

      setTimeout(() => {
        setIsLoading(false);
        setIsSent(true);
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      setError("Failed to send reset email. Please try again.");
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              English Learning
            </h1>
            <p className="text-gray-600 mt-2">Master English with confidence</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-100 rounded-full -mr-20 -mt-20 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100 rounded-full -ml-16 -mb-16 opacity-50"></div>

            <div className="relative z-10 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <Mail className="w-10 h-10 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Check Your Email
                </h2>
                <p className="text-gray-600 mt-2">
                  We've sent a password reset link to
                </p>
                <p className="text-green-600 font-semibold mt-1">{email}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                <p className="text-sm text-gray-700 font-medium mb-2">
                  Next steps:
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-1.5"></span>
                    <span>Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-1.5"></span>
                    <span>Click the reset password link</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-1.5"></span>
                    <span>Create a new password</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Back to Login
              </button>

              <p className="text-sm text-gray-600">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setIsSent(false)}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">English Learning</h1>
          <p className="text-gray-600 mt-2">Master English with confidence</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-100 rounded-full -mr-20 -mt-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100 rounded-full -ml-16 -mb-16 opacity-50"></div>

          <div className="relative z-10">
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Forgot Password?
                </h2>
                <p className="text-gray-600 mt-2">
                  No worries! Enter your email and we'll send you a password
                  reset link.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="your.email@example.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => router.push("/authentication/login")}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a
              href="#"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
