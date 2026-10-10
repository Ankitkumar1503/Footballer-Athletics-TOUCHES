import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveSession } from "../../hooks/useActiveSession";
import { db } from "../../lib/db";
import { SectionActionBar } from "../ui/SectionActionBar";
import {
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Target,
  Zap,
  Award,
  CircleDot,
  Shield,
  Flag,
  RotateCw,
  Mic,
} from "lucide-react";

const ACTIONS_CONFIG = [
  { id: "Pass", label: "PASS", icon: ArrowRight },
  { id: "Dribble", label: "DRIBBLE", icon: Zap },
  { id: "Shot", label: "SHOT", icon: Target },
  { id: "Goal", label: "GOAL", icon: Award },
  { id: "Header", label: "HEADER", icon: CircleDot },
  { id: "Tackle", label: "TACKLE", icon: Shield },
  { id: "Free Kick", label: "FREE KICK", icon: RotateCw },
  { id: "Corner Kick", label: "CORNERS", icon: Flag },
  { id: "Throw-In", label: "THROW-IN", icon: ArrowRight },
  { id: "Penalty", label: "PENALTY", icon: Target },
  { id: "Keep-Up-Feet", label: "KEEP-UP-FEET", icon: Zap },
  { id: "Keep-Up-Head", label: "KEEP-UP-HEAD", icon: CircleDot },
];

const POSITIONS = [
  "Select Position",
  "Goalkeeper (GK)",
  "Center Back (CB)",
  "Left Back (LB)",
  "Right Back (RB)",
  "Defensive Midfielder (CDM)",
  "Central Midfielder (CM)",
  "Attacking Midfielder (CAM)",
  "Left Winger (LW)",
  "Right Winger (RW)",
  "Striker / Forward (ST)",
];

const MATCH_EVENTS_CONFIG = [
  { id: "Yellow Card", label: "YELLOW CARD", type: "yellow-card" },
  { id: "Red Card", label: "RED CARD", type: "red-card" },
  { id: "Missed Game", label: "MISSED GAME" },
  { id: "Sub In", label: "SUB IN" },
  { id: "Sub Out", label: "SUB OUT" },
  { id: "Injury", label: "INJURY" },
];

export function parseVoiceCommand(text) {
  if (!text) return null;
  const lower = text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  // Match events (strictly independent, no positive/negative)
  if (lower.includes("yellow card") || lower === "yellow") {
    return { type: "event", id: "Yellow Card" };
  }
  if (lower.includes("red card") || lower === "red") {
    return { type: "event", id: "Red Card" };
  }
  if (lower.includes("missed game") || lower.includes("missed match")) {
    return { type: "event", id: "Missed Game" };
  }
  if (lower.includes("sub in") || lower.includes("substitution in")) {
    return { type: "event", id: "Sub In" };
  }
  if (lower.includes("sub out") || lower.includes("substitution out")) {
    return { type: "event", id: "Sub Out" };
  }
  if (lower.includes("injury") || lower.includes("injured")) {
    return { type: "event", id: "Injury" };
  }
  if (lower.includes("goal")) {
    return { type: "event", id: "Goal" };
  }

  // Quality specification
  let quality = null;
  if (
    lower.includes("positive") ||
    lower.includes("good") ||
    lower.includes("plus") ||
    lower.startsWith("pos ")
  ) {
    quality = "Positive";
  } else if (
    lower.includes("negative") ||
    lower.includes("bad") ||
    lower.includes("minus") ||
    lower.startsWith("neg ")
  ) {
    quality = "Negative";
  }

  // Touch actions
  let actionId = null;
  if (lower.includes("pass")) actionId = "Pass";
  else if (lower.includes("dribble")) actionId = "Dribble";
  else if (lower.includes("shot") || lower.includes("shoot")) actionId = "Shot";
  else if (lower.includes("header") || lower.includes("head")) actionId = "Header";
  else if (lower.includes("tackle")) actionId = "Tackle";
  else if (lower.includes("free kick") || lower.includes("freekick")) actionId = "Free Kick";
  else if (lower.includes("corner")) actionId = "Corner Kick";
  else if (lower.includes("throw in") || lower.includes("throwin") || lower.includes("throw"))
    actionId = "Throw-In";
  else if (lower.includes("penalty")) actionId = "Penalty";
  else if (
    lower.includes("keep-left") ||
    lower.includes("keep left") ||
    lower.includes("keep up feet") ||
    lower.includes("keep feet")
  )
    actionId = "Keep-Up-Feet";
  else if (
    lower.includes("keep-head") ||
    lower.includes("keep head") ||
    lower.includes("keep up head")
  )
    actionId = "Keep-Up-Head";

  if (actionId) {
    return { type: "touch", id: actionId, quality };
  }

  return null;
}

export function ActionWheel() {
  const navigate = useNavigate();
  const { stats, sessionId, addTouch, removeTouch, updateSession } = useActiveSession();
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [lastLoggedAction, setLastLoggedAction] = useState(null);

  // Voice Command States
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [manualVoiceInput, setManualVoiceInput] = useState("");

  const getSavedProfile = () => {
    try {
      const raw = localStorage.getItem("playerProfile");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const initialProfile = getSavedProfile();

  const [playerName, setPlayerName] = useState(() => {
    return (
      localStorage.getItem("touch_playerName") ||
      initialProfile?.fullName ||
      initialProfile?.playerName ||
      ""
    );
  });
  const [age, setAge] = useState(() => {
    return (
      localStorage.getItem("touch_age") ||
      (initialProfile?.age ? String(initialProfile.age) : "")
    );
  });
  const [position, setPosition] = useState(() => {
    return (
      localStorage.getItem("touch_position") ||
      initialProfile?.position ||
      "Select Position"
    );
  });
  const [playerNumber, setPlayerNumber] = useState(() => {
    return (
      localStorage.getItem("touch_number") ||
      (initialProfile?.number || initialProfile?.jerseyNumber
        ? String(initialProfile?.number || initialProfile?.jerseyNumber)
        : "")
    );
  });

  const [trainingLocation, setTrainingLocation] = useState(() => {
    return localStorage.getItem("trainingLocation") || "";
  });
  const [gameLocation, setGameLocation] = useState(() => {
    return localStorage.getItem("gameLocation") || "";
  });
  const [timeInTraining, setTimeInTraining] = useState(() => {
    return Number(localStorage.getItem("timeInTraining")) || 60;
  });
  const [minutesPlayed, setMinutesPlayed] = useState(() => {
    return Number(localStorage.getItem("minutesPlayed")) || 120;
  });

  useEffect(() => {
    localStorage.setItem("touch_playerName", playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem("touch_age", age);
  }, [age]);

  useEffect(() => {
    localStorage.setItem("touch_position", position);
  }, [position]);

  useEffect(() => {
    localStorage.setItem("touch_number", playerNumber);
  }, [playerNumber]);

  useEffect(() => {
    localStorage.setItem("trainingLocation", trainingLocation);
  }, [trainingLocation]);

  useEffect(() => {
    localStorage.setItem("gameLocation", gameLocation);
  }, [gameLocation]);

  useEffect(() => {
    localStorage.setItem("timeInTraining", timeInTraining);
  }, [timeInTraining]);

  useEffect(() => {
    localStorage.setItem("minutesPlayed", minutesPlayed);
  }, [minutesPlayed]);

  const handleActionTap = async (actionId, overrideQuality = null) => {
    const isIndependent = [
      "Goal",
      "Keep-Up-Feet",
      "Keep-Up-Head",
      "Yellow Card",
      "Red Card",
      "Missed Game",
      "Sub In",
      "Sub Out",
      "Injury",
    ].includes(actionId);

    const quality = isIndependent ? "Event" : (overrideQuality !== null ? overrideQuality : selectedQuality);
    await addTouch(actionId, quality);
    setLastLoggedAction({ action: actionId, quality });
    setTimeout(() => setLastLoggedAction(null), 1200);
  };

  const handleEventTap = async (eventId) => {
    await addTouch(eventId, "Event");
    setLastLoggedAction({ action: eventId, quality: "Event" });
    setTimeout(() => setLastLoggedAction(null), 1200);
  };

  const handleEventDecrement = async (e, eventId) => {
    e.stopPropagation();
    if (removeTouch) {
      await removeTouch(eventId);
    }
  };

  const lastActionTapRef = useRef({});
  const actionTimerRef = useRef({});

  const handleActionClick = (actionId) => {
    const now = Date.now();
    const lastTap = lastActionTapRef.current[actionId] || 0;
    if (now - lastTap < 300) {
      if (actionTimerRef.current[actionId]) {
        clearTimeout(actionTimerRef.current[actionId]);
        actionTimerRef.current[actionId] = null;
      }
      lastActionTapRef.current[actionId] = 0;
      if (removeTouch) {
        removeTouch(actionId);
      }
    } else {
      lastActionTapRef.current[actionId] = now;
      actionTimerRef.current[actionId] = setTimeout(() => {
        handleActionTap(actionId);
        actionTimerRef.current[actionId] = null;
      }, 220);
    }
  };

  const lastEventTapRef = useRef({});
  const eventTimerRef = useRef({});

  const handleEventClick = (eventId) => {
    const now = Date.now();
    const lastTap = lastEventTapRef.current[eventId] || 0;
    if (now - lastTap < 300) {
      if (eventTimerRef.current[eventId]) {
        clearTimeout(eventTimerRef.current[eventId]);
        eventTimerRef.current[eventId] = null;
      }
      lastEventTapRef.current[eventId] = 0;
      if (removeTouch) {
        removeTouch(eventId);
      }
    } else {
      lastEventTapRef.current[eventId] = now;
      eventTimerRef.current[eventId] = setTimeout(() => {
        handleEventTap(eventId);
        eventTimerRef.current[eventId] = null;
      }, 220);
    }
  };

  const handleSaveSession = async () => {
    localStorage.setItem("touch_playerName", playerName);
    localStorage.setItem("touch_age", age);
    localStorage.setItem("touch_position", position);
    localStorage.setItem("touch_number", playerNumber);
    localStorage.setItem("trainingLocation", trainingLocation);
    localStorage.setItem("gameLocation", gameLocation);
    localStorage.setItem("timeInTraining", timeInTraining);
    localStorage.setItem("minutesPlayed", minutesPlayed);

    if (updateSession) {
      await updateSession({
        playerName,
        age,
        position,
        playerNumber,
        trainingLocation,
        gameLocation,
        timeInTraining,
        minutesPlayed,
      });
    }
  };

  const handleResetSessionTouches = async () => {
    if (!sessionId) return;
    if (confirm("Are you sure you want to reset all touches for this session?")) {
      try {
        await db.touches.where("sessionId").equals(sessionId).delete();
      } catch (error) {
        console.error("Error resetting touches:", error);
      }
    }
  };

  // Process voice command using existing handlers
  const processVoiceCommand = async (transcript) => {
    setIsListening(false);
    const result = parseVoiceCommand(transcript);
    if (!result) {
      setVoiceFeedback({
        type: "error",
        message: `Command not recognized: "${transcript}"`,
      });
      setTimeout(() => setVoiceFeedback(null), 3000);
      return;
    }

    if (result.type === "touch") {
      const effectiveQuality = result.quality || selectedQuality;
      if (result.quality) {
        setSelectedQuality(result.quality);
      }
      await handleActionTap(result.id, effectiveQuality);
      setVoiceFeedback({
        type: "success",
        message: `✓ Recognized: ${effectiveQuality ? `${effectiveQuality} ` : ""}${result.id}`,
      });
      setTimeout(() => setVoiceFeedback(null), 2500);
    } else if (result.type === "event") {
      await handleEventTap(result.id);
      setVoiceFeedback({
        type: "success",
        message: `✓ Recognized: ${result.id}`,
      });
      setTimeout(() => setVoiceFeedback(null), 2500);
    }
  };

  const recognitionRef = useRef(null);
  const isExplicitlyActiveRef = useRef(false);
  const lastProcessedTranscriptRef = useRef({ text: "", time: 0 });

  const stopVoiceRecognition = () => {
    isExplicitlyActiveRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setVoiceFeedback({ type: "info", message: "Microphone stopped" });
    setTimeout(() => setVoiceFeedback(null), 2000);
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsVoiceModalOpen(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognitionRef.current = recognition;
      isExplicitlyActiveRef.current = true;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback({
          type: "listening",
          message: "Listening continuously... speak commands (e.g. 'positive pass', 'goal')",
        });
      };

      recognition.onresult = (event) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0]?.transcript?.trim();
        if (!transcript) return;

        // Prevent duplicate processing of the same speech result
        const now = Date.now();
        if (
          transcript.toLowerCase() ===
            lastProcessedTranscriptRef.current.text.toLowerCase() &&
          now - lastProcessedTranscriptRef.current.time < 1200
        ) {
          return;
        }
        lastProcessedTranscriptRef.current = { text: transcript, time: now };
        processVoiceCommand(transcript);
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech") {
          return;
        }
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          isExplicitlyActiveRef.current = false;
          setIsListening(false);
          setVoiceFeedback({
            type: "error",
            message: "Microphone access denied. Please allow microphone in browser.",
          });
          setTimeout(() => setVoiceFeedback(null), 3500);
          return;
        }
        console.warn("Speech recognition notice:", event.error);
      };

      recognition.onend = () => {
        // If listening was not explicitly turned off by the user, keep listening active
        if (isExplicitlyActiveRef.current) {
          try {
            setTimeout(() => {
              if (isExplicitlyActiveRef.current) {
                recognition.start();
              }
            }, 250);
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      isExplicitlyActiveRef.current = false;
      setIsListening(false);
      setIsVoiceModalOpen(true);
    }
  };

  useEffect(() => {
    return () => {
      isExplicitlyActiveRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const total = stats.total || 0;
  const positiveCount = stats.good || 0;
  const negativeCount = stats.bad || 0;

  const positivePercent = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
  const negativePercent = total > 0 ? Math.round((negativeCount / total) * 100) : 0;

  return (
    <div className="space-y-3 pb-6 select-none max-w-md mx-auto">
      {/* ── 1. TOUCH COUNTER TITLE & VOICE MIC BUTTON ── */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black uppercase text-white tracking-wider">
            TOUCH COUNTER
          </h2>

          <div className="px-2 py-0.5 rounded-full border border-red-500 text-red-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        {/* Compact Voice Command Button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleVoiceRecognition}
            title={
              isListening
                ? "Listening... Click to stop"
                : "Continuous Voice Commands (e.g. 'positive pass', 'yellow card')"
            }
            className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all ${
              isListening
                ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/40 animate-pulse"
                : "bg-[#12151D] text-white/80 border-white/10 hover:text-white hover:border-white/30 hover:bg-white/5"
            }`}
          >
            <Mic size={16} className={isListening ? "animate-bounce" : ""} />
            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
              {isListening ? "Listening (Tap to stop)" : "Voice"}
            </span>
          </button>
        </div>
      </div>

      {/* Voice Feedback Notification Toast */}
      {voiceFeedback && (
        <div
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
            voiceFeedback.type === "error"
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
              : voiceFeedback.type === "listening"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200 animate-pulse"
              : "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
          }`}
        >
          <span>{voiceFeedback.message}</span>
          <button
            onClick={() => setVoiceFeedback(null)}
            className="text-white/60 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 2. PLAYER INFORMATION SECTION (IMAGE 2 LAYOUT: COMPACT 4 ROWS ABOVE PITCH) ── */}
      <div className="space-y-2 p-3 rounded-2xl border border-white/10 bg-[#0E121A]">
        {/* Row 1: PLAYER NAME & AGE */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <input
              type="text"
              placeholder="Enter player name"
              aria-label="Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-[#12151D] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-white/40 placeholder:text-white/30"
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Age"
              aria-label="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-[#12151D] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-white/40 placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Row 2: PLAYER POSITION & NUMBER */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <select
              value={position}
              aria-label="Player Position"
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-[#12151D] border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs font-semibold focus:outline-none focus:border-white/40"
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos} className="bg-[#12151D] text-white">
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="number"
              placeholder="Jersey No."
              aria-label="Jersey Number"
              value={playerNumber}
              onChange={(e) => setPlayerNumber(e.target.value)}
              className="w-full bg-[#12151D] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-white/40 placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Row 3: TRAINING LOCATION */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-white/70">
            TRAINING LOCATION
          </label>
          <input
            type="text"
            placeholder="Enter training location"
            value={trainingLocation}
            onChange={(e) => setTrainingLocation(e.target.value)}
            className="w-full bg-[#12151D] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-white/40 placeholder:text-white/30"
          />
        </div>

        {/* Row 4: GAME LOCATION */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-white/70">
            GAME LOCATION
          </label>
          <input
            type="text"
            placeholder="Enter game location"
            value={gameLocation}
            onChange={(e) => setGameLocation(e.target.value)}
            className="w-full bg-[#12151D] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-white/40 placeholder:text-white/30"
          />
        </div>
      </div>

      {/* ── 3. GREEN FOOTBALL PITCH (WHITE CENTRAL COUNTER & WHITE TEXT) ── */}
      <div className="relative rounded-2xl p-5 shadow-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-[#14532D] via-[#0F3E22] to-[#0A2916] flex flex-col items-center justify-center min-h-[200px]">
        {/* Soccer Pitch Vector Markings */}
        <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 240"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white"
          >
            <rect x="15" y="15" width="370" height="210" rx="6" />
            <line x1="200" y1="15" x2="200" y2="225" />
            <circle cx="200" cy="120" r="45" />
            <circle cx="200" cy="120" r="2" fill="currentColor" />
            <rect x="15" y="60" width="70" height="120" />
            <rect x="315" y="60" width="70" height="120" />
          </svg>
        </div>

        {/* Central White Ring Counter Gauge (White border and White text as requested in Image 1) */}
        <div className="relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-black/40 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.25)] flex flex-col items-center justify-center space-y-0.5">
          <span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {total}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
            TOTAL TOUCHES
          </span>

          {lastLoggedAction && (
            <div className="absolute -bottom-3 px-3 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#10B981] text-white shadow-lg animate-bounce">
              +{lastLoggedAction.action}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. COMPACT POSITIVE / NEGATIVE SUMMARY ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#14532D] border border-emerald-500/40 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wider text-white">POSITIVE</span>
          <span className="text-xl font-black text-white">{positiveCount}</span>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#14532D] border border-emerald-500/40 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wider text-white">NEGATIVE</span>
          <span className="text-xl font-black text-white">{negativeCount}</span>
        </div>
      </div>

      {/* ── 5. POSITIVE / NEGATIVE SELECTOR ── */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] font-black uppercase tracking-wider text-white/60 px-0.5">
          HOW WAS THE PLAYER'S FIRST TOUCH?
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedQuality((prev) => (prev === "Positive" ? null : "Positive"))}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedQuality === "Positive"
                ? "bg-[#10B981] text-white shadow-md shadow-emerald-500/25"
                : "bg-[#374151] text-white border border-white/10 hover:bg-[#4B5563]"
            }`}
          >
            <ThumbsUp size={15} />
            <span>Positive</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuality((prev) => (prev === "Negative" ? null : "Negative"))}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedQuality === "Negative"
                ? "bg-[#EF4444] text-white shadow-md shadow-rose-500/25"
                : "bg-[#374151] text-white border border-white/10 hover:bg-[#4B5563]"
            }`}
          >
            <ThumbsDown size={15} />
            <span>Negative</span>
          </button>
        </div>
      </div>

      {/* ── 6. COMPACT 3-COLUMN TOUCH COUNTER GRID ── */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] font-black uppercase tracking-wider text-white/60 px-0.5">
          TOUCH TYPE - TAP TO LOG, DOUBLE-TAP TO UNDO
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ACTIONS_CONFIG.map((item) => {
            const count = stats[item.id] || 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleActionClick(item.id)}
                className="p-2.5 rounded-2xl border border-white/10 bg-[#24272F] hover:bg-[#2E323C] active:scale-95 transition-all text-center flex flex-col items-center justify-center h-20 shadow-sm select-none"
              >
                <span className="text-2xl font-black text-white leading-none">{count}</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-white/70 mt-1 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 7. COMPACT 3-COLUMN MATCH EVENTS (STRICTLY INDIVIDUAL EVENTS) ── */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] font-black uppercase tracking-wider text-white/60 px-0.5">
          MATCH EVENTS
        </div>

        <div className="grid grid-cols-3 gap-2">
          {MATCH_EVENTS_CONFIG.map((item) => {
            const count = stats[item.id] || 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleEventClick(item.id)}
                className="p-2.5 rounded-2xl border border-white/10 bg-[#24272F] hover:bg-[#2E323C] active:scale-95 transition-all text-center flex flex-col items-center justify-center h-20 shadow-sm select-none"
              >
                <span className="text-2xl font-black text-white leading-none">{count}</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-white/70 mt-1 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 8. TIME IN TRAINING & MINUTES PLAYED SLIDERS ── */}
      <div className="space-y-3 pt-2 p-3 rounded-2xl border border-white/10 bg-[#0E121A]">
        {(() => {
          const timePercent = Math.min(100, Math.max(0, (timeInTraining / 180) * 100));
          const minutesPercent = Math.min(100, Math.max(0, (minutesPlayed / 180) * 100));
          return (
            <>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-wider text-white/70">
                    TIME IN TRAINING
                  </label>
                  <span className="text-[#FF4422] font-black text-xs">
                    {timeInTraining} Minutes
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={timeInTraining}
                    onChange={(e) => setTimeInTraining(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #FF4422 0%, #FF4422 ${timePercent}%, rgba(255, 255, 255, 0.15) ${timePercent}%, rgba(255, 255, 255, 0.15) 100%)`,
                    }}
                    className="orange-range-slider flex-1"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-wider text-white/70">
                    MINUTES PLAYED
                  </label>
                  <span className="text-[#FF4422] font-black text-xs">
                    {minutesPlayed} Minutes
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={minutesPlayed}
                    onChange={(e) => setMinutesPlayed(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #FF4422 0%, #FF4422 ${minutesPercent}%, rgba(255, 255, 255, 0.15) ${minutesPercent}%, rgba(255, 255, 255, 0.15) 100%)`,
                    }}
                    className="orange-range-slider flex-1"
                  />
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* ── 9. ACTION BUTTONS (RESET, SHARE, PDF, SAVE) ── */}
      <SectionActionBar
        onReset={handleResetSessionTouches}
        onSave={handleSaveSession}
        sectionKey="touch-counter"
      />

      {/* ── VOICE COMMAND HELPER / FALLBACK MODAL ── */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151D] border border-white/20 rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic size={18} className="text-[#FF4422]" />
                <h4 className="text-sm font-black uppercase text-white tracking-wider">
                  Voice Command
                </h4>
              </div>
              <button
                onClick={() => setIsVoiceModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-white/70">
              Speak or type a command. Examples:
              <br />
              <span className="text-emerald-400 font-semibold">• "positive pass"</span>
              <br />
              <span className="text-rose-400 font-semibold">• "negative shot"</span>
              <br />
              <span className="text-yellow-400 font-semibold">• "yellow card"</span>
              <br />
              <span className="text-white/90 font-semibold">• "injury", "sub in", "goal"</span>
            </p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="e.g. positive pass"
                value={manualVoiceInput}
                onChange={(e) => setManualVoiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    processVoiceCommand(manualVoiceInput);
                    setManualVoiceInput("");
                    setIsVoiceModalOpen(false);
                  }
                }}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white text-xs"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    processVoiceCommand(manualVoiceInput);
                    setManualVoiceInput("");
                    setIsVoiceModalOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#FF4422] text-white text-xs font-black uppercase tracking-wider hover:bg-[#FF4422]/80 transition-colors"
                >
                  Execute Command
                </button>
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/10 text-white/80 text-xs font-bold hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionWheel;
