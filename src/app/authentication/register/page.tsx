"use client";
// src/app/authentication/register/page.tsx
// ==================== REGISTER PAGE ====================

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Auth imports
import { useRegisterMutation } from "@/services/AuthService";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

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
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch password để hiển thị requirements
  const password = watch("password");

  // Password requirements check
  const passwordRequirements = {
    minLength: password?.length >= 8,
    uppercase: /[A-Z]/.test(password || ""),
    lowercase: /[a-z]/.test(password || ""),
    number: /[0-9]/.test(password || ""),
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

      // Lưu email để hiển thị ở trang verify
      sessionStorage.setItem("verifyEmail", data.email);

      // Redirect to verify email page
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

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden py-8 px-4">
      {/* Background decorative circles */}
      <div className="absolute w-56 h-56 rounded-full bg-green-200 opacity-20 top-[5%] left-[8%]"></div>
      <div className="absolute w-44 h-44 rounded-full bg-emerald-200 opacity-20 top-[65%] left-[12%]"></div>
      <div className="absolute w-32 h-32 rounded-full bg-teal-200 opacity-20 top-[15%] right-[15%]"></div>
      <div className="absolute w-72 h-72 rounded-full bg-green-200 opacity-15 bottom-[8%] right-[10%]"></div>
      <div className="absolute w-24 h-24 rounded-full bg-emerald-200 opacity-20 bottom-[35%] left-[5%]"></div>
      <div className="absolute w-36 h-36 rounded-full bg-teal-200 opacity-15 top-[45%] right-[5%]"></div>

      {/* Main content */}
      <div className="flex max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Left side - Welcome message */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-green-50 to-emerald-50 p-12 flex-col justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <img
                src="/images/english-logo.jpg"
                alt="Logo"
                className="w-20 h-20 rounded-full object-cover shadow-lg"
              />
            </div>
          </div>

          {/* Welcome content */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-4 leading-tight">
              Welcome to
              <br />
              Evolingo!
            </h1>
            <p className="text-gray-600 text-base mb-8 leading-relaxed">
              Join our community and start your learning journey today. Create
              your account to access all features.
            </p>

            {/* Features list */}
            <div className="flex flex-col gap-3">
              {[
                "Interactive learning experience",
                "Track your progress",
                "Connect with peers",
                "Access premium content",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="text-green-600 w-6 h-6 flex-shrink-0" />
                  <span className="text-gray-700 text-[15px]">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">
              Already have an account?
            </p>
            <button
              onClick={() => router.push("/authentication/login")}
              className="px-8 py-2 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Right side - Registration form */}
        <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-4xl font-semibold text-gray-800 mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            Fill in your details to get started
          </p>

          {/* API Error */}
          {apiError && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-300 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-600 text-sm">{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              {...register("username")}
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 border-2 ${
                errors.username ? "border-red-300 bg-red-50" : "border-gray-200"
              } focus:border-green-500 focus:bg-white focus:outline-none mb-1 transition-all`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mb-4">{errors.username.message}</p>
            )}
            {!errors.username && <div className="mb-4"></div>}

            {/* Email */}
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              {...register("email")}
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 border-2 ${
                errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
              } focus:border-green-500 focus:bg-white focus:outline-none mb-1 transition-all`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mb-4">{errors.email.message}</p>
            )}
            {!errors.email && <div className="mb-4"></div>}

            {/* Password */}
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative mb-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                {...register("password")}
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 border-2 ${
                  errors.password ? "border-red-300 bg-red-50" : "border-gray-200"
                } focus:border-green-500 focus:bg-white focus:outline-none pr-12 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mb-2">{errors.password.message}</p>
            )}

            {/* Password Requirements */}
            {password && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Password must have:</p>
                <div className="grid grid-cols-2 gap-1">
                  <div
                    className={`text-xs flex items-center gap-1 ${
                      passwordRequirements.minLength
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <CheckCircle size={12} />
                    <span>8+ characters</span>
                  </div>
                  <div
                    className={`text-xs flex items-center gap-1 ${
                      passwordRequirements.uppercase
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <CheckCircle size={12} />
                    <span>Uppercase letter</span>
                  </div>
                  <div
                    className={`text-xs flex items-center gap-1 ${
                      passwordRequirements.lowercase
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <CheckCircle size={12} />
                    <span>Lowercase letter</span>
                  </div>
                  <div
                    className={`text-xs flex items-center gap-1 ${
                      passwordRequirements.number
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <CheckCircle size={12} />
                    <span>Number</span>
                  </div>
                </div>
              </div>
            )}
            {!password && !errors.password && <div className="mb-4"></div>}

            {/* Confirm Password */}
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative mb-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 border-2 ${
                  errors.confirmPassword
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                } focus:border-green-500 focus:bg-white focus:outline-none pr-12 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mb-4">
                {errors.confirmPassword.message}
              </p>
            )}
            {!errors.confirmPassword && <div className="mb-4"></div>}

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (termsError) setTermsError(null);
                }}
                disabled={isLoading}
                className="mt-1 w-4 h-4 accent-green-500"
              />
              <span className="text-gray-600 text-[13px]">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-green-600 hover:underline font-medium"
                >
                  Terms and Conditions
                </a>
              </span>
            </label>
            {termsError && (
              <p className="text-red-500 text-xs mb-4">{termsError}</p>
            )}
            {!termsError && <div className="mb-2"></div>}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium text-base hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg mb-6 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Mobile: Sign In Link */}
            <div className="md:hidden text-center mb-6">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <a
                  href="/authentication/login"
                  className="text-green-600 font-medium hover:underline"
                >
                  Sign In
                </a>
              </p>
            </div>

            {/* Support */}
            <div className="text-center">
              <p className="text-gray-500 text-[11px] mb-1">Need help?</p>
              <a
                href="mailto:tsc@maranatha.edu"
                className="text-green-600 text-[11px] hover:underline font-medium"
              >
                Contact us at tsc@maranatha.edu
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
