import React, { useState, useEffect } from "react";
import { useActiveSession } from "../../hooks/useActiveSession";
import { SectionActionBar } from "../ui/SectionActionBar";
import { MessageSquare, Calendar, Star, Sparkles } from "lucide-react";

const TEACH_ME_TAGS = [
  "Pass", "Shoot", "Dribble", "Tackle", "Head", "Defend",
  "Attack", "Scan", "Improve", "Learn", "Play", "Recover",
];

const GRADE_ITEMS = [
  { key: "coach", label: "Coach" },
  { key: "assistantCoach", label: "Asst. Coach" },
  { key: "trainer", label: "Trainer" },
];

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function NoteToCoach({ isPdf, pdfPart }) {
  const { updateReflection, reflection } = useActiveSession();
  const [hydrated, setHydrated] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noteToCoach");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing noteToCoach localStorage:", e);
        }
      }
    }
    return {
      name: "",
      date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      club: "",
      team: "",
      whatILiked: "",
      whatIWouldChange: "",
      wouldLikeToDoMore: "",
      teachMeTags: [],
      grades: { coach: 10, assistantCoach: 10, trainer: 10 },
    };
  });

  useEffect(() => {
    if (!hydrated && reflection?.noteToCoach) {
      setFormData(reflection.noteToCoach);
      setHydrated(true);
    }
  }, [reflection, hydrated]);

  useEffect(() => {
    localStorage.setItem("noteToCoach", JSON.stringify(formData));
  }, [formData]);

  const debouncedData = useDebounce(formData, 800);
  useEffect(() => {
    if (debouncedData) {
      updateReflection({ noteToCoach: debouncedData });
    }
  }, [debouncedData, updateReflection]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const tags = prev.teachMeTags.includes(tag)
        ? prev.teachMeTags.filter((t) => t !== tag)
        : [...prev.teachMeTags, tag];
      return { ...prev, teachMeTags: tags };
    });
  };

  const handleGradeChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      grades: { ...prev.grades, [key]: Number(value) },
    }));
  };

  const handleReset = () => {
    if (confirm("Reset Note to Coach feedback?")) {
      setFormData((prev) => ({
        ...prev,
        whatILiked: "",
        whatIWouldChange: "",
        wouldLikeToDoMore: "",
        teachMeTags: [],
        grades: { coach: 10, assistantCoach: 10, trainer: 10 },
      }));
    }
  };

  return (
    <div className="space-y-3 pb-1 select-none">
      {/* ── Title Bar ── */}
      {isPdf ? (
        <div className="text-center pb-3 mb-2 border-b border-white/15">
          <div className="text-[10px] font-black tracking-[0.25em] text-[#FF4422] uppercase">
            FOOTBALLER ATHLETICS • TOUCHES
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white mt-1">
            NOTE TO COACH
          </h1>
          <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-0.5">
            DIRECT COACHING FEEDBACK & REQUESTS
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between py-1">
          <h2 className="text-xl font-black uppercase text-white tracking-wider">
            NOTE TO COACH
          </h2>
          <span className="text-[10px] font-bold text-white/50 tracking-wider">
            FEEDBACK & REQUESTS
          </span>
        </div>
      )}

      {/* ── Date Badge Header ── */}
      <div className="p-3 rounded-2xl border border-white/10 bg-[#12151D] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              DIRECT COACHING FEEDBACK
            </h3>
            <p className="text-[9px] text-white/50 font-medium">
              Recorded live for post-match analysis
            </p>
          </div>
        </div>
        <div
          className="text-[9px] font-bold text-white/60 bg-black/40 px-2.5 py-1 rounded-full border border-white/10 flex items-center justify-center leading-none"
          style={{
            paddingTop: isPdf ? "0px" : undefined,
            paddingBottom: isPdf ? "0px" : undefined,
            lineHeight: "1",
          }}
        >
          <span style={{ display: "inline-block", transform: isPdf ? "translateY(-2px)" : "none", lineHeight: "1" }}>
            {formData.date || "Today"}
          </span>
        </div>
      </div>

      {/* ── Feedback Textareas ── */}
      <div className="space-y-3">
        <div>
          <label className="block text-[9px] font-black uppercase tracking-wider text-white/70 mb-1 px-1">
            WHAT I LIKED ABOUT THE SESSION / GAME
          </label>
          <textarea
            rows={2.5}
            placeholder="Share what went well..."
            value={formData.whatILiked}
            onChange={(e) => handleChange("whatILiked", e.target.value)}
            className="w-full bg-[#12151D] text-white px-3.5 py-2.5 text-xs font-medium rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] resize-none"
          />
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase tracking-wider text-white/70 mb-1 px-1">
            WHAT I WOULD CHANGE
          </label>
          <textarea
            rows={2.5}
            placeholder="Honest feedback..."
            value={formData.whatIWouldChange}
            onChange={(e) => handleChange("whatIWouldChange", e.target.value)}
            className="w-full bg-[#12151D] text-white px-3.5 py-2.5 text-xs font-medium rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] resize-none"
          />
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase tracking-wider text-white/70 mb-1 px-1">
            I WOULD LIKE TO DO MORE
          </label>
          <textarea
            rows={2.5}
            placeholder="More drills, games, scrimmage..."
            value={formData.wouldLikeToDoMore}
            onChange={(e) => handleChange("wouldLikeToDoMore", e.target.value)}
            className="w-full bg-[#12151D] text-white px-3.5 py-2.5 text-xs font-medium rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] resize-none"
          />
        </div>
      </div>

      {/* ── TEACH ME HOW TO Tag Chips ── */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 px-1">
          TEACH ME HOW TO:
        </h3>
        <div className="flex flex-wrap gap-1.5 p-3.5 rounded-2xl border border-white/10 bg-[#12151D]">
          {TEACH_ME_TAGS.map((tag) => {
            const isSelected = formData.teachMeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                data-tag-chip="true"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? "bg-[#10B981] text-white border border-[#10B981] shadow-md shadow-[#10B981]/25 scale-[1.02]"
                    : "bg-black/30 text-white/60 border border-white/10 hover:border-white/20 hover:text-white"
                }`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: "1",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    transform: isPdf ? "translateY(-2px)" : "none",
                    lineHeight: "1",
                  }}
                >
                  {tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRADE YOUR COACHING STAFF Sliders ── */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 px-1">
          GRADE YOUR COACHING STAFF (1–10)
        </h3>

        <div className="space-y-2 p-3.5 rounded-2xl border border-white/10 bg-[#12151D]">
          {GRADE_ITEMS.map((item) => {
            const val = formData.grades[item.key] ?? 10;
            const percent = ((val - 1) / 9) * 100;

            return (
              <div key={item.key} className="p-2.5 rounded-xl bg-black/25 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                  <span className="text-white leading-none" style={{ transform: isPdf ? "translateY(-1.5px)" : "none", display: "inline-block" }}>{item.label}</span>
                  <span className="text-[#FF4422] text-sm font-black leading-none" style={{ transform: isPdf ? "translateY(-1.5px)" : "none", display: "inline-block" }}>{val}</span>
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
                    value={val}
                    onChange={(e) => handleGradeChange(item.key, e.target.value)}
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

      {/* ── Action Buttons Bar ── */}
      {!isPdf && (
        <SectionActionBar
          onReset={handleReset}
          onSave={() => updateReflection({ noteToCoach: formData })}
          sectionKey="note-to-coach"
        />
      )}
    </div>
  );
}
