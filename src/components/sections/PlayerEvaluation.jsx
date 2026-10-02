import React, { useState, useEffect } from "react";
import { useActiveSession } from "../../hooks/useActiveSession";
import { SectionActionBar } from "../ui/SectionActionBar";
import { Star, ShieldCheck, UserCheck, Calendar, Trophy, ChevronRight } from "lucide-react";

const EVALUATION_CATEGORIES = {
  TECHNIQUE: [
    "Ability to play with both feet",
    "Passing",
    "Controlling and releasing",
    "Feinting and dribbling",
    "Shooting / finishing",
    "Heading",
    "Tackling",
    "Playing without the ball",
  ],
  "PHYSICAL ATTRIBUTES": [
    "Strength (explosiveness)",
    "Speed",
    "Endurance",
    "Suppleness (mobility)",
    "Core muscles",
  ],
  "TACTICAL AWARENESS": [
    "Reading the game",
    "Attacking one-on-one",
    "Defending one-on-one",
    "Technique under pressure",
  ],
  "CO-ORDINATION": [
    "Orientation",
    "Endurance",
    "Rhythm",
    "Differentiation",
    "Reaction",
    "Balance",
  ],
  "MENTAL STRENGTHS": [
    "Concentration",
    "Willpower / will to win",
    "Perseverance",
    "Confidence",
    "Willingness to take risks",
    "Creativity",
    "Aggression",
  ],
  "SOCIAL SKILLS": [
    "Communication",
    "Behaviour / positive attitude",
    "Charisma / personality",
    "Conscientiousness",
    "Team player",
  ],
  "PHYSICAL STATE": ["General state of health"],
};

const RATING_OPTIONS = [
  { value: 1, label: "Very Good", color: "bg-emerald-500 text-white border-emerald-400" },
  { value: 2, label: "Good", color: "bg-[#00AEEF] text-white border-[#00AEEF]" },
  { value: 3, label: "Average", color: "bg-[#F59E0B] text-white border-[#F59E0B]" },
  { value: 4, label: "Poor", color: "bg-[#EF4444] text-white border-[#EF4444]" },
];

export function PlayerEvaluation({ isPdf, pdfPart }) {
  const { reflection, updateReflection } = useActiveSession();

  const [evaluatedBy, setEvaluatedBy] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("playerEvaluationBy") || "";
    return "";
  });

  const [playerName, setPlayerName] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("playerEvaluationName") || "";
    return "";
  });

  const [playerAge, setPlayerAge] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("playerEvaluationAge") || "";
    return "";
  });

  const [evaluationDate, setEvaluationDate] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("playerEvaluationDate") || "";
    return "";
  });

  const [ratings, setRatings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("playerEvaluation");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {};
  });

  useEffect(() => {
    if (reflection) {
      if (reflection.detailedEvaluation) setRatings(reflection.detailedEvaluation);
      if (reflection.evaluatedBy) setEvaluatedBy(reflection.evaluatedBy);
      if (reflection.playerEvaluationName) setPlayerName(reflection.playerEvaluationName);
      if (reflection.playerEvaluationAge) setPlayerAge(reflection.playerEvaluationAge);
      if (reflection.playerEvaluationDate) setEvaluationDate(reflection.playerEvaluationDate);
    }
  }, [reflection]);

  useEffect(() => { localStorage.setItem("playerEvaluation", JSON.stringify(ratings)); }, [ratings]);
  useEffect(() => { localStorage.setItem("playerEvaluationBy", evaluatedBy); }, [evaluatedBy]);
  useEffect(() => { localStorage.setItem("playerEvaluationName", playerName); }, [playerName]);
  useEffect(() => { localStorage.setItem("playerEvaluationAge", playerAge); }, [playerAge]);
  useEffect(() => { localStorage.setItem("playerEvaluationDate", evaluationDate); }, [evaluationDate]);

  const handleRatingChange = async (category, skill, rating) => {
    const newRatings = {
      ...ratings,
      [category]: { ...(ratings[category] || {}), [skill]: rating },
    };
    setRatings(newRatings);
    await updateReflection({ detailedEvaluation: newRatings });
  };

  const handleEvaluatedByChange = async (e) => {
    setEvaluatedBy(e.target.value);
    await updateReflection({ evaluatedBy: e.target.value });
  };

  const handleNameChange = async (e) => {
    setPlayerName(e.target.value);
    await updateReflection({ playerEvaluationName: e.target.value });
  };

  const handleAgeChange = async (e) => {
    setPlayerAge(e.target.value);
    await updateReflection({ playerEvaluationAge: e.target.value });
  };

  let categoriesToRender = Object.entries(EVALUATION_CATEGORIES);
  if (isPdf) {
    if (pdfPart === 1) categoriesToRender = categoriesToRender.slice(0, 1);
    else if (pdfPart === 2) categoriesToRender = categoriesToRender.slice(1, 3);
    else if (pdfPart === 3) categoriesToRender = categoriesToRender.slice(3, 4);
    else if (pdfPart === 4) categoriesToRender = categoriesToRender.slice(4, 5);
    else if (pdfPart === 5) categoriesToRender = categoriesToRender.slice(5, 7);
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
                PLAYER EVALUATION
              </h1>
              <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-0.5">
                COACH & PARENT PERFORMANCE EVALUATION
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between py-1">
              <h2 className="text-xl font-black uppercase text-white tracking-wider">
                PLAYER EVALUATION
              </h2>
              <span className="text-[10px] font-bold text-white/50 tracking-wider">
                COACH & PARENT GRADE
              </span>
            </div>
          )}

          {/* Player & Evaluator Info Inputs */}
          <div className="p-3.5 rounded-2xl border border-white/10 bg-[#12151D] space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-white/60 mb-1">
                  PLAYER NAME
                </label>
                <input
                  type="text"
                  placeholder="Player Name"
                  value={playerName}
                  onChange={handleNameChange}
                  data-align="center"
                  className={`w-full bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] ${isPdf ? "text-center" : ""}`}
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-white/60 mb-1">
                  AGE
                </label>
                <input
                  type="number"
                  placeholder="Age"
                  value={playerAge}
                  onChange={handleAgeChange}
                  data-align="center"
                  className={`w-full bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] ${isPdf ? "text-center" : ""}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-white/60 mb-1">
                EVALUATION BY
              </label>
              <input
                type="text"
                placeholder="Coach / Parent Name"
                value={evaluatedBy}
                onChange={handleEvaluatedByChange}
                data-align="center"
                className={`w-full bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] ${isPdf ? "text-center" : ""}`}
              />
            </div>
          </div>

          {/* Rating Scale Legend */}
          <div
            data-legend-bar="true"
            className="p-2.5 rounded-xl border border-white/10 bg-black/30 flex items-center justify-around"
            style={{
              lineHeight: "1",
              paddingTop: isPdf ? "6px" : undefined,
              paddingBottom: isPdf ? "6px" : undefined,
            }}
          >
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase" style={{ lineHeight: "1" }}>
              <span data-legend-dot="true" className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" style={{ transform: isPdf ? "translateY(1.5px)" : "none", display: "inline-block" }} />
              <span data-legend-text="true" className="text-emerald-400" style={{ transform: isPdf ? "translateY(-4px)" : "none", display: "inline-block", lineHeight: "1" }}>1 = Very Good</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase" style={{ lineHeight: "1" }}>
              <span data-legend-dot="true" className="w-2 h-2 rounded-full bg-[#00AEEF] shrink-0" style={{ transform: isPdf ? "translateY(1.5px)" : "none", display: "inline-block" }} />
              <span data-legend-text="true" className="text-[#00AEEF]" style={{ transform: isPdf ? "translateY(-4px)" : "none", display: "inline-block", lineHeight: "1" }}>2 = Good</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase" style={{ lineHeight: "1" }}>
              <span data-legend-dot="true" className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" style={{ transform: isPdf ? "translateY(1.5px)" : "none", display: "inline-block" }} />
              <span data-legend-text="true" className="text-[#F59E0B]" style={{ transform: isPdf ? "translateY(-4px)" : "none", display: "inline-block", lineHeight: "1" }}>3 = Average</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase" style={{ lineHeight: "1" }}>
              <span data-legend-dot="true" className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" style={{ transform: isPdf ? "translateY(1.5px)" : "none", display: "inline-block" }} />
              <span data-legend-text="true" className="text-[#EF4444]" style={{ transform: isPdf ? "translateY(-4px)" : "none", display: "inline-block", lineHeight: "1" }}>4 = Poor</span>
            </div>
          </div>
        </>
      )}

      {/* Evaluation Skill Categories */}
      <div className="space-y-4 pt-1">
        {categoriesToRender.map(([category, skills]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70 px-1 border-l-2 border-[#FF4422] pl-2">
              {category}
            </h3>

            <div className="space-y-1.5 p-3 rounded-2xl border border-white/10 bg-[#12151D]">
              {skills.map((skill) => {
                const currentRating = ratings[category]?.[skill] || 1;

                return (
                  <div
                    key={skill}
                    className="p-2 rounded-xl bg-black/25 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span
                      className="text-[10px] font-bold text-white/90 uppercase tracking-wider"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        transform: isPdf ? "translateY(-1.5px)" : "none",
                      }}
                    >
                      {skill}
                    </span>

                    {/* Rating Pill Buttons */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {RATING_OPTIONS.map((opt) => {
                        const isSelected = currentRating === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            data-eval-btn="true"
                            onClick={() => handleRatingChange(category, skill, opt.value)}
                            className={`py-1 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all duration-150 flex items-center justify-center leading-none ${
                              isSelected
                                ? `${opt.color} shadow-md scale-[1.05]`
                                : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                            style={{
                              minWidth: "26px",
                              height: "22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: "1",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                transform: isPdf ? "translateY(-2.5px)" : "none",
                                lineHeight: "1",
                              }}
                            >
                              {opt.value}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Action Buttons Bar ── */}
      {!isPdf && (
        <SectionActionBar
          onReset={() => {
            if (confirm("Reset Evaluation data?")) {
              setRatings({});
              localStorage.removeItem("playerEvaluation");
            }
          }}
          onSave={() => updateReflection({ detailedEvaluation: ratings })}
          sectionKey="evaluation"
        />
      )}

    </div>
  );
}
