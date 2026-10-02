import React, { useState, useEffect } from "react";
import { useActiveSession } from "../../hooks/useActiveSession";
import { SectionActionBar } from "../ui/SectionActionBar";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const FORMATIONS_DATA = {
  "4-3-3": {
    name: "4-3-3",
    pitchPositions: [
      { number: 9, label: "ST", top: 25, left: 50 },
      { number: 11, label: "LW", top: 32, left: 24 },
      { number: 7, label: "RW", top: 32, left: 76 },
      { number: 10, label: "CM", top: 52, left: 30 },
      { number: 6, label: "DM", top: 54, left: 50 },
      { number: 8, label: "CM", top: 52, left: 70 },
      { number: 3, label: "LB", top: 72, left: 21 },
      { number: 5, label: "CB", top: 74, left: 41 },
      { number: 4, label: "CB", top: 74, left: 59 },
      { number: 2, label: "RB", top: 72, left: 79 },
      { number: 1, label: "GK", top: 86, left: 50 },
    ],
    tacticalGroups: [
      {
        id: "attack",
        title: "⚽ ATTACK",
        positions: [
          { number: 11, label: "L WING" },
          { number: 9, label: "STRIKER" },
          { number: 7, label: "R WING" },
        ],
      },
      {
        id: "midfield",
        title: "🎯 MIDFIELD",
        positions: [
          { number: 10, label: "L MID" },
          { number: 6, label: "CENTRE" },
          { number: 8, label: "R MID" },
        ],
      },
      {
        id: "defence",
        title: "🛡️ DEFENCE",
        positions: [
          { number: 3, label: "L BACK" },
          { number: 5, label: "CB" },
          { number: 4, label: "CB" },
          { number: 2, label: "R BACK" },
        ],
      },
      {
        id: "goalkeeper",
        title: "🧤 GOALKEEPER",
        positions: [
          { number: 1, label: "GOALKEEPER", isGk: true },
        ],
      },
    ],
  },
  "4-4-2": {
    name: "4-4-2",
    pitchPositions: [
      { number: 11, label: "ST", top: 25, left: 40 },
      { number: 9, label: "ST", top: 25, left: 60 },
      { number: 10, label: "LM", top: 50, left: 20 },
      { number: 6, label: "CM", top: 52, left: 40 },
      { number: 8, label: "CM", top: 52, left: 60 },
      { number: 7, label: "RM", top: 50, left: 80 },
      { number: 3, label: "LB", top: 72, left: 21 },
      { number: 5, label: "CB", top: 74, left: 41 },
      { number: 4, label: "CB", top: 74, left: 59 },
      { number: 2, label: "RB", top: 72, left: 79 },
      { number: 1, label: "GK", top: 86, left: 50 },
    ],
    tacticalGroups: [
      {
        id: "attack",
        title: "⚽ ATTACK",
        positions: [
          { number: 11, label: "STRIKER" },
          { number: 9, label: "STRIKER" },
        ],
      },
      {
        id: "midfield",
        title: "🎯 MIDFIELD",
        positions: [
          { number: 10, label: "L MID" },
          { number: 6, label: "CM" },
          { number: 8, label: "CM" },
          { number: 7, label: "R MID" },
        ],
      },
      {
        id: "defence",
        title: "🛡️ DEFENCE",
        positions: [
          { number: 3, label: "L BACK" },
          { number: 5, label: "CB" },
          { number: 4, label: "CB" },
          { number: 2, label: "R BACK" },
        ],
      },
      {
        id: "goalkeeper",
        title: "🧤 GOALKEEPER",
        positions: [
          { number: 1, label: "GOALKEEPER", isGk: true },
        ],
      },
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    pitchPositions: [
      { number: 9, label: "ST", top: 24, left: 50 },
      { number: 11, label: "LAM", top: 38, left: 25 },
      { number: 10, label: "CAM", top: 40, left: 50 },
      { number: 7, label: "RAM", top: 38, left: 75 },
      { number: 6, label: "DM", top: 57, left: 38 },
      { number: 8, label: "DM", top: 57, left: 62 },
      { number: 3, label: "LB", top: 72, left: 21 },
      { number: 5, label: "CB", top: 74, left: 41 },
      { number: 4, label: "CB", top: 74, left: 59 },
      { number: 2, label: "RB", top: 72, left: 79 },
      { number: 1, label: "GK", top: 86, left: 50 },
    ],
    tacticalGroups: [
      {
        id: "attack",
        title: "⚽ ATTACK",
        positions: [
          { number: 9, label: "STRIKER" },
        ],
      },
      {
        id: "attacking-mid",
        title: "🎯 ATTACKING MID",
        positions: [
          { number: 11, label: "LAM" },
          { number: 10, label: "CAM" },
          { number: 7, label: "RAM" },
        ],
      },
      {
        id: "defensive-mid",
        title: "⚡ DEFENSIVE MID",
        positions: [
          { number: 6, label: "CDM" },
          { number: 8, label: "CDM" },
        ],
      },
      {
        id: "defence",
        title: "🛡️ DEFENCE",
        positions: [
          { number: 3, label: "L BACK" },
          { number: 5, label: "CB" },
          { number: 4, label: "CB" },
          { number: 2, label: "R BACK" },
        ],
      },
      {
        id: "goalkeeper",
        title: "🧤 GOALKEEPER",
        positions: [
          { number: 1, label: "GOALKEEPER", isGk: true },
        ],
      },
    ],
  },
  "3-5-2": {
    name: "3-5-2",
    pitchPositions: [
      { number: 11, label: "ST", top: 25, left: 40 },
      { number: 9, label: "ST", top: 25, left: 60 },
      { number: 3, label: "LWB", top: 48, left: 17 },
      { number: 10, label: "CM", top: 45, left: 36 },
      { number: 6, label: "DM", top: 57, left: 50 },
      { number: 8, label: "CM", top: 45, left: 64 },
      { number: 2, label: "RWB", top: 48, left: 83 },
      { number: 5, label: "CB", top: 73, left: 30 },
      { number: 4, label: "CB", top: 75, left: 50 },
      { number: 7, label: "CB", top: 73, left: 70 },
      { number: 1, label: "GK", top: 86, left: 50 },
    ],
    tacticalGroups: [
      {
        id: "attack",
        title: "⚽ ATTACK",
        positions: [
          { number: 11, label: "STRIKER" },
          { number: 9, label: "STRIKER" },
        ],
      },
      {
        id: "midfield",
        title: "🎯 MIDFIELD",
        positions: [
          { number: 3, label: "LWB" },
          { number: 10, label: "CM" },
          { number: 6, label: "CDM" },
          { number: 8, label: "CM" },
          { number: 2, label: "RWB" },
        ],
      },
      {
        id: "defence",
        title: "🛡️ DEFENCE",
        positions: [
          { number: 5, label: "CB" },
          { number: 4, label: "CB" },
          { number: 7, label: "CB" },
        ],
      },
      {
        id: "goalkeeper",
        title: "🧤 GOALKEEPER",
        positions: [
          { number: 1, label: "GOALKEEPER", isGk: true },
        ],
      },
    ],
  },
};

export function FootballFormation({ isPdf = false }) {
  const { reflection, updateReflection } = useActiveSession();
  const [hydrated, setHydrated] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("footballFormation");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            formation: parsed.formation || "4-3-3",
            teamName: parsed.teamName || "",
            ageGroup: parsed.ageGroup || "U16",
            date: parsed.date || new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
            opponent: parsed.opponent || "",
            players: parsed.players || {
              1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: "", 11: ""
            },
          };
        } catch (e) {
          console.error("Error parsing localStorage data:", e);
        }
      }
    }
    return {
      formation: "4-3-3",
      teamName: "",
      ageGroup: "U16",
      date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      opponent: "",
      players: {
        1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: "", 11: ""
      },
    };
  });

  useEffect(() => {
    if (!hydrated && reflection?.formation) {
      setFormData({
        formation: reflection.formation.formation || "4-3-3",
        teamName: reflection.formation.teamName ?? "",
        ageGroup: reflection.formation.ageGroup ?? "U16",
        date: reflection.formation.date ?? "",
        opponent: reflection.formation.opponent ?? "",
        players: reflection.formation.players ?? {
          1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: "", 11: ""
        },
      });
      setHydrated(true);
    }
  }, [reflection, hydrated]);

  const debouncedData = useDebounce(formData, 800);

  useEffect(() => {
    localStorage.setItem("footballFormation", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (debouncedData) {
      updateReflection({ formation: debouncedData });
    }
  }, [debouncedData, updateReflection]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlayerSlotChange = (posNumber, lineIndex, value) => {
    const rawVal = formData.players[posNumber] || "";
    const slots = rawVal.split(",");
    while (slots.length < 3) slots.push("");
    slots[lineIndex] = value;

    setFormData((prev) => ({
      ...prev,
      players: { ...prev.players, [posNumber]: slots.join(",") },
    }));
  };

  const selectedFormationKey = FORMATIONS_DATA[formData.formation] ? formData.formation : "4-3-3";
  const activeFormation = FORMATIONS_DATA[selectedFormationKey];

  return (
    <div className="space-y-4 pb-4 select-none">
      {/* ── 1. Starting Lineup Header ── */}
      {isPdf ? (
        <div className="text-center pb-3 mb-2 border-b border-white/15">
          <div className="text-[10px] font-black tracking-[0.25em] text-[#FF4422] uppercase">
            FOOTBALLER ATHLETICS • TOUCHES
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white mt-1">
            STARTING LINEUP
          </h1>
          <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-0.5">
            MATCHDAY TACTICAL SHEET
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between py-1">
          <h2 className="text-xl font-black uppercase text-white tracking-wider">
            STARTING LINEUP
          </h2>
          <span className="text-[10px] font-bold text-white/50 tracking-wider">
            TACTICAL SHEET
          </span>
        </div>
      )}

      {/* ── 2. Match & Team Info Inputs ── */}
      <div className="p-3.5 rounded-2xl border border-white/10 bg-[#12151D] space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider text-white/60 mb-1">
              TEAM
            </label>
            <input
              type="text"
              placeholder="Club Name"
              value={formData.teamName}
              onChange={(e) => handleInputChange("teamName", e.target.value)}
              data-align="center"
              className={`w-full bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] ${isPdf ? "text-center" : ""}`}
            />
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider text-white/60 mb-1">
              AGE GROUP
            </label>
            <input
              type="text"
              placeholder="U16"
              value={formData.ageGroup}
              onChange={(e) => handleInputChange("ageGroup", e.target.value)}
              data-align="center"
              className={`w-full bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] ${isPdf ? "text-center" : ""}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider text-white/60 mb-1">
              DATE
            </label>
            <input
              type="text"
              placeholder="Date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              data-align="center"
              className={`w-full bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] ${isPdf ? "text-center" : ""}`}
            />
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider text-white/60 mb-1">
              OPPONENT
            </label>
            <input
              type="text"
              placeholder="Opponent"
              value={formData.opponent}
              onChange={(e) => handleInputChange("opponent", e.target.value)}
              data-align="center"
              className={`w-full bg-black/40 text-white px-3 py-2 text-xs font-semibold rounded-xl border border-white/15 focus:outline-none focus:border-[#FF4422] ${isPdf ? "text-center" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* ── 3 & 4. Interactive Pitch Card with Top Formation Tabs (EXACT MATCH TO CLIENT REFERENCE) ── */}
      <div className="p-3 sm:p-4 rounded-2xl border border-white/10 bg-[#0E1118] shadow-2xl">
        {/* Top Formation Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-3.5">
          {Object.keys(FORMATIONS_DATA).map((fmtKey) => {
            const isSelected = selectedFormationKey === fmtKey;
            return (
              <button
                key={fmtKey}
                type="button"
                onClick={() => handleInputChange("formation", fmtKey)}
                className={`py-2 px-1 text-xs sm:text-sm font-black rounded-xl transition-all ${
                  isSelected
                    ? "bg-[#FF4422] text-white shadow-md shadow-[#FF4422]/40"
                    : "bg-[#181C26] text-white/60 hover:text-white"
                }`}
              >
                {fmtKey}
              </button>
            );
          })}
        </div>

        {/* Green Football Pitch Graphic */}
        <div className="relative w-full aspect-[1.18/1] rounded-2xl overflow-hidden shadow-inner bg-[#1A7740] border-2 border-emerald-500/40">
          {/* Pitch Lines SVG */}
          <svg viewBox="0 0 300 250" className="w-full h-full pointer-events-none" fill="none">
            {/* Outer boundary */}
            <rect
              x="14"
              y="12"
              width="272"
              height="226"
              rx="8"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />

            {/* Halfway line */}
            <line
              x1="14"
              y1="125"
              x2="286"
              y2="125"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />

            {/* Center circle */}
            <circle
              cx="150"
              cy="125"
              r="34"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />

            {/* Top penalty area */}
            <rect
              x="72"
              y="12"
              width="156"
              height="50"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />

            {/* Bottom penalty area */}
            <rect
              x="72"
              y="188"
              width="156"
              height="50"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
            />
          </svg>

          {/* 11 Circular Red-Orange Player Markers */}
          <div className="absolute inset-0 pointer-events-none">
            {activeFormation.pitchPositions.map((pos) => (
              <div
                key={`${selectedFormationKey}-${pos.number}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex items-center justify-center"
                style={{
                  top: `${pos.top}%`,
                  left: `${pos.left}%`,
                }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF4422] border-[1.5px] border-white/80 shadow-md flex items-center justify-center">
                  <span className="text-[9px] sm:text-[10px] font-black text-white tracking-tight uppercase">
                    {pos.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Tactical Sheet Section (SEPARATE BELOW THE PITCH) ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-[#12151D] space-y-4 shadow-xl">
        {/* Tactical Groups: ATTACK, MIDFIELD, DEFENCE, GOALKEEPER */}
        {activeFormation.tacticalGroups.map((group) => {
          const count = group.positions.length;
          let gridClass = "grid gap-2";
          if (count === 1) gridClass += " grid-cols-1 max-w-xs mx-auto";
          else if (count === 2) gridClass += " grid-cols-2";
          else if (count === 3) gridClass += " grid-cols-3";
          else if (count === 4) gridClass += " grid-cols-2 sm:grid-cols-4 gap-1.5";
          else if (count === 5) gridClass += " grid-cols-2 sm:grid-cols-5 gap-1.5";

          const isGkGroup = group.id === "goalkeeper";

          return (
            <div key={group.id} className="space-y-2">
              <div className="text-center">
                <span
                  data-tactical-title="true"
                  className={`inline-flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full border border-white/10 ${
                    isGkGroup ? "text-amber-300" : "text-emerald-300"
                  }`}
                  style={{
                    lineHeight: "1",
                    paddingTop: isPdf ? "0px" : undefined,
                    paddingBottom: isPdf ? "0px" : undefined,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transform: isPdf ? "translateY(-5.5px)" : "none",
                      lineHeight: "1",
                    }}
                  >
                    {group.title}
                  </span>
                </span>
              </div>

              <div className={gridClass}>
                {group.positions.map((pos) => (
                  <PositionCard
                    key={`${selectedFormationKey}-${pos.number}`}
                    pos={pos}
                    value={formData.players[pos.number]}
                    onSlotChange={(idx, val) => handlePlayerSlotChange(pos.number, idx, val)}
                    isCompact={count >= 4}
                    isGk={pos.isGk}
                    isPdf={isPdf}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Action Buttons Bar ── */}
      {!isPdf && (
        <SectionActionBar
          onReset={() => {
            if (confirm("Reset Starting Lineup player names?")) {
              const emptyPlayers = { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: "", 11: "" };
              setFormData((prev) => ({ ...prev, players: emptyPlayers }));
              localStorage.setItem("footballFormation", JSON.stringify({ ...formData, players: emptyPlayers }));
              updateReflection({ formation: { ...formData, players: emptyPlayers } });
            }
          }}
          onSave={() => updateReflection({ formation: formData })}
          sectionKey="lineup"
        />
      )}
    </div>
  );
}

function PositionCard({ pos, value, onSlotChange, isCompact = false, isGk = false, isPdf = false }) {
  const slots = (value || ",,").split(",");
  const starter = slots[0] || "";
  const sub1 = slots[1] || "";
  const sub2 = slots[2] || "";

  const badgeSize = isCompact ? 18 : 20;
  const radius = isCompact ? 8 : 9;
  const center = badgeSize / 2;

  return (
    <div className={`rounded-xl bg-black/60 backdrop-blur-md border border-white/20 flex flex-col items-center space-y-1.5 ${
      isCompact ? "p-1.5" : "p-2"
    } ${isGk ? "border-amber-400/50" : ""}`}>
      {/* Position Header & Number Badge */}
      <div
        data-position-header="true"
        className="flex items-center justify-center gap-1.5 w-full py-1"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          lineHeight: "1",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={badgeSize}
          height={badgeSize}
          viewBox={`0 0 ${badgeSize} ${badgeSize}`}
          className="shrink-0"
          style={{
            width: `${badgeSize}px`,
            height: `${badgeSize}px`,
            minWidth: `${badgeSize}px`,
            minHeight: `${badgeSize}px`,
            display: "inline-block",
            verticalAlign: "middle",
            transform: isPdf ? "translateY(1px)" : "none",
          }}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill={isGk ? "#f59e0b" : "#000000"}
            stroke={isGk ? "#ffffff" : "rgba(255,255,255,0.7)"}
            strokeWidth="1.5"
          />
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isGk ? "#000000" : "#ffffff"}
            fontSize={pos.number >= 10 ? (isCompact ? "8" : "9") : (isCompact ? "9.5" : "10.5")}
            fontWeight="900"
            fontFamily="Inter, system-ui, -apple-system, sans-serif"
          >
            {pos.number}
          </text>
        </svg>

        <span
          data-position-label="true"
          className={`${
            isCompact ? "text-[8.5px] sm:text-[9px]" : "text-[10px] sm:text-[11px]"
          } font-black uppercase tracking-wider text-white whitespace-nowrap`}
          style={{
            overflow: "visible",
            display: "inline-flex",
            alignItems: "center",
            verticalAlign: "middle",
            lineHeight: "1",
            transform: isPdf ? "translateY(-4.5px)" : "none",
          }}
        >
          {pos.label}
        </span>
      </div>

      {/* 3 Input Slots */}
      <div className="w-full space-y-1">
        <input
          type="text"
          placeholder="Starter"
          value={starter}
          onChange={(e) => onSlotChange(0, e.target.value)}
          data-align="center"
          className={`w-full ${isPdf ? "bg-[#161A24] text-white border-white/20" : "bg-white text-black border-black/35"} font-bold rounded text-center border focus:outline-none focus:ring-1 focus:ring-[#FF4422] ${
            isCompact ? "px-1 py-0.5 text-[8px] sm:text-[9px]" : "px-1.5 py-1 text-[9px]"
          }`}
        />

        <input
          type="text"
          placeholder="Sub 1"
          value={sub1}
          onChange={(e) => onSlotChange(1, e.target.value)}
          data-align="center"
          className={`w-full ${isPdf ? "bg-black/50 text-white/90 border-white/15" : "bg-[#EDEDED] text-black border-black/30"} font-bold rounded text-center border focus:outline-none focus:ring-1 focus:ring-[#FF4422] ${
            isCompact ? "px-1 py-0.5 text-[8px] sm:text-[9px]" : "px-1.5 py-1 text-[9px]"
          }`}
        />

        <input
          type="text"
          placeholder="Sub 2"
          value={sub2}
          onChange={(e) => onSlotChange(2, e.target.value)}
          data-align="center"
          className={`w-full ${isPdf ? "bg-black/50 text-white/90 border-white/15" : "bg-[#EDEDED] text-black border-black/30"} font-bold rounded text-center border focus:outline-none focus:ring-1 focus:ring-[#FF4422] ${
            isCompact ? "px-1 py-0.5 text-[8px] sm:text-[9px]" : "px-1.5 py-1 text-[9px]"
          }`}
        />
      </div>
    </div>
  );
}
