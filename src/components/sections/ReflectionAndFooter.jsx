import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { SectionActionBar } from "../ui/SectionActionBar";
import {
  MessageSquare,
  Home,
  Pointer,
  BarChart3,
  Settings,
  Save,
  RotateCcw,
  Share2,
  Download,
  Loader2,
  Bot,
  User,
  Contact2,
  Calendar,
  Flame,
  Award,
  Users,
  Star,
  StickyNote,
} from "lucide-react";
import { useActiveSession } from "../../hooks/useActiveSession";
import { db } from "../../lib/db";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ShareModal } from "./ShareModal";
import { useNavigate, useLocation } from "react-router-dom";

const WELL_DONE_TAGS = [
  "ATTACKING",
  "FINISHING",
  "DEFENDING",
  "TACKLING",
  "LONG BALLS",
  "TRAPPING",
  "TRANSITION",
  "FREE KICKS",
  "MARKING",
  "SPEED",
  "PENALTIES",
  "ENDURANCE",
  "CORNERS",
  "PASSING",
  "LEADERSHIP",
  "DECISIONS",
  "SUPPORT",
  "CREATE SPACE",
  "BALL CONTROL",
  "THROW-IN",
  "HEADING",
];

const PERFORMANCE_METRICS = [
  "ENDURANCE",
  "ENERGY",
  "DECISION MAKING",
  "CONFIDENCE",
  "MOTIVATION",
  "ENJOYMENT",
  "FOCUS",
  "PERFORMANCE",
  "FIRST TOUCH",
  "PASSING",
  "RECEIVING",
  "WILL",
  "FITNESS",
  "FUN",
  "WILL TO WIN",
  "TEAM PLAYER",
];

// Loading Overlay Component
function LoadingOverlay({ progress }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-football-card rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[var(--color-accent)] animate-spin" />
          <div className="text-center">
            <h3 className="text-lg font-black uppercase text-football-text mb-2">
              Generating PDF Report
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait...
            </p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[var(--color-accent)] h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {progress}% complete
          </p>
        </div>
      </div>
    </div>
  );
}

export function PlayerReflection({ isPdf, pdfPart }) {
  const { sessionId, reflection, updateReflection } = useActiveSession();

  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("playerReflection");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing localStorage data:", e);
        }
      }
    }
    return {
      wellDoneTags: [],
      playerName: "",
      playerAge: "",
      achievedGoal: "",
      whatLearned: "",
      whatWouldChange: "",
      detailedPerformance: {},
    };
  });

  useEffect(() => {
    localStorage.setItem("playerReflection", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (reflection) {
      const newData = {
        wellDoneTags: reflection.wellDoneTags || [],
        playerName: reflection.playerName || "",
        playerAge: reflection.playerAge || "",
        achievedGoal: reflection.achievedGoal || "",
        whatLearned: reflection.whatLearned || "",
        whatWouldChange: reflection.whatWouldChange || "",
        detailedPerformance: reflection.detailedPerformance || {},
      };

      const hasDbData =
        newData.wellDoneTags.length > 0 ||
        newData.playerName ||
        newData.playerAge ||
        newData.achievedGoal ||
        newData.whatLearned ||
        newData.whatWouldChange ||
        Object.keys(newData.detailedPerformance).length > 0;

      if (hasDbData && JSON.stringify(formData) !== JSON.stringify(newData)) {
        setFormData(newData);
      }
    }
  }, [reflection]);

  const handleTagToggle = async (tag) => {
    const currentTags = formData.wellDoneTags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    setFormData((prev) => ({ ...prev, wellDoneTags: newTags }));
    await updateReflection({ wellDoneTags: newTags });
  };

  const handleTextChange = async (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    await updateReflection({ [id]: value });
  };

  const handleMetricChange = async (metric, value) => {
    const newMetrics = {
      ...formData.detailedPerformance,
      [metric]: parseInt(value),
    };
    setFormData((prev) => ({ ...prev, detailedPerformance: newMetrics }));
    await updateReflection({ detailedPerformance: newMetrics });
  };

  let metricsToRender = PERFORMANCE_METRICS;
  if (isPdf) {
    if (pdfPart === 2) metricsToRender = metricsToRender.slice(0, 8);
    else if (pdfPart === 3) metricsToRender = metricsToRender.slice(8);
  }

  return (
    <div className="space-y-4 pb-4 select-none">
      {(!isPdf || !pdfPart || pdfPart === 1) && (
        <>
          {/* Section Header */}
          {isPdf ? (
            <div className="text-center pb-3 mb-2 border-b border-white/15">
              <div className="text-[10px] font-black tracking-[0.25em] text-[#FF4422] uppercase">
                FOOTBALLER ATHLETICS • TOUCHES
              </div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-white mt-1">
                PLAYER REFLECTION
              </h1>
              <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-0.5">
                POST-MATCH REVIEW & SELF-ASSESSMENT
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between py-1">
              <h2 className="text-xl font-black uppercase text-white tracking-wider">
                PLAYER REFLECTION
              </h2>
              <span className="text-[10px] font-bold text-white/50 tracking-wider">
                POST-MATCH REVIEW
              </span>
            </div>
          )}

          {/* Player Info Inputs */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl border border-white/10 bg-[#12151D]">
            <div>
              <label htmlFor="playerName" className="block text-[9px] font-black uppercase tracking-wider text-white/60 mb-1">
                PLAYER NAME
              </label>
              <input
                id="playerName"
                type="text"
                placeholder="Player name"
                value={formData.playerName}
                onChange={handleTextChange}
                data-align="center"
                className={`w-full bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] ${isPdf ? "text-center" : ""}`}
              />
            </div>

            <div>
              <label htmlFor="playerAge" className="block text-[9px] font-black uppercase tracking-wider text-white/60 mb-1">
                AGE
              </label>
              <input
                id="playerAge"
                type="number"
                placeholder="Age"
                value={formData.playerAge}
                onChange={handleTextChange}
                data-align="center"
                className={`w-full bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] ${isPdf ? "text-center" : ""}`}
              />
            </div>
          </div>

          {/* WHAT DID YOU DO WELL? Tag Chips */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 px-1">
              WHAT DID YOU DO WELL?
            </h3>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl border border-white/10 bg-[#12151D]">
              {WELL_DONE_TAGS.map((tag) => {
                const isSelected = formData.wellDoneTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                      isSelected
                        ? "bg-[#FF4422] text-white border border-[#FF4422] shadow-md shadow-[#FF4422]/25 scale-[1.02]"
                        : "bg-black/30 text-white/60 border border-white/10 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Textareas */}
          <div className="space-y-3 pt-1">
            <div>
              <label htmlFor="achievedGoal" className="block text-[9px] font-black uppercase tracking-wider text-white/70 mb-1 px-1">
                DID YOU ACHIEVE YOUR GOAL?
              </label>
              <textarea
                id="achievedGoal"
                rows={2}
                placeholder="Describe your match goal and outcome..."
                value={formData.achievedGoal}
                onChange={handleTextChange}
                className="w-full bg-[#12151D] text-white px-3.5 py-2.5 text-xs font-medium rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] resize-none"
              />
            </div>

            <div>
              <label htmlFor="whatLearned" className="block text-[9px] font-black uppercase tracking-wider text-white/70 mb-1 px-1">
                WHAT DID YOU LEARN?
              </label>
              <textarea
                id="whatLearned"
                rows={2}
                placeholder="Your key takeaway from today..."
                value={formData.whatLearned}
                onChange={handleTextChange}
                className="w-full bg-[#12151D] text-white px-3.5 py-2.5 text-xs font-medium rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] resize-none"
              />
            </div>

            <div>
              <label htmlFor="whatWouldChange" className="block text-[9px] font-black uppercase tracking-wider text-white/70 mb-1 px-1">
                WHAT WOULD YOU CHANGE?
              </label>
              <textarea
                id="whatWouldChange"
                rows={2}
                placeholder="Be honest with yourself..."
                value={formData.whatWouldChange}
                onChange={handleTextChange}
                className="w-full bg-[#12151D] text-white px-3.5 py-2.5 text-xs font-medium rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] resize-none"
              />
            </div>
          </div>
        </>
      )}

      {/* Performance Sliders */}
      {(!isPdf || !pdfPart || pdfPart === 2 || pdfPart === 3) && (
        <div className="space-y-2 pt-2">
          {(!isPdf || !pdfPart || pdfPart === 2) && (
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 px-1">
              GAME PERFORMANCE RATING (1–10)
            </h3>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl border border-white/10 bg-[#12151D]">
            {metricsToRender.map((metric) => {
              const value = Number(formData.detailedPerformance[metric] || 7);
              const percent = ((value - 1) / 9) * 100;

              return (
                <div key={metric} className="p-2 rounded-xl bg-black/25 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                    <span className="text-white/80 leading-none">{metric}</span>
                    <span className="text-[#FF4422] font-black leading-none">{value}/10</span>
                  </div>
                  {isPdf ? (
                    <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                      <div
                        className="h-full bg-[#FF4422] rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  ) : (
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={value}
                      onChange={(e) => handleMetricChange(metric, e.target.value)}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/20 accent-[#FF4422]"
                      style={{
                        background: `linear-gradient(to right, #FF4422 0%, #FF4422 ${percent}%, rgba(255,255,255,0.15) ${percent}%, rgba(255,255,255,0.15) 100%)`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* ── Action Buttons Bar ── */}
      {!isPdf && (
        <SectionActionBar
          onReset={() => {
            if (confirm("Reset Reflection data?")) {
              localStorage.removeItem("playerReflection");
              window.location.reload();
            }
          }}
          sectionKey="reflection"
        />
      )}

    </div>
  );
}

// Map route paths to human-readable page names
const ROUTE_PAGE_NAMES = {
  "/register": "Register",
  "/stats": "Player Stats",
  "/touch-counter": "Touch Counter",
  "/reflection": "Player Reflection",
  "/evaluation": "Player Evaluation",
  "/roster": "Roster",
  "/lineup": "Starting Lineup",
  "/note-to-coach": "Note to Coach",
};

export function BottomBar() {
  const { session } = useActiveSession();
  const navigate = useNavigate();
  const location = useLocation();

  const isRightFoot = (session?.activeFooter || "RIGHT").toUpperCase() === "RIGHT";

  const topRow = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard", isHome: true },
    { id: "counter", label: "Counter", icon: Pointer, path: "/touch-counter" },
    { id: "stats", label: "Stats", icon: BarChart3, path: "/stats" },
    { id: "agent", label: "Agent", icon: Bot, path: "/ai-agent" },
    { id: "register", label: "Register", icon: User, path: "/register" },
    { id: "passport", label: "Passport", icon: Contact2, path: "/passport" },
  ];

  const bottomRow = [
    { id: "match-prep", label: "Match Prep", icon: Calendar, path: "/match-prep" },
    { id: "challenge", label: "30-Day", icon: Flame, path: "/challenge" },
    { id: "roster", label: "Roster", icon: Award, path: "/roster" },
    { id: "lineup", label: "Line Up", icon: Users, path: "/lineup" },
    { id: "evaluation", label: "Evaluation", icon: Star, path: "/evaluation" },
    { id: "reflection", label: "Reflection", icon: MessageSquare, path: "/reflection" },
    { id: "note-to-coach", label: "Coach Note", icon: StickyNote, path: "/note-to-coach" },
  ];

  return (
    <div
      id="bottom-bar-container"
      className="fixed bottom-0 left-0 right-0 pt-2 pb-1.5 px-2 bg-[#0C0E14] border-t border-white/10 z-[100] shadow-2xl select-none"
    >
      <div className="max-w-md mx-auto space-y-2">
        {/* Top Row: 6 Icon & Label Buttons */}
        <div className="grid grid-cols-6 gap-1 text-center">
          {topRow.map((item) => {
            const Icon = item.icon;
            const isActive = item.isHome
              ? location.pathname === "/dashboard" || location.pathname === "/"
              : location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center py-0.5 group active:scale-95 transition-transform"
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-[#FF4422]" : "text-white/50 group-hover:text-white/90"
                  }`}
                />
                <span
                  className={`text-[8.5px] font-bold tracking-tight mt-0.5 transition-colors duration-200 ${
                    isActive ? "text-[#FF4422] font-black" : "text-white/50 group-hover:text-white/80"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Second Row: 7 Icon & Label Buttons (Identical Layout & Styling as First Row!) */}
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {bottomRow.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center py-0.5 group active:scale-95 transition-transform"
              >
                <Icon
                  size={16}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-[#FF4422]" : "text-white/50 group-hover:text-white/90"
                  }`}
                />
                <span
                  className={`text-[7.5px] font-bold uppercase tracking-tight leading-tight mt-0.5 text-center transition-colors duration-200 ${
                    isActive ? "text-[#FF4422] font-black" : "text-white/50 group-hover:text-white/80"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Branding Row */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[8px] font-black uppercase tracking-[0.25em] text-white/50 border-t border-white/5">
          <img
            src={isRightFoot ? "/right_foot.png" : "/left_foot.png"}
            alt="Icon"
            className="w-3.5 h-3.5 object-contain brightness-0 invert"
          />
          <span>FOOTBALLER ATHLETICS</span>
        </div>
      </div>
    </div>
  );
}
