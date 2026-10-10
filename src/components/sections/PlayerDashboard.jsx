import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveSession } from "../../hooks/useActiveSession";
import { useCumulativeStats } from "../../hooks/useCumulativeStats";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/db";
import touchesLogo from "../../assets/touches.png";
import { InstallAppBanner } from "../InstallAppBanner";
import {
  Pointer,
  BarChart3,
  Brain,
  Star,
  LayoutGrid,
  Users,
  User,
  MessageSquare,
  ChevronRight,
  Zap,
  Activity,
  Trophy,
  Flame,
  Bot,
  Calendar,
} from "lucide-react";

export function PlayerDashboard() {
  const navigate = useNavigate();
  const { session, updateSession } = useActiveSession();
  const { user } = useAuth();
  const cumulativeStats = useCumulativeStats();

  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [, setForceUpdate] = useState(0);

  const handleSelectSide = (foot) => {
    try {
      const saved = JSON.parse(localStorage.getItem("playerProfile") || "{}");
      saved.activeFooter = foot;
      localStorage.setItem("playerProfile", JSON.stringify(saved));
    } catch (e) {}

    if (session?.id && updateSession) {
      updateSession({ activeFooter: foot });
    }
    setForceUpdate((prev) => prev + 1);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      setCurrentTimeStr(now.toLocaleString("en-US", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const savedProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem("playerProfile") || "{}");
    } catch (e) {
      return {};
    }
  })();

  const savedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {
      return {};
    }
  })();

  const playerName =
    user?.name ||
    user?.firstName ||
    user?.fullName ||
    user?.playerName ||
    savedUser?.name ||
    savedUser?.firstName ||
    savedUser?.fullName ||
    savedUser?.playerName ||
    savedProfile?.fullName ||
    savedProfile?.name ||
    session?.playerName ||
    session?.fullName ||
    "Player";

  const activeFoot = (
    session?.activeFooter ||
    user?.footer ||
    savedProfile?.activeFooter ||
    "RIGHT"
  ).toUpperCase();
  const isRightFoot = activeFoot === "RIGHT";
  const playerInitial =
    playerName && playerName.trim().length > 0
      ? playerName.trim().charAt(0).toUpperCase()
      : "A";

  const totalTouches = cumulativeStats.totalTouches || 0;
  const totalSessions = cumulativeStats.totalSessions || 0;
  const totalGoals = cumulativeStats.totalGoals || 0;
  const totalHoursTrained = cumulativeStats.totalHoursTrained || 0;

  return (
    <div className="bg-[#07090E] text-football-text pb-6 pt-1 px-1 sm:px-2 space-y-3">

      {/* ════════════════════════════════
          2. GREEN STADIUM HERO BANNER
      ════════════════════════════════ */}
      <div className="relative rounded-2xl p-4 shadow-2xl overflow-hidden text-white space-y-3.5 border border-emerald-500/30 bg-gradient-to-b from-[#14532D] via-[#0F3E22] to-[#0A2916]">
        {/* Background Soccer Pitch Markings Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 300 400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white"
          >
            <rect x="15" y="15" width="270" height="370" rx="6" />
            <line x1="15" y1="200" x2="285" y2="200" />
            <circle cx="150" cy="200" r="45" />
            <circle cx="150" cy="200" r="2" fill="currentColor" />
            <rect x="75" y="15" width="150" height="70" />
            <rect x="75" y="315" width="150" height="70" />
          </svg>
        </div>

        {/* Top Header Row: Welcome Text (Left) & Stick Figure Icon (Right) */}
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold text-emerald-300/90">
              Welcome back, player
            </p>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none">
              {playerName}
            </h1>

            {/* Date Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-medium text-emerald-300 mt-1.5 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{currentTimeStr || "Fri, Jul 24, 2026 · 9:05:39 AM"}</span>
            </div>
          </div>

          {/* Top Right Stick Figure Icon (White) */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
            <img
              src={isRightFoot ? "/right_foot.png" : "/left_foot.png"}
              alt="Stick Figure Icon"
              className="w-full h-full object-contain brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            />
          </div>
        </div>

        {/* 3 Top Stat Cards */}
        <div className="grid grid-cols-3 gap-2.5 relative z-10">
          <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-center">
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalTouches}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
              TOUCHES
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-center">
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalSessions}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
              SESSIONS
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-center">
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalGoals}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
              GOALS
            </div>
          </div>
        </div>

        {/* PICK YOUR SIDE CARD (Client Requested) */}
        <div className="relative z-10 bg-black/45 backdrop-blur-md border border-white/15 rounded-xl p-3 sm:p-3.5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>FOOTBALLER ATHLETICS CLUB • REGISTRY</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80">
              {isRightFoot ? "Right Foot Dominant" : "Left Foot Dominant"}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black uppercase tracking-wide text-white">
              Pick Your Side
            </h3>
            <p className="text-[10px] text-white/70 font-semibold">
              Are you a Left or Right Footer? Choose your dominant foot for training & match tracking.
            </p>
          </div>

          {/* Interactive Foot Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleSelectSide("LEFT")}
              className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                activeFoot === "LEFT"
                  ? "bg-[#FF4422] text-white border-[#FF4422] shadow-lg shadow-[#FF4422]/20"
                  : "bg-black/40 text-white/70 hover:bg-black/60 border-white/15"
              }`}
            >
              <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center p-0.5">
                <img src="/left_foot.png" alt="Left" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <span>LEFT FOOTER</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSide("RIGHT")}
              className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                activeFoot === "RIGHT"
                  ? "bg-[#00AEEF] text-white border-[#00AEEF] shadow-lg shadow-[#00AEEF]/20"
                  : "bg-black/40 text-white/70 hover:bg-black/60 border-white/15"
              }`}
            >
              <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center p-0.5">
                <img src="/right_foot.png" alt="Right" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <span>RIGHT FOOTER</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-white/60 pt-0.5 border-t border-white/10">
            <Zap size={11} className="text-yellow-400 flex-shrink-0" />
            <span>Active Selection: <span className={isRightFoot ? "text-[#00AEEF] font-black" : "text-[#FF4422] font-black"}>{isRightFoot ? "RIGHT FOOTER" : "LEFT FOOTER"}</span></span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          3. COMPACT MATCHDAY TRACKER STRIP
      ════════════════════════════════ */}
      {/* <div className="rounded-xl p-2.5 border border-white/10 bg-[#121620] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF4422]/20 text-[#FF4422] flex items-center justify-center flex-shrink-0">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-white">
              MATCHDAY PERFORMANCE TRACKER
            </h3>
            <p className="text-[9px] text-white/60 font-medium">
              Log touches & analyze stats live
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/touch-counter")}
          className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black text-[9px] uppercase tracking-wider border border-white/15 transition-all flex items-center gap-1 flex-shrink-0"
        >
          <span>START</span>
          <ChevronRight size={11} />
        </button>
      </div> */}

      {/* ════════════════════════════════
          4. YOUR TOOLS NAVIGATION SECTION (Compact)
      ════════════════════════════════ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
            YOUR TOOLS
          </h2>
        </div>

        {/* 2-Column Tools Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Touch Counter (First!) */}
          <button
            onClick={() => navigate("/touch-counter")}
            className="p-3 rounded-xl border-2 border-[#FF4422]/60 bg-[#12151D] hover:bg-[#FF4422]/10 transition-all text-left space-y-1.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#FF4422]/20 text-[#FF4422] flex items-center justify-center">
              <Pointer size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#FF4422] transition-colors">
                Touch Counter
              </h3>
              <p className="text-[9px] text-white/60 font-medium">
                Track every action live
              </p>
            </div>
          </button>

          {/* Player Stats */}
          <button
            onClick={() => navigate("/stats")}
            className="p-3 rounded-xl border border-white/10 bg-[#12151D] hover:bg-white/5 transition-all text-left space-y-1.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#00AEEF]/20 text-[#00AEEF] flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#00AEEF] transition-colors">
                Player Stats
              </h3>
              <p className="text-[9px] text-white/60 font-medium">
                Lifetime totals
              </p>
            </div>
          </button>

          {/* Player Passport */}
          <button
            onClick={() => navigate("/passport")}
            className="p-3 rounded-xl border border-white/10 bg-[#12151D] hover:bg-white/5 transition-all text-left space-y-1.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E8470A]/20 text-[#E8470A] flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#E8470A] transition-colors">
                Player Passport
              </h3>
              <p className="text-[9px] text-white/60 font-medium">
                Your player ID
              </p>
            </div>
          </button>

          {/* 30-Day Challenge */}
          <button
            onClick={() => navigate("/challenge")}
            className="p-3 rounded-xl border border-white/10 bg-[#12151D] hover:bg-white/5 transition-all text-left space-y-1.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
              <Flame size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#10B981] transition-colors">
                30-Day Challenge
              </h3>
              <p className="text-[9px] text-white/60 font-medium">
                Daily skills & drills
              </p>
            </div>
          </button>

          {/* Reflection */}
          <button
            onClick={() => navigate("/reflection")}
            className="p-3 rounded-xl border border-white/10 bg-[#12151D] hover:bg-white/5 transition-all text-left space-y-1.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
              <Brain size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#10B981] transition-colors">
                Reflection
              </h3>
              <p className="text-[9px] text-white/60 font-medium">
                Post-match review
              </p>
            </div>
          </button>

          {/* Evaluation */}
          <button
            onClick={() => navigate("/evaluation")}
            className="p-3 rounded-xl border border-white/10 bg-[#12151D] hover:bg-white/5 transition-all text-left space-y-1.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center">
              <Star size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#F59E0B] transition-colors">
                Evaluation
              </h3>
              <p className="text-[9px] text-white/60 font-medium">
                Grade your game
              </p>
            </div>
          </button>

          {/* Lineup */}
          <button
            onClick={() => navigate("/lineup")}
            className="p-3 rounded-xl border border-white/10 bg-[#12151D] hover:bg-white/5 transition-all text-left space-y-1.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center">
              <LayoutGrid size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#3B82F6] transition-colors">
                Lineup
              </h3>
              <p className="text-[9px] text-white/60 font-medium">Team sheet</p>
            </div>
          </button>

          {/* Roster */}
          <button
            onClick={() => navigate("/roster")}
            className="p-3 rounded-xl border border-white/10 bg-[#12151D] hover:bg-white/5 transition-all text-left space-y-1.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#8B5CF6] transition-colors">
                Roster
              </h3>
              <p className="text-[9px] text-white/60 font-medium">
                Grade all players
              </p>
            </div>
          </button>

          {/* AI Player Agent */}
          <button
            onClick={() => navigate("/ai-agent")}
            className="p-3 rounded-xl border border-yellow-500/40 bg-[#12151D] hover:bg-yellow-500/10 transition-all text-left space-y-1.5 group shadow-[0_0_8px_rgba(250,204,21,0.1)]"
          >
            <div className="w-9 h-9 rounded-lg bg-[#FF4422]/20 text-[#FF4422] flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-yellow-400 group-hover:text-yellow-300 transition-colors">
                AI Player Agent
              </h3>
              <p className="text-[9px] text-white/60 font-medium">
                Personal football mentor
              </p>
            </div>
          </button>

          {/* Match Day Prep (Last!) */}
          <button
            onClick={() => navigate("/match-prep")}
            className="p-3 rounded-xl border border-yellow-500/40 bg-[#12151D] hover:bg-yellow-500/10 transition-all text-left space-y-1.5 group shadow-[0_0_8px_rgba(250,204,21,0.1)]"
          >
            <div className="w-9 h-9 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-yellow-400 group-hover:text-yellow-300 transition-colors">
                Match Day Prep
              </h3>
              <p className="text-[9px] text-white/60 font-medium">
                Fixture & checklist
              </p>
            </div>
          </button>
        </div>

        {/* Note to Coach (Full Width) */}
        <button
          onClick={() => navigate("/note-to-coach")}
          className="w-full p-3 rounded-xl border border border-white/10 bg-[#12151D] hover:bg-white/5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#10B981] transition-colors">
                Note to Coach
              </h3>
              <p className="text-[9px] text-white/60 font-medium">
                Feedback & requests — direct
              </p>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-white/40 group-hover:text-white transition-colors"
          />
        </button>
      </div>
    </div>
  );
}
