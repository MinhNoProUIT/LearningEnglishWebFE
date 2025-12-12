"use client";
import React, { useState, useEffect } from "react";
import { Volume2, X } from "lucide-react";

export default function FlashcardApp() {
  const [screen, setScreen] = useState("flashcard"); // 'flashcard' or 'writing'
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    if (screen === "flashcard" && !isFlipped && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isFlipped) {
      setIsFlipped(true);
    }
  }, [timeLeft, isFlipped, screen]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setTimeLeft(10);
    }
  };

  const handleContinue = () => {
    setScreen("writing");
  };

  const handleSkip = () => {
    setIsFlipped(false);
    setTimeLeft(10);
  };

  const handleCheck = () => {
    // Logic kiểm tra đáp án
    console.log("Checking answer:", userInput);
  };

  if (screen === "writing") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header with Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                <X className="w-6 h-6 text-gray-600" />
              </button>
              {/* Progress Bar */}
              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Writing Exercise */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl text-gray-700 text-center mb-12">
              Nghe và viết lại
            </h2>

            {/* Audio and Hint Buttons */}
            <div className="flex justify-center gap-4 mb-12">
              <button className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full transition-colors border border-gray-300">
                <Volume2 className="w-7 h-7" style={{ color: "orange" }} />
              </button>

              <button className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full transition-colors border border-gray-300">
                <span className="text-3xl">🐌</span>
              </button>
            </div>

            {/* Input Field */}
            <div className="max-w-xl mx-auto">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Gõ lại từ bạn nghe được"
                className="w-full px-6 py-4 text-lg border-2 border-green-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Check Button */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <button
              onClick={handleCheck}
              disabled={!userInput.trim()}
              className={`w-full max-w-md font-bold py-4 px-8 rounded-2xl transition-colors text-lg ${
                userInput.trim()
                  ? "bg-gray-300 hover:bg-gray-400 text-gray-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Kiểm tra
            </button>
            <button
              onClick={() => setScreen("flashcard")}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header with Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
              <X className="w-6 h-6 text-gray-600" />
            </button>
            {/* Progress Bar */}
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: "40%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div
          className="relative w-full perspective-1000 cursor-pointer"
          onClick={handleFlip}
        >
          <div
            className={`relative w-full bg-white rounded-3xl shadow-2xl transition-all duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              minHeight: "450px",
            }}
          >
            {/* Front Side */}
            <div
              className={`absolute w-full h-full backface-hidden p-8 ${
                isFlipped ? "invisible" : "visible"
              }`}
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                {/* Audio and Hint Icons */}
                <div className="flex gap-4 mb-8">
                  <button className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full transition-colors border border-gray-300">
                    <Volume2 className="w-7 h-7" style={{ color: "orange" }} />
                  </button>

                  <button className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full transition-colors border border-gray-300">
                    <span className="text-3xl">🐌</span>
                  </button>
                </div>

                {/* Image */}
                <div className="mb-6 bg-gray-100 rounded-2xl overflow-hidden w-64 h-80">
                  <img
                    src="https://images.unsplash.com/photo-1524069290683-0457abfe42c3?w=400&h=500&fit=crop"
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text */}
                <p className="text-gray-800 text-lg text-center max-w-sm">
                  His younger sister is a{" "}
                  <span className="font-bold">student</span> at that university.
                </p>

                {/* Success Icon */}
                <div className="mt-6 text-4xl animate-bounce">👏</div>
              </div>
            </div>

            {/* Back Side */}
            <div
              className={`absolute w-full h-full backface-hidden p-8 ${
                !isFlipped ? "invisible" : "visible"
              }`}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                {/* Audio and Hint Icons */}
                <div className="flex gap-4 mb-12">
                  <button className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full transition-colors border border-gray-300">
                    <Volume2 className="w-7 h-7" style={{ color: "orange" }} />
                  </button>

                  <button className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full transition-colors border border-gray-300">
                    <span className="text-3xl">🐌</span>
                  </button>
                </div>

                {/* Word Definition */}
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    student
                  </h2>
                  <p className="text-gray-500 text-lg mb-2">/ˈstuːdnt/</p>
                  <p className="text-gray-700 text-xl">
                    Học sinh, sinh viên (n)
                  </p>
                </div>

                {/* Success Icon */}
                <div className="mt-12 text-4xl animate-bounce">👏</div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-flip Timer */}

        {/* Buttons */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            onClick={handleContinue}
            className="w-full max-w-md bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-2xl transition-colors text-lg"
          >
            Tiếp tục
          </button>
          <button
            onClick={handleSkip}
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Mình đã thuộc từ này
          </button>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
