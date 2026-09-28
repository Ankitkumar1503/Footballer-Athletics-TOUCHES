import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RotateCcw, Share2, FileText, Save, Check, X, Layers, FileCode } from "lucide-react";

const SECTION_LABELS = {
  dashboard: "Dashboard",
  stats: "Player Stats",
  "touch-counter": "Touch Counter",
  reflection: "Player Reflection",
  evaluation: "Player Evaluation",
  roster: "Roster",
  lineup: "Starting Lineup",
  "note-to-coach": "Note to Coach",
  policy: "Usage Policy",
};

export function SectionActionBar({ onReset, onSave, sectionKey }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [savedToast, setSavedToast] = useState(false);
  const [activeModalAction, setActiveModalAction] = useState(null); // 'pdf' | 'share' | null

  const key = sectionKey || location.pathname.replace("/", "") || "dashboard";
  const sectionLabel = SECTION_LABELS[key] || "Current Section";

  const handleSaveClick = () => {
    if (onSave) onSave();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleOpenPdfChoice = () => {
    setActiveModalAction("pdf");
  };

  const handleOpenShareChoice = () => {
    setActiveModalAction("share");
  };

  const handleExecuteOption = (scope) => {
    const targetSection = scope === "current" ? key : "all";

    if (activeModalAction === "pdf") {
      navigate(`/pdf-report?section=${targetSection}`);
    } else if (activeModalAction === "share") {
      if (navigator.share && scope === "current") {
        navigator
          .share({
            title: `TOUCHES - ${sectionLabel}`,
            text: `Check out my ${sectionLabel} report on TOUCHES!`,
            url: window.location.href,
          })
          .catch((e) => console.log("Share canceled", e));
      } else {
        navigate(`/pdf-report?section=${targetSection}&action=share`);
      }
    }
    setActiveModalAction(null);
  };

  return (
    <div data-action-bar="true" className="pt-2 pb-1 border-t border-white/10 space-y-1.5 relative">
      {savedToast && (
        <div className="px-3 py-1 rounded-lg bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider text-center animate-bounce shadow-md flex items-center justify-center gap-1">
          <Check size={12} />
          <span>Session Saved!</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-1.5">
        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="py-1.5 px-2 rounded-lg bg-[#141720] border border-white/15 text-white/80 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95"
        >
          <RotateCcw size={12} />
          <span>RESET</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleOpenShareChoice}
          className="py-1.5 px-2 rounded-lg bg-[#141720] border border-white/15 text-white/80 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95"
        >
          <Share2 size={12} />
          <span>SHARE</span>
        </button>

        {/* PDF */}
        <button
          type="button"
          onClick={handleOpenPdfChoice}
          className="py-1.5 px-2 rounded-lg bg-[#141720] border border-white/15 text-white/80 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95"
        >
          <FileText size={12} />
          <span>PDF</span>
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={handleSaveClick}
          className="py-1.5 px-2 rounded-lg bg-[#FF4422] text-white shadow-md shadow-[#FF4422]/20 hover:bg-[#E03311] transition-all font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95"
        >
          <Save size={12} />
          <span>SAVE</span>
        </button>
      </div>

      {/* ── Export / Share Scope Selection Modal ── */}
      {activeModalAction && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveModalAction(null)}
        >
          <div
            className="bg-gradient-to-b from-[#1A1E2E] to-[#121522] border-2 border-white/20 rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                {activeModalAction === "pdf" ? (
                  <div className="w-8 h-8 rounded-lg bg-[#FF4422]/20 text-[#FF4422] flex items-center justify-center border border-[#FF4422]/40">
                    <FileText size={18} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#00AEEF]/20 text-[#00AEEF] flex items-center justify-center border border-[#00AEEF]/40">
                    <Share2 size={18} />
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    {activeModalAction === "pdf" ? "Export PDF Report" : "Share Session Data"}
                  </h3>
                  <p className="text-[9px] text-white/60 uppercase font-bold">
                    Choose Export Scope
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalAction(null)}
                className="text-white/40 hover:text-white p-1 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-white/80 font-medium">
              What would you like to {activeModalAction === "pdf" ? "export as PDF" : "share"}?
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleExecuteOption("current")}
                className="w-full py-3 px-4 rounded-xl bg-[#00AEEF] hover:bg-[#0098D4] text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-between transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <FileCode size={16} />
                  <span>Current Section Only</span>
                </div>
                <span className="text-[9px] bg-black/20 px-2 py-0.5 rounded font-bold">
                  {sectionLabel}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteOption("all")}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF4422] to-[#FF6600] hover:from-[#FF5533] hover:to-[#FF7711] text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-between transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Layers size={16} />
                  <span>All Sections</span>
                </div>
                <span className="text-[9px] bg-black/20 px-2 py-0.5 rounded font-bold">
                  Full Report
                </span>
              </button>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setActiveModalAction(null)}
                className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

