import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Stack,
  IconButton,
  LinearProgress,
  Typography,
  Paper,
  Chip,
} from "@mui/material";
import { Play, Pause, Volume2, VolumeX, RefreshCw } from "lucide-react";

interface TextToSpeechPlayerProps {
  text: string;
  onEnded: () => void;
  autoPlay?: boolean;
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Preprocess text for natural IELTS speech with proper pauses
const preprocessTextForSpeech = (text: string): string[] => {
  if (!text) return [];

  let processed = text;

  // Remove HTML tags
  processed = processed.replace(/<[^>]*>/g, " ");

  // Normalize whitespace
  processed = processed.replace(/\s+/g, " ").trim();

  // Split into chunks by sentence terminators to avoid browser TTS timeout limits (approx 15s in Chrome)
  // This split looks for [.!?] followed by a space or end of string
  const chunks = processed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [processed];

  return chunks
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
};

const TextToSpeechPlayer: React.FC<TextToSpeechPlayerProps> = ({
  text,
  onEnded,
  autoPlay = false,
  language = "en-GB",
  rate = 0.9,
  pitch = 1.0,
  volume = 1.0,
}) => {
  // State
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Progress State
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [chunks, setChunks] = useState<string[]>([]);

  // Display State
  const [totalEstimatedDuration, setTotalEstimatedDuration] = useState(0);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState("0:00");
  const [error, setError] = useState<string | null>(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  // Refs
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);

  // Format time helper (seconds -> mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 1. Load Voices Robustly
  useEffect(() => {
    const loadVoices = () => {
      const vs = window.speechSynthesis.getVoices();
      if (vs.length > 0) {
        setVoices(vs);
        setError(null);
      }
    };

    loadVoices();

    // Chrome needs this event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Fallback if event doesn't fire immediately
    const interval = setInterval(loadVoices, 500);
    setTimeout(() => clearInterval(interval), 5000); // Stop polling after 5s

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      clearInterval(interval);
      cancelSpeech();
    };
  }, []);

  // 2. Prepare Chunks
  useEffect(() => {
    const newChunks = preprocessTextForSpeech(text);
    setChunks(newChunks);
    setCurrentChunkIndex(0);

    // Estimate total duration: ~150 words per minute at rate 1.0
    const wordCount = text.split(/\s+/).length;
    const duration = Math.ceil((wordCount / (150 * rate)) * 60);
    setTotalEstimatedDuration(duration);
  }, [text, rate]);

  const cancelSpeech = () => {
    window.speechSynthesis.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // 3. Play Logic (Chunk by Chunk)
  const speakChunk = useCallback(
    (index: number) => {
      if (index >= chunks.length) {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentChunkIndex(0);
        elapsedBeforePauseRef.current = 0; // Reset
        onEnded();
        return;
      }

      if (voices.length === 0) {
        setError("Đang tải giọng đọc...");
        return;
      }

      // Cancel previous
      window.speechSynthesis.cancel();

      const chunkText = chunks[index];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      synthRef.current = utterance;

      // Voice Selection (Prioritize British Female/Google)
      const selectedVoice =
        voices.find((v) => v.lang === "en-GB" && v.name.includes("Female")) ||
        voices.find((v) => v.lang === "en-GB" && v.name.includes("Google")) ||
        voices.find((v) => v.lang === "en-GB") ||
        voices.find((v) => v.lang.startsWith("en-")) ||
        voices[0];

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        setSelectedVoiceName(`${selectedVoice.name}`);
      }

      utterance.lang = language;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = isMuted ? 0 : volume;

      utterance.onstart = () => {
        setError(null);
      };

      utterance.onend = () => {
        setCurrentChunkIndex((prev) => prev + 1);
        speakChunk(index + 1);
      };

      utterance.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") return;
        if (e.error === "not-allowed") {
          setIsPlaying(false);
          setIsPaused(true);
          setError("Tự động phát bị chặn. Vui lòng bấm Play.");
          return;
        }
        console.error("TTS Error", e);
        // Try to skip to next chunk on error to keep going
        setTimeout(() => {
          setCurrentChunkIndex((prev) => prev + 1);
          speakChunk(index + 1);
        }, 500);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error(err);
        setError("Lỗi khởi tạo âm thanh.");
      }
    },
    [chunks, voices, language, rate, pitch, volume, isMuted, onEnded]
  );

  // Main Play handler
  const playAudio = useCallback(() => {
    if (voices.length === 0) {
      setError("Không tìm thấy giọng đọc. Vui lòng đợi hoặc tải lại trang.");
      // Attempt to refresh voices
      const vs = window.speechSynthesis.getVoices();
      if (vs.length > 0) setVoices(vs);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);

    // If resuming from start or continuing
    if (currentChunkIndex === 0 && !isPaused) {
      startTimeRef.current = Date.now();
    } else if (isPaused) {
      // Adjust start time to account for pause duration
      startTimeRef.current = Date.now() - elapsedBeforePauseRef.current;
    }

    speakChunk(currentChunkIndex);

    // Start Progress Timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      elapsedBeforePauseRef.current = now - startTimeRef.current; // Track elapsed in ms

      // Clamp display time
      const displayTime = Math.min(elapsed, totalEstimatedDuration);
      setCurrentTimeDisplay(formatTime(displayTime));

      if (
        displayTime >= totalEstimatedDuration &&
        currentChunkIndex === chunks.length - 1
      ) {
        // Don't stop timer yet, let onEnded handle it
      }
    }, 500);
  }, [
    voices,
    currentChunkIndex,
    isPaused,
    speakChunk,
    totalEstimatedDuration,
    chunks.length,
  ]);

  // Pause Handler
  const pauseAudio = useCallback(() => {
    window.speechSynthesis.cancel(); // Cancel current utterance
    setIsPlaying(false);
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Autoplay Trigger
  useEffect(() => {
    if (
      autoPlay &&
      voices.length > 0 &&
      chunks.length > 0 &&
      !isPlaying &&
      !isPaused
    ) {
      // Small timeout to allow UI to settle
      const t = setTimeout(() => {
        playAudio();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [autoPlay, voices, chunks, isPlaying, isPaused, playAudio]);

  // Calculate generic progress percentage for bar
  const progressPercent = Math.min(
    (currentChunkIndex / (chunks.length || 1)) * 100,
    100
  );

  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        bgcolor: isPlaying ? "#f0f9ff" : error ? "#fff5f5" : "#fef3c7",
        border: `1px solid ${
          isPlaying ? "#bae6fd" : error ? "#feb2b2" : "#fde68a"
        }`,
      }}
    >
      <Stack spacing={2}>
        {/* Header Info */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Chip
            label="🔊 IELTS Audio (TTS)"
            size="small"
            sx={{
              bgcolor: "#dbeafe",
              color: "#1e40af",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
          {selectedVoiceName && !error && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ maxWidth: 200 }}
            >
              {selectedVoiceName}
            </Typography>
          )}
        </Stack>

        {/* Player Controls */}
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            onClick={isPlaying ? pauseAudio : playAudio}
            disabled={voices.length === 0}
            sx={{
              width: 48,
              height: 48,
              bgcolor: isPlaying ? "#0ea5e9" : "#d97706",
              color: "white",
              "&:hover": {
                bgcolor: isPlaying ? "#0284c7" : "#b45309",
              },
              "&.Mui-disabled": {
                bgcolor: "#9ca3af",
              },
            }}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: isPlaying ? "#e0f2fe" : "#fde68a",
                "& .MuiLinearProgress-bar": {
                  bgcolor: isPlaying ? "#0ea5e9" : "#d97706",
                  transition: "transform 0.2s linear",
                },
              }}
            />
            <Stack direction="row" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                {currentTimeDisplay}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ~{formatTime(totalEstimatedDuration)}
              </Typography>
            </Stack>
          </Box>

          <IconButton
            onClick={() => setIsMuted(!isMuted)}
            sx={{
              width: 40,
              height: 40,
              color: isMuted ? "#dc2626" : "#0ea5e9",
            }}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </IconButton>
        </Stack>

        {/* Status / Error Messages */}
        {error && (
          <Paper
            sx={{
              p: 1.5,
              bgcolor: "#fee2e2",
              borderRadius: 1,
              border: "1px solid #fca5a5",
              cursor: "pointer",
            }}
            onClick={playAudio}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <RefreshCw size={14} className="text-red-700" />
              <Typography
                variant="caption"
                color="#991b1b"
                fontWeight={600}
                sx={{ flex: 1 }}
              >
                {error}
              </Typography>
            </Stack>
          </Paper>
        )}

        {voices.length === 0 && !error && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            Đang tải thư viện giọng nói... (Nếu quá lâu, hãy thử tải lại trang)
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default TextToSpeechPlayer;
