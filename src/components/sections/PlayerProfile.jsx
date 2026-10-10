import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/Card";
import { useActiveSession } from "../../hooks/useActiveSession";
import { useAuth } from "../../contexts/AuthContext";
import { registerPlayer } from "../../services/api";
import touchesLogo from "../../assets/touches.png";
import {
  ChevronDown,
  ChevronUp,
  Check,
  ArrowUp,
  ArrowRight,
} from "lucide-react";

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

const COUNTRIES = [
  "Select country",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Spain",
  "Germany",
  "France",
  "Brazil",
  "Argentina",
  "Italy",
  "Portugal",
  "Netherlands",
  "Mexico",
  "Japan",
  "South Korea",
  "Nigeria",
  "Ghana",
  "Colombia",
  "Chile",
  "Other",
];

const GAME_TYPES = ["GRASSROOTS", "4V4", "7V7", "9V9", "11V11"];

export function PlayerProfile() {
  const navigate = useNavigate();
  const { session, updateSession } = useActiveSession();
  const { completeRegistration } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const [formData, setFormData] = useState(() => {
    const defaultState = {
      level: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      position: "",
      activeFooter: "",
      totalYearsPlaying: "",
      totalHoursTrained: "",
      totalSessions: "",
      gameNumber: "",
      totalGames: "",
      totalGoals: "",
      totalPenalties: "",
      yourPosition: "",
      rightFooter: "",
      leftFooter: "",

      fullName: "",
      dateOfBirth: "",
      age: "",
      placeOfBirth: "",
      address: "",
      zipCode: "",
      city: "",
      country: "",

      email: "",
      cellPhone: "",
      website: "",
      instagram: "",
      tiktok: "",
      facebook: "",

      parentName: "",
      parentEmail: "",
      parentConsentChecked: false,

      favoriteTeam: "",
      favoritePlayer: "",

      gameTypes: [],

      middleSchool: "",
      middleSchoolGrade: "",
      highSchool: "",
      highSchoolGrade: "",
      college: "",
      collegeYear: "",
      university: "",
      universityYear: "",

      academy: "",
      academyLevel: "",
      pro: "",
      proLeague: "",
      club: "",
      team: "",
    };

    if (typeof window !== "undefined") {
      const saved =
        localStorage.getItem("playerProfile") ||
        localStorage.getItem("playerProfile_draft");
      if (saved) {
        try {
          return { ...defaultState, ...JSON.parse(saved) };
        } catch (e) {
          console.error("Error parsing localStorage data:", e);
        }
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem("playerProfile_draft", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (session.id && session) {
      const newData = { ...formData };
      let hasChanges = false;

      Object.keys(newData).forEach((key) => {
        if (session[key] !== undefined && session[key] !== formData[key]) {
          newData[key] = session[key];
          hasChanges = true;
        }
      });

      if (
        session.playerName &&
        (!session.fullName || session.fullName === "")
      ) {
        if (newData.fullName !== session.playerName) {
          newData.fullName = session.playerName;
          hasChanges = true;
        }
      }

      const hasDbData = Object.keys(newData).some(
        (key) => session[key] !== undefined && session[key] !== "",
      );

      if (
        hasDbData &&
        hasChanges &&
        JSON.stringify(formData) !== JSON.stringify(newData)
      ) {
        setFormData(newData);
      }
    }
  }, [session]);

  const handleChange = async (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    const updates = { [id]: value };
    if (id === "fullName") {
      updates.playerName = value;
    }
    await updateSession(updates);
  };

  const handleFootSelect = async (foot) => {
    const footUpper = foot.toUpperCase();
    const isLeft = footUpper === "LEFT";
    const newLeft = isLeft ? "LEFT" : "";
    const newRight = !isLeft ? "RIGHT" : "";

    const updates = {
      activeFooter: footUpper,
      leftFooter: newLeft,
      rightFooter: newRight,
    };

    setFormData((prev) => ({ ...prev, ...updates }));
    await updateSession(updates);
  };

  const handleGameTypeToggle = async (type) => {
    setFormData((prev) => {
      const current = prev.gameTypes || [];
      const newGameTypes = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];

      updateSession({ gameTypes: newGameTypes });
      return { ...prev, gameTypes: newGameTypes };
    });
  };

  const isUnder13 = formData.age !== "" && parseInt(formData.age, 10) < 13;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.activeFooter) {
      const element = document.getElementById("foot-selection-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    const name = (formData.fullName || formData.playerName || "").trim();
    if (!name) {
      alert("Please enter your name before continuing.");
      return;
    }

    if (formData.email && formData.email.trim() && !formData.email.includes("@")) {
      alert("Please enter a valid email address or leave it blank.");
      return;
    }

    if (isUnder13) {
      if (
        !formData.parentName?.trim() ||
        !formData.parentEmail?.trim() ||
        !formData.parentConsentChecked
      ) {
        alert(
          "Parent or legal guardian consent is required for players under 13. Please complete the Parent / Guardian Consent section."
        );
        const elem = document.getElementById("parent-consent-section");
        if (elem) elem.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    const cleanedData = {
      ...formData,
      ...(isUnder13 ? { cellPhone: "", instagram: "", tiktok: "", facebook: "" } : {}),
      parentConsent: isUnder13
        ? {
            parentName: formData.parentName.trim(),
            parentEmail: formData.parentEmail.trim(),
            consentedAt: new Date().toISOString(),
            verified: true,
          }
        : null,
    };

    setIsSubmitting(true);
    try {
      // 1. Submit to the live backend API
      const result = await registerPlayer(cleanedData);

      const token = result?.token;
      const backendData = result?.data || result?.player;

      // 2. Persist local registration state & AuthContext
      completeRegistration(cleanedData, token, backendData);

      if (session?.id) {
        await updateSession(cleanedData);
      }

      localStorage.removeItem("playerProfile_draft");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration submission error:", error);
      const serverMessage =
        error?.data?.message ||
        error?.message ||
        "Registration could not be completed. Please check your connection.";
      setErrorMessage(serverMessage);
      alert(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLeftSelected = formData.activeFooter === "LEFT";
  const isRightSelected = formData.activeFooter === "RIGHT";

  const labelClass =
    "block text-[9px] font-black uppercase tracking-wider text-football-text/80 mb-1";
  const inputClass =
    "w-full bg-[#161920]/90 text-football-text px-3 py-2 text-xs font-semibold rounded-xl border border-football-text/15 focus:outline-none focus:border-football-accent transition-all placeholder:text-football-text/30";
  const selectClass =
    "w-full bg-[#161920]/90 text-football-text px-3 py-2 text-xs font-semibold rounded-xl border border-football-text/15 focus:outline-none focus:border-football-accent transition-all appearance-none cursor-pointer";

  return (
    <div className="bg-[var(--bg-primary)] text-football-text pb-6 pt-1 px-1 sm:px-2 relative overflow-hidden">
      <div className="max-w-md mx-auto space-y-3 relative z-10">
        {/* ════════════════════════════════
            TOP BRANDING & LOGOS
        ════════════════════════════════ */}
        <div className="text-center space-y-1.5 pt-2 flex flex-col items-center justify-center">
          {/* Top Stick Figure Icon */}
          <div className="w-14 h-14 mx-auto flex items-center justify-center">
            <img
              src="/right_foot.png"
              alt="Footballer Athletics Icon"
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
            FOOTBALLER ATHLETICS
          </p>

          {/* TOUCHES Logo */}
          <div className="py-1 flex items-center justify-center">
            <img
              src="/touches_logo.png"
              alt="TOUCHES LOGO"
              className="h-14 w-auto object-contain brightness-0 invert"
            />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
            TRACK • REFLECT • IMPROVE
          </p>
        </div>

        {/* ════════════════════════════════
            MAIN CARD & DOMINANT FOOT SECTION
        ════════════════════════════════ */}
        <div
          id="foot-selection-section"
          className="relative bg-[var(--bg-card)]/80 rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-xl space-y-3.5 overflow-hidden"
        >
          {/* Background Pitch Lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center"></div>

          {/* Pitch Icon & Question Heading */}
          <div className="text-center relative z-10">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
              ARE YOU A <span className="text-[#FF4422]">LEFT</span> OR{" "}
              <span className="text-[#00AEEF]">RIGHT</span> FOOTER?
            </h1>

            <p className="text-[11px] text-white/70 max-w-xs mx-auto leading-tight font-medium">
              Every elite player knows their dominant foot. This is where your
              journey begins.
            </p>
          </div>

          {/* ── Left vs Right Foot Cards Grid ── */}
          <div className="grid grid-cols-2 gap-2.5 relative z-10">
            {/* LEFT FOOTER CARD */}
            <button
              type="button"
              onClick={() => handleFootSelect("LEFT")}
              className={`group relative p-3 rounded-xl border-2 text-left transition-all duration-200 flex flex-col items-center text-center space-y-2 ${
                isLeftSelected
                  ? "border-[#FF4422] bg-[#FF4422]/15 shadow-md shadow-[#FF4422]/20 scale-[1.01]"
                  : "border-[#FF4422]/40 bg-[#161920]/80 hover:border-[#FF4422] hover:bg-[#FF4422]/10"
              }`}
            >
              {isLeftSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FF4422] text-white flex items-center justify-center shadow z-20">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}

              {/* Left Foot Icon (White) */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center">
                <img
                  src="/left_foot.png"
                  alt="Left Footer Icon"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FF4422]">
                  LEFT FOOTER
                </h3>
                <p className="text-[9px] text-football-text/80 leading-tight mt-0.5 font-medium">
                  The creative side. Legends born here.
                </p>
              </div>
            </button>

            {/* RIGHT FOOTER CARD */}
            <button
              type="button"
              onClick={() => handleFootSelect("RIGHT")}
              className={`group relative p-3 rounded-xl border-2 text-left transition-all duration-200 flex flex-col items-center text-center space-y-2 ${
                isRightSelected
                  ? "border-[#00AEEF] bg-[#00AEEF]/15 shadow-md shadow-[#00AEEF]/20 scale-[1.01]"
                  : "border-[#00AEEF]/40 bg-[#161920]/80 hover:border-[#00AEEF] hover:bg-[#00AEEF]/10"
              }`}
            >
              {isRightSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#00AEEF] text-white flex items-center justify-center shadow z-20">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}

              {/* Right Foot Icon (White) */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center">
                <img
                  src="/right_foot.png"
                  alt="Right Footer Icon"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#00AEEF]">
                  RIGHT FOOTER
                </h3>
                <p className="text-[9px] text-football-text/80 leading-tight mt-0.5 font-medium">
                  Power & precision. Own the pitch.
                </p>
              </div>
            </button>
          </div>

          {/* ════════════════════════════════
              PLAYER REGISTRATION FORM (Compact Spacing)
          ════════════════════════════════ */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3 pt-1 relative z-10"
          >
            {/* Section Divider */}
            <div className="flex items-center gap-2 my-2">
              <div className="h-px bg-football-text/15 flex-1" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-football-text/60">
                PLAYER REGISTRATION
              </span>
              <div className="h-px bg-football-text/15 flex-1" />
            </div>

            {/* Row 1: First Name & Age */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  FIRST NAME
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Your first name"
                  className={inputClass}
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="age" className={labelClass}>
                  AGE
                </label>
                <input
                  id="age"
                  type="number"
                  placeholder="Age"
                  className={inputClass}
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 2: Club/Team & Position */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="club" className={labelClass}>
                  CLUB / TEAM
                </label>
                <input
                  id="club"
                  type="text"
                  placeholder="Club name"
                  className={inputClass}
                  value={formData.club}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="position" className={labelClass}>
                  POSITION
                </label>
                <div className="relative">
                  <select
                    id="position"
                    className={selectClass}
                    value={formData.position}
                    onChange={handleChange}
                  >
                    {POSITIONS.map((pos) => (
                      <option
                        key={pos}
                        value={pos === "Select Position" ? "" : pos}
                        className="bg-[#161920] text-white"
                      >
                        {pos}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-football-text/50">
                    <ChevronDown size={13} />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Country Dropdown */}
            <div>
              <label htmlFor="country" className={labelClass}>
                COUNTRY
              </label>
              <div className="relative">
                <select
                  id="country"
                  className={selectClass}
                  value={formData.country}
                  onChange={handleChange}
                >
                  {COUNTRIES.map((cty) => (
                    <option
                      key={cty}
                      value={cty === "Select country" ? "" : cty}
                      className="bg-[#161920] text-white"
                    >
                      {cty}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-football-text/50">
                  <ChevronDown size={13} />
                </div>
              </div>
            </div>

            {/* Parent/Guardian Consent Step (Required for Under 13) */}
            {isUnder13 && (
              <div
                id="parent-consent-section"
                className="p-3.5 rounded-xl bg-[#1C1824] border-2 border-amber-500/40 space-y-3"
              >
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
                    Parent / Legal Guardian Consent Required
                  </h4>
                  <p className="text-[9.5px] text-white/70 leading-relaxed">
                    Players under 13 require parental or legal guardian consent before registering. Please have your parent or guardian complete this section.
                  </p>
                </div>

                <div className="space-y-2">
                  <div>
                    <label htmlFor="parentName" className={labelClass}>
                      PARENT / GUARDIAN FULL NAME *
                    </label>
                    <input
                      id="parentName"
                      type="text"
                      placeholder="Parent / Guardian Name"
                      className={inputClass}
                      value={formData.parentName || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="parentEmail" className={labelClass}>
                      PARENT / GUARDIAN EMAIL ADDRESS *
                    </label>
                    <input
                      id="parentEmail"
                      type="email"
                      placeholder="parent.guardian@email.com"
                      className={inputClass}
                      value={formData.parentEmail || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <label className="flex items-start gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      id="parentConsentChecked"
                      checked={!!formData.parentConsentChecked}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          parentConsentChecked: e.target.checked,
                        }))
                      }
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black/40 text-football-accent focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[9px] text-white/80 font-medium leading-tight">
                      I am the parent or legal guardian of this player. I authorize my child to create a TOUCHES player profile and track football training statistics.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Submit / Action Button */}
            <div className="pt-1">
              {errorMessage && (
                <div className="p-3 mb-2 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-medium">
                  {errorMessage}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                  isSubmitting
                    ? "opacity-60 cursor-not-allowed bg-gray-700 text-white"
                    : !formData.activeFooter
                    ? "bg-[#3D1A15] border border-[#FF4422]/40 text-[#FF6B35] hover:bg-[#4D201A] cursor-pointer"
                    : formData.activeFooter === "LEFT"
                      ? "bg-[#FF4422] text-white hover:bg-[#FF6B35] shadow-[#FF4422]/30 cursor-pointer scale-[1.01]"
                      : "bg-[#00AEEF] text-white hover:bg-[#38BDF8] shadow-[#00AEEF]/30 cursor-pointer scale-[1.01]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>REGISTERING PLAYER...</span>
                  </>
                ) : !formData.activeFooter ? (
                  <>
                    <span>CHOOSE YOUR FOOT FIRST</span>
                    <ArrowUp size={15} className="animate-bounce" />
                  </>
                ) : (
                  <>
                    <span>CONTINUE TO TOUCH COUNTER</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ════════════════════════════════
              OPTIONAL ADDITIONAL DETAILS
          ════════════════════════════════ */}
          <div className="border-t border-football-text/10 pt-3 relative z-10">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-black/20 hover:bg-black/40 text-[9px] font-black uppercase tracking-widest text-football-text/70 transition-colors"
            >
              <span>Additional Profile Information (Optional)</span>
              {showOptionalFields ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
            </button>

            {showOptionalFields && (
              <div className="mt-3 space-y-2.5 pt-1 text-xs">
                {/* Contact & Socials (Minimizing for Under 13) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className={isUnder13 ? "col-span-2" : ""}>
                    <label htmlFor="email" className={labelClass}>
                      {isUnder13 ? "PARENT CONTACT EMAIL" : "EMAIL"}
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Email address"
                      className={inputClass}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {!isUnder13 && (
                    <div>
                      <label htmlFor="cellPhone" className={labelClass}>
                        PHONE
                      </label>
                      <input
                        id="cellPhone"
                        type="tel"
                        placeholder="Phone number"
                        className={inputClass}
                        value={formData.cellPhone}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>

                {!isUnder13 && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="instagram" className={labelClass}>
                        INSTAGRAM
                      </label>
                      <input
                        id="instagram"
                        type="text"
                        placeholder="@handle"
                        className={inputClass}
                        value={formData.instagram}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="tiktok" className={labelClass}>
                        TIKTOK
                      </label>
                      <input
                        id="tiktok"
                        type="text"
                        placeholder="@handle"
                        className={inputClass}
                        value={formData.tiktok}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                {/* Favorites & Game Types */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="favoriteTeam" className={labelClass}>
                      FAVORITE TEAM
                    </label>
                    <input
                      id="favoriteTeam"
                      type="text"
                      placeholder="e.g. Real Madrid"
                      className={inputClass}
                      value={formData.favoriteTeam}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="favoritePlayer" className={labelClass}>
                      FAVORITE PLAYER
                    </label>
                    <input
                      id="favoritePlayer"
                      type="text"
                      placeholder="e.g. Messi / CR7"
                      className={inputClass}
                      value={formData.favoritePlayer}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Game Types */}
                <div>
                  <label className={labelClass}>PREFERRED GAME FORMAT</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {GAME_TYPES.map((type) => {
                      const isSelected = (formData.gameTypes || []).includes(
                        type,
                      );
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleGameTypeToggle(type)}
                          className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border transition-all ${
                            isSelected
                              ? "bg-football-accent text-white border-football-accent"
                              : "bg-[#161920] text-football-text/70 border-football-text/15 hover:border-football-text/30"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
