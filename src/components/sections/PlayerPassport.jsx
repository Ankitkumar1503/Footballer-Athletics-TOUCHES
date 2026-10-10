import React, { useState, useEffect } from "react";
import { useActiveSession } from "../../hooks/useActiveSession";
import { useCumulativeStats } from "../../hooks/useCumulativeStats";
import { SectionActionBar } from "../ui/SectionActionBar";
import { User, ShieldCheck } from "lucide-react";

export function PlayerPassport() {
  const { session, updateSession } = useActiveSession();
  const cumulativeStats = useCumulativeStats();

  const [formData, setFormData] = useState(() => {
    let saved = {};
    if (typeof window !== "undefined") {
      try {
        saved = JSON.parse(localStorage.getItem("playerProfile") || "{}");
      } catch (e) {}
    }
    return {
      fullName: saved.fullName || session?.playerName || "",
      club: saved.club || session?.club || "",
      position: saved.position || session?.position || "",
      team: saved.team || session?.team || "",
      activeFooter: saved.activeFooter || session?.activeFooter || "RIGHT",
      dateOfBirth: saved.dateOfBirth || "",
      placeOfBirth: saved.placeOfBirth || "",
      country: saved.country || "",
      favoriteTeam: saved.favoriteTeam || "",
      favoritePlayer: saved.favoritePlayer || "",
      instagram: saved.instagram || "",
      level: saved.level || saved.academyLevel || "",
      division: saved.division || saved.proLeague || "",
    };
  });

  useEffect(() => {
    localStorage.setItem("playerProfile", JSON.stringify(formData));
    if (session?.id) {
      updateSession({
        playerName: formData.fullName,
        club: formData.club,
        team: formData.team,
        position: formData.position,
        activeFooter: formData.activeFooter,
      });
    }
  }, [formData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const playerName = formData.fullName || "PLAYER";
  const playerClub = formData.club || "Club Unassigned";
  const playerPosition = formData.position || "Position";

  const activeFoot = (formData.activeFooter || "RIGHT").toUpperCase();
  const isRightFoot = activeFoot === "RIGHT";

  const lifetimeTouches = cumulativeStats.totalTouches || 0;
  const totalGoals = cumulativeStats.totalGoals || 0;
  const totalGames = cumulativeStats.totalGames || 0;

  let playerAge = null;
  try {
    const p = JSON.parse(localStorage.getItem("playerProfile") || "{}");
    playerAge = p.age || session?.age;
  } catch (e) {}
  const isUnder13 = playerAge && parseInt(playerAge, 10) < 13;

  const passportFields = [
    ...(!isUnder13 ? [{ id: "dateOfBirth", label: "DATE OF BIRTH", placeholder: "YYYY-MM-DD" }] : []),
    { id: "placeOfBirth", label: "PLACE OF BIRTH", placeholder: "City, Country" },
    { id: "country", label: "COUNTRY", placeholder: "Nation" },
    { id: "club", label: "CLUB", placeholder: "Current Club" },
    { id: "team", label: "TEAM", placeholder: "Current Team" },
    { id: "position", label: "POSITION", placeholder: "e.g. ST, CAM, CB" },
    { id: "favoriteTeam", label: "FAVOURITE TEAM", placeholder: "Favorite Football Team" },
    { id: "favoritePlayer", label: "FAVOURITE PLAYER", placeholder: "Favorite Footballer" },
    ...(!isUnder13 ? [{ id: "instagram", label: "INSTAGRAM", placeholder: "@username" }] : []),
    { id: "level", label: "LEVEL", placeholder: "Academy / Semi-Pro / Pro" },
    { id: "division", label: "DIVISION", placeholder: "U-18 / Tier 1" },
  ];

  return (
    <div className="space-y-3.5 pb-6 select-none">
      {/* ── Title Header ── */}
      <div className="flex items-center justify-between py-1">
        <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-wider">
          PLAYER PASSPORT
        </h2>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase">
          <ShieldCheck size={12} />
          <span>PLAYER ID</span>
        </div>
      </div>

      {/* ── PASSPORT CARD CONTAINER ── */}
      <div className="rounded-2xl overflow-hidden border border-white/15 bg-[#0F121A] shadow-xl space-y-0">
        {/* Compact Passport Card Header (Orange/Red Background) */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#E8470A] via-[#FF4422] to-[#FF5533] text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            {/* Avatar Circle */}
            <div className="w-11 h-11 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <User size={20} />
            </div>

            <div className="space-y-0.5">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/80">
                TOUCHES™ · FOOTBALLER ATHLETICS™
              </p>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-none">
                {playerName}
              </h1>
              <p className="text-[10px] font-semibold text-white/90">
                {playerClub} · {playerPosition}
              </p>

              <div className="pt-0.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/95">
                <span>👟</span>
                <span>{isRightFoot ? "RIGHT FOOTER" : "LEFT FOOTER"}</span>
              </div>
            </div>
          </div>

          {/* Compact White Stick Figure Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center relative z-10">
            <img
              src={isRightFoot ? "/right_foot.png" : "/left_foot.png"}
              alt="Stick Figure Icon"
              className="w-full h-full object-contain brightness-0 invert drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
            />
          </div>
        </div>

        {/* Passport Fillable Data Rows */}
        <div className="divide-y divide-white/10 px-3 py-1">
          {passportFields.map((field) => (
            <div
              key={field.id}
              className="py-2 flex items-center justify-between gap-3 text-xs"
            >
              <label
                htmlFor={field.id}
                className="font-black uppercase tracking-wider text-white/60 text-[9px] min-w-[110px] flex-shrink-0 cursor-pointer"
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type="text"
                value={formData[field.id] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full bg-black/40 text-white font-semibold text-xs text-right py-1 px-2 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#FF4422] focus:outline-none placeholder:text-white/20 transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Passport Footer Bar */}
        <div className="p-2.5 bg-black/50 border-t border-white/10 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
          <span>TOUCHES™ PLAYER PASSPORT</span>
          <span>FA-2026-P-001</span>
        </div>
      </div>

      {/* ── 3 BOTTOM STAT CARDS ── */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="p-2.5 rounded-xl border border-white/10 bg-[#12151D] text-center space-y-0.5">
          <div className="text-xl font-black text-[#FF4422]">{lifetimeTouches}</div>
          <div className="text-[8px] font-black uppercase tracking-widest text-white/50">
            LIFETIME TOUCHES
          </div>
        </div>

        <div className="p-2.5 rounded-xl border border-white/10 bg-[#12151D] text-center space-y-0.5">
          <div className="text-xl font-black text-[#10B981]">{totalGoals}</div>
          <div className="text-[8px] font-black uppercase tracking-widest text-white/50">
            GOALS
          </div>
        </div>

        <div className="p-2.5 rounded-xl border border-white/10 bg-[#12151D] text-center space-y-0.5">
          <div className="text-xl font-black text-[#00AEEF]">{totalGames}</div>
          <div className="text-[8px] font-black uppercase tracking-widest text-white/50">
            GAMES
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <SectionActionBar sectionKey="passport" />
    </div>
  );
}
