"use client";
import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Validate terms
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms and Conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your API endpoint
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Store email for verification page
        sessionStorage.setItem("verifyEmail", formData.email);
        // Redirect to verify page
        router.push(
          `/authentication/verify-email?email=${encodeURIComponent(
            formData.email
          )}`
        );
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      setErrors({ general: "Registration failed. Please try again." });
    }
  };

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
    };

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

          {/* General error */}
          {errors.general && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-300 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-600 text-sm">{errors.general}</span>
            </div>
          )}

          <div>
            {/* Full Name */}
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange("fullName")}
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 border-2 ${
                errors.fullName ? "border-red-300 bg-red-50" : "border-gray-200"
              } focus:border-green-500 focus:bg-white focus:outline-none mb-1 transition-all`}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mb-4">{errors.fullName}</p>
            )}
            {!errors.fullName && <div className="mb-4"></div>}

            {/* Email */}
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@maranatha.edu"
              value={formData.email}
              onChange={handleChange("email")}
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 border-2 ${
                errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
              } focus:border-green-500 focus:bg-white focus:outline-none mb-1 transition-all`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mb-4">{errors.email}</p>
            )}
            {!errors.email && <div className="mb-4"></div>}

            {/* Username */}
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange("username")}
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 border-2 ${
                errors.username ? "border-red-300 bg-red-50" : "border-gray-200"
              } focus:border-green-500 focus:bg-white focus:outline-none mb-1 transition-all`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mb-4">{errors.username}</p>
            )}
            {!errors.username && <div className="mb-4"></div>}

            {/* Password */}
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative mb-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange("password")}
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 border-2 ${
                  errors.password
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
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
              <p className="text-red-500 text-xs mb-4">{errors.password}</p>
            )}
            {!errors.password && <div className="mb-4"></div>}

            {/* Confirm Password */}
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative mb-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
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
                {errors.confirmPassword}
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
                  if (errors.terms) {
                    setErrors({ ...errors, terms: "" });
                  }
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
            {errors.terms && (
              <p className="text-red-500 text-xs mb-4">{errors.terms}</p>
            )}
            {!errors.terms && <div className="mb-2"></div>}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium text-base hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg mb-6 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
