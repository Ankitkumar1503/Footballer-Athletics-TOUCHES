import React, { useEffect, useState } from "react";
import { useActiveSession } from "../../hooks/useActiveSession";
import { db } from "../../lib/db";
import { RotateCcw } from "lucide-react";

export function LiveStats({ isPdf }) {
  const { stats, sessionId } = useActiveSession();

  const handleReset = async () => {
    if (!sessionId) return;
    if (confirm("Are you sure you want to reset the touches for this session?")) {
      try {
        await db.touches.where("sessionId").equals(sessionId).delete();
      } catch (error) {
        console.error("Error resetting touches:", error);
      }
    }
  };

  const getSavedProfile = () => {
    try {
      const raw = localStorage.getItem("playerProfile");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const profile = getSavedProfile();
  const playerName = localStorage.getItem("touch_playerName") || profile?.fullName || profile?.playerName || "Player";
  const age = localStorage.getItem("touch_age") || profile?.age || "-";
  const position = localStorage.getItem("touch_position") || profile?.position || "Forward";
  const playerNumber = localStorage.getItem("touch_number") || profile?.number || profile?.jerseyNumber || "-";
  const trainingLoc = localStorage.getItem("trainingLocation") || "Training Pitch";
  const gameLoc = localStorage.getItem("gameLocation") || "Main Stadium";

  const statList = [
    { label: "PASS", value: stats.Pass || 0 },
    { label: "DRIBBLE", value: stats.Dribble || 0 },
    { label: "SHOT", value: stats.Shot || 0 },
    { label: "CROSS", value: stats.Cross || 0 },
    { label: "GOAL", value: stats.Goal || 0 },
    { label: "HEADER", value: stats.Header || 0 },
    { label: "TACKLE", value: stats.Tackle || 0 },
    { label: "THROW-IN", value: stats["Throw-In"] || 0 },
    { label: "CORNER KICK", value: stats["Corner Kick"] || 0 },
    { label: "FREE KICK", value: stats["Free Kick"] || 0 },
    { label: "PENALTY", value: stats.Penalty || stats["Penalty Kick"] || 0 },
    { label: "KEEP-UP-FEET", value: stats["Keep-Up-Feet"] || 0 },
    { label: "KEEP-UP-HEAD", value: stats["Keep-Up-Head"] || 0 },
    { label: "YELLOW CARD", value: stats["Yellow Card"] || 0, color: "text-yellow-400" },
    { label: "RED CARD", value: stats["Red Card"] || 0, color: "text-rose-400" },
    { label: "MISSED GAME", value: stats["Missed Game"] || 0 },
    { label: "SUB IN", value: stats["Sub In"] || 0 },
    { label: "SUB OUT", value: stats["Sub Out"] || 0 },
    { label: "INJURY", value: stats.Injury || 0 },
    { label: "POSITIVE TOUCHES", value: stats.good || 0, color: "text-emerald-400" },
    { label: "NEGATIVE TOUCHES", value: stats.bad || 0, color: "text-rose-400" },
  ];

  return (
    <div className="space-y-3 pt-2 select-none">
      {/* ── Standard Dark PDF Header ── */}
      {isPdf && (
        <div className="text-center pb-3 mb-2 border-b border-white/15">
          <div className="text-[10px] font-black tracking-[0.25em] text-[#FF4422] uppercase">
            FOOTBALLER ATHLETICS • TOUCHES
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white mt-1">
            TOUCH COUNTER
          </h1>
          <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-0.5">
            SESSION TOUCH SUMMARY
          </p>
        </div>
      )}

      {/* Player Information & Session Context */}
      <div className="p-3 rounded-xl border border-white/10 bg-[#12151D] space-y-2">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-white/80">
          Player & Session Context
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-white/50 text-[9px] uppercase block font-bold">Player Name</span>
            <span className="text-white font-bold">{playerName}</span>
          </div>
          <div>
            <span className="text-white/50 text-[9px] uppercase block font-bold">Age</span>
            <span className="text-white font-bold">{age}</span>
          </div>
          <div>
            <span className="text-white/50 text-[9px] uppercase block font-bold">Position</span>
            <span className="text-white font-bold">{position}</span>
          </div>
          <div>
            <span className="text-white/50 text-[9px] uppercase block font-bold">Number</span>
            <span className="text-white font-bold">{playerNumber}</span>
          </div>
          <div>
            <span className="text-white/50 text-[9px] uppercase block font-bold">Training Location</span>
            <span className="text-white font-bold">{trainingLoc}</span>
          </div>
          <div>
            <span className="text-white/50 text-[9px] uppercase block font-bold">Game Location</span>
            <span className="text-white font-bold">{gameLoc}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
          SESSION TOUCH SUMMARY
        </h3>
        {!isPdf && (
          <button
            onClick={handleReset}
            className="text-[9px] font-black uppercase text-football-text/50 hover:text-football-accent transition-colors flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>RESET SESSION</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {statList.map((item) => (
          <div
            key={item.label}
            className="p-2.5 rounded-xl border border-white/10 bg-[#12151D] flex items-center justify-between"
          >
            <span className="text-[9px] font-black uppercase tracking-wider text-white/70">
              {item.label}
            </span>
            <span className={`text-sm font-black ${item.color || "text-white"}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
