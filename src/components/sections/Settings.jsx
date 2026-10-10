import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  HardDrive,
  RotateCcw,
  Trash2,
  Trash,
  Shield,
  FileText,
  Copyright,
  Tag,
  AlertTriangle,
  Lock,
  Bell,
  Database,
  Info,
  Mail,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  UserX,
  Download,
  Upload,
} from "lucide-react";
import { db } from "../../lib/db";
import { deleteAccount } from "../../services/api";

// ── Shared label style matching PlayerProfile ──
const sectionHeaderClass =
  "text-[9px] font-black uppercase tracking-widest text-football-text/60 mb-2 mt-6 first:mt-0";

const itemTitleClass =
  "text-xs font-black uppercase tracking-wide text-football-text";
const itemDescClass =
  "text-[10px] text-football-text/70 mt-0.5 leading-relaxed";

// ── Reusable setting row ──
function SettingRow({
  icon: Icon,
  title,
  description,
  onClick,
  danger = false,
  rightEl,
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 py-3 px-0 text-left transition-opacity hover:opacity-70 active:opacity-50"
    >
      <div className="mt-0.5 flex-shrink-0">
        <Icon
          size={14}
          style={{
            color: danger ? "#dc2626" : "var(--text-primary)",
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${itemTitleClass} ${danger ? "text-red-600" : ""}`}>
          {title}
        </p>
        {description && <p className={itemDescClass}>{description}</p>}
      </div>
      {rightEl || (
        <ChevronRight
          size={12}
          style={{ color: "var(--text-primary)", marginTop: 2 }}
        />
      )}
    </button>
  );
}

// ── Divider ──
function Divider() {
  return <div className="border-t border-football-text/10" />;
}

// ── Confirm Modal ──
function ConfirmModal({ open, title, message, warning, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-6">
      <div className="w-full max-w-sm rounded-[24px] border border-football-subtle p-6 space-y-4 bg-football-card shadow-2xl">
        <div className="flex items-start justify-between">
          <p className="text-sm font-black uppercase tracking-widest text-football-text">
            {title}
          </p>
          <button onClick={onCancel}>
            <X size={16} style={{ color: "var(--text-primary)" }} />
          </button>
        </div>
        <p className={itemDescClass}>{message}</p>
        {warning && (
          <div className="border border-red-600 p-3">
            <p className="text-[10px] font-black uppercase text-red-600 leading-relaxed">
              ⚠ {warning}
            </p>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border border-football-subtle text-football-text rounded-xl hover:bg-football-text/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FAQ Item ──
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-football-text/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-3 gap-3 text-left"
      >
        <p className={itemTitleClass}>{question}</p>
        {open ? (
          <ChevronUp
            size={12}
            style={{
              color: "var(--text-primary)",
              flexShrink: 0,
              marginTop: 2,
            }}
          />
        ) : (
          <ChevronDown
            size={12}
            style={{
              color: "var(--text-primary)",
              flexShrink: 0,
              marginTop: 2,
            }}
          />
        )}
      </button>
      {open && <p className={`${itemDescClass} pb-3`}>{answer}</p>}
    </div>
  );
}

// ── Main Settings Page ──
export function Settings() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // { type: 'page' | 'all' }
  const [showFaq, setShowFaq] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  const handleResetPage = () => setModal("page");
  const handleResetAll = () => setModal("all");

  const confirmAction = async () => {
    if (modal === "page") {
      setModal(null);
    } else if (modal === "all") {
      try {
        await db.sessions.clear();
        await db.touches.clear();
        await db.reflections.clear();
        localStorage.removeItem("playerCareerStats");
        localStorage.removeItem("challengeState");
        localStorage.removeItem("noteToCoach");
        alert("All application data has been cleared.");
      } catch (e) {
        console.error("Error clearing app data:", e);
      }
      setModal(null);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    try {
      try {
        await deleteAccount();
      } catch (apiErr) {
        console.warn("Server account deletion warning (may be offline or already removed):", apiErr?.message);
      }

      await db.sessions.clear();
      await db.touches.clear();
      await db.reflections.clear();

      const keysToClear = [
        "playerProfile",
        "playerCareerStats",
        "authToken",
        "user",
        "isRegistered",
        "challengeState",
        "playerAttendance",
        "playerEvaluation",
        "formationSquad",
        "noteToCoach",
        "matchDayPrep",
        "aiAgentChat",
        "actionSettings",
        "touch_playerName",
        "touch_age",
        "touch_position",
        "touch_number",
        "trainingLocation",
        "gameLocation",
        "timeInTraining",
        "minutesPlayed",
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));

      setDeleteAccountModal(false);
      navigate("/register");
    } catch (e) {
      alert("Error deleting local account data: " + e.message);
    }
  };

  const handleExportBackup = async () => {
    try {
      const allSessions = await db.sessions.toArray();
      const allTouches = await db.touches.toArray();
      const allReflections = await db.reflections.toArray();

      const localData = {};
      const keys = [
        "playerProfile",
        "playerCareerStats",
        "challengeState",
        "playerAttendance",
        "playerEvaluation",
        "formationSquad",
        "noteToCoach",
        "matchDayPrep",
        "aiAgentChat",
        "actionSettings",
      ];
      keys.forEach((k) => {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            localData[k] = JSON.parse(item);
          } catch (e) {
            localData[k] = item;
          }
        }
      });

      const backupObj = {
        version: "1.0",
        app: "TOUCHES",
        exportedAt: new Date().toISOString(),
        db: {
          sessions: allSessions,
          touches: allTouches,
          reflections: allReflections,
        },
        localStorage: localData,
      };

      const blob = new Blob([JSON.stringify(backupObj, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `touches_player_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export data backup: " + (err.message || err));
    }
  };

  const handleRestoreBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (
          !json ||
          typeof json !== "object" ||
          json.app !== "TOUCHES" ||
          !json.db ||
          typeof json.db !== "object"
        ) {
          alert("Invalid or incompatible backup file. Please select a valid TOUCHES backup JSON file.");
          return;
        }

        const backupDate = json.exportedAt ? new Date(json.exportedAt).toLocaleDateString() : "unknown date";
        if (
          !confirm(
            `Restore player backup from ${backupDate}? Existing records will be safely merged and newer local records will be preserved.`
          )
        ) {
          return;
        }

        let restoredSessions = 0;
        let preservedSessions = 0;

        if (Array.isArray(json.db.sessions)) {
          for (const s of json.db.sessions) {
            if (!s) continue;
            const existing = s.id ? await db.sessions.get(s.id) : null;
            if (!existing) {
              await db.sessions.put(s);
              restoredSessions++;
            } else {
              const existingTime = new Date(existing.updatedAt || existing.date || 0).getTime();
              const backupTime = new Date(s.updatedAt || s.date || 0).getTime();
              if (backupTime > existingTime) {
                await db.sessions.put(s);
                restoredSessions++;
              } else {
                preservedSessions++;
              }
            }
          }
        }

        if (Array.isArray(json.db.touches)) {
          for (const t of json.db.touches) {
            if (!t) continue;
            const existing = t.id ? await db.touches.get(t.id) : null;
            if (!existing) {
              await db.touches.put(t);
            }
          }
        }

        if (Array.isArray(json.db.reflections)) {
          for (const r of json.db.reflections) {
            if (!r) continue;
            const existing = r.id ? await db.reflections.get(r.id) : null;
            if (!existing) {
              await db.reflections.put(r);
            } else {
              const existingTime = new Date(existing.updatedAt || existing.date || 0).getTime();
              const backupTime = new Date(r.updatedAt || r.date || 0).getTime();
              if (backupTime > existingTime) {
                await db.reflections.put(r);
              }
            }
          }
        }

        if (json.localStorage && typeof json.localStorage === "object") {
          Object.entries(json.localStorage).forEach(([k, v]) => {
            const existingRaw = localStorage.getItem(k);
            if (!existingRaw) {
              localStorage.setItem(
                k,
                typeof v === "object" ? JSON.stringify(v) : String(v)
              );
            } else {
              if (k === "challengeState") {
                try {
                  const existingState = JSON.parse(existingRaw);
                  const backupState = typeof v === "object" ? v : JSON.parse(v);
                  const existingDays = Array.isArray(existingState?.completedDays)
                    ? existingState.completedDays.length
                    : 0;
                  const backupDays = Array.isArray(backupState?.completedDays)
                    ? backupState.completedDays.length
                    : 0;
                  if (backupDays > existingDays) {
                    localStorage.setItem(k, JSON.stringify(backupState));
                  }
                } catch {}
              } else if (k === "playerCareerStats") {
                try {
                  const existingStats = JSON.parse(existingRaw);
                  const backupStats = typeof v === "object" ? v : JSON.parse(v);
                  const existingTotal =
                    existingStats?.totalTouches || existingStats?.total || 0;
                  const backupTotal =
                    backupStats?.totalTouches || backupStats?.total || 0;
                  if (backupTotal > existingTotal) {
                    localStorage.setItem(k, JSON.stringify(backupStats));
                  }
                } catch {}
              }
            }
          });
        }

        alert(
          `Backup restore complete! Restored: ${restoredSessions} sessions. Preserved: ${preservedSessions} newer local sessions.`
        );
        window.location.reload();
      } catch (err) {
        alert("Failed to restore backup: " + (err.message || err));
      }
    };
    reader.readAsText(file);
  };

  const faqs = [
    {
      q: "What is Touches™?",
      a: "Touches™ is a player development tool designed to track match interactions, technical actions, and self-reflection metrics.",
    },
    {
      q: "Does Touches™ track my location?",
      a: "No. The app does not use GPS or location services.",
    },
    {
      q: "Does the app record video or audio?",
      a: "No. Touches™ does not access the camera or microphone.",
    },
    {
      q: "Where is my data stored?",
      a: "All data is stored locally on your device.",
    },
    {
      q: "Is my data shared with third parties?",
      a: "No. Touches™ does not sell or distribute user data.",
    },
    {
      q: "Can I export my session results?",
      a: "Yes. Users may generate PDFs and save reports to their device.",
    },
    {
      q: "Can I delete my data?",
      a: "Yes. You may reset data directly within the app or submit a deletion request.",
    },
    {
      q: "Does Touches™ evaluate player ability?",
      a: "Touches™ provides structured tracking and reflection tools. It does not guarantee performance outcomes or selection decisions.",
    },
    {
      q: "Is Touches™ a scouting platform?",
      a: "No. The app is strictly an educational and tracking utility.",
    },
    {
      q: "Why are permissions not required?",
      a: "Touches™ is designed to function without accessing sensitive device features.",
    },
    {
      q: "What happens if I reset data accidentally?",
      a: "Reset actions are permanent. The app displays confirmation warnings before deletion.",
    },
    {
      q: "Is Touches™ suitable for young players?",
      a: "Yes. The app may be used under parental or coach supervision.",
    },
    {
      q: "Who operates Touches™?",
      a: "Touches™ is operated by Footballer Athletics™.",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto px-4 pb-20 pt-6">
        {/* ── Page Title ── */}
        <h1 className="text-2xl font-black uppercase tracking-widest text-football-text border-b-2 border-football-text pb-2 mb-2">
          Settings
        </h1>

        {/* ════════════════════════════════
            ACCOUNT
        ════════════════════════════════ */}
        <p className={sectionHeaderClass}>Account</p>
        <SettingRow
          icon={User}
          title="Profile"
          description="View and manage player-related information stored on this device."
          onClick={() => navigate("/register")}
        />
        <Divider />
        <SettingRow
          icon={UserX}
          title="Delete my account"
          description="Permanently delete your player profile, session history, and cached credentials."
          onClick={() => setDeleteAccountModal(true)}
          danger
        />
        <Divider />
        <SettingRow
          icon={LogOut}
          title="Sign Out"
          description="Exit the current user session."
          onClick={() => navigate("/register")}
          danger
        />

        {/* ════════════════════════════════
            DATA MANAGEMENT
        ════════════════════════════════ */}
        <p className={sectionHeaderClass}>Data Management</p>
        <SettingRow
          icon={Download}
          title="Export Data Backup"
          description="Download a complete JSON backup of your sessions, touches, challenge progress, and stats."
          onClick={handleExportBackup}
        />
        <Divider />
        <div className="relative">
          <SettingRow
            icon={Upload}
            title="Restore from Backup"
            description="Restore saved player sessions and records from a previously exported backup file."
            onClick={() => document.getElementById("backup-file-input")?.click()}
          />
          <input
            id="backup-file-input"
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleRestoreBackup}
          />
        </div>
        <Divider />
        <SettingRow
          icon={Trash}
          title="Reset All App Data"
          description="Permanently deletes all Touches™ data stored on this device, including stats, reflections, evaluations, grades, and counters."
          onClick={handleResetAll}
          danger
        />

        {/* ════════════════════════════════
            PRIVACY & LEGAL
        ════════════════════════════════ */}
        <p className={sectionHeaderClass}>Privacy & Legal</p>
        <SettingRow
          icon={Shield}
          title="Privacy Policy"
          description="View how Touches™ handles user-entered information and device data."
          onClick={() => window.open("https://fatouches.com/privacy", "_blank")}
        />
        {/* <Divider />
        <SettingRow
          icon={FileText}
          title="Terms & Conditions"
          description="Rules governing acceptable use of the application."
          onClick={() => navigate("/terms")}
        />
        <Divider />
        <SettingRow
          icon={Copyright}
          title="Copyright Notice"
          description="Ownership and intellectual property protection details."
          onClick={() => navigate("/copyright")}
        />
        <Divider /> */}
        {/* <SettingRow
          icon={Tag}
          title="Trademark Notice"
          description="Touches™ and Footballer Athletics™ brand protections."
          onClick={() => navigate("/trademark")}
        /> */}
        {/* <Divider />
        <SettingRow
          icon={AlertTriangle}
          title="Disclaimer"
          description="Limitations of functionality, liability, and usage scope."
          onClick={() => navigate("/disclaimer")}
        /> */}

        {/* ════════════════════════════════
            PERMISSIONS & ACCESS
        ════════════════════════════════ */}
        <p className={sectionHeaderClass}>Permissions & Access</p>
        <div className="p-4 border border-football-text/10 bg-football-card rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-football-text mb-2">
            Touches™ does NOT require or request access to:
          </p>
          {[
            "Location Services",
            "Camera",
            "Microphone",
            "Contacts",
            "Photos / Media",
            "Background Tracking",
          ].map((item) => (
            <p
              key={item}
              className="text-[10px] text-football-text/80 leading-relaxed"
            >
              · {item}
            </p>
          ))}
          <p className="text-[10px] font-black uppercase tracking-widest text-football-text mt-3">
            All data is manually entered by the user.
          </p>
        </div>

        {/* ════════════════════════════════
            NOTIFICATIONS
        ════════════════════════════════ */}
        <p className={sectionHeaderClass}>Notifications</p>
        <div className="p-4 border border-football-text/10 bg-football-card rounded-2xl">
          <p className="text-[10px] text-football-text/80 leading-relaxed">
            Touches™ does not send push notifications or background alerts.
          </p>
        </div>

        {/* ════════════════════════════════
            STORAGE & PERFORMANCE
        ════════════════════════════════ */}
        <p className={sectionHeaderClass}>Storage & Performance</p>
        <SettingRow
          icon={Database}
          title="Clear Temporary Cache"
          description="Removes temporary session values without deleting saved reports or PDFs."
          onClick={() => {}}
        />

        {/* ════════════════════════════════
            APP INFORMATION
        ════════════════════════════════ */}
        <p className={sectionHeaderClass}>App Information</p>
        <div className="p-4 border border-football-text/10 bg-football-card rounded-2xl">
          <p className="text-[10px] text-football-text/80">
            Touches™ Version 1.0 (Build 001)
          </p>
        </div>

        {/* ════════════════════════════════
            CONTACT & SUPPORT
        ════════════════════════════════ */}
        <p className={sectionHeaderClass}>Contact & Support</p>
        <SettingRow
          icon={Mail}
          title="Support / Privacy Requests"
          description="FootballerAthletics@gmail.com"
          onClick={() => window.open("mailto:FootballerAthletics@gmail.com")}
        />

        {/* ════════════════════════════════
            DATA & PRIVACY
        ════════════════════════════════ */}
        <p className={sectionHeaderClass}>Data & Privacy</p>
        <SettingRow
          icon={Lock}
          title="Data Control & Deletion"
          description="Submit a request to have your data reviewed or permanently deleted."
          onClick={() => {}}
        />

        {/* ════════════════════════════════
            FAQ SECTION
        ════════════════════════════════ */}
        <button
          onClick={() => setShowFaq(!showFaq)}
          className="w-full flex items-center justify-between mt-6 pb-2 border-b-2 border-football-text"
        >
          <div className="text-left">
            <p className="text-2xl font-black uppercase tracking-widest text-football-text">
              FAQ
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest text-football-text/60">
              — Touches™
            </p>
          </div>
          {showFaq ? (
            <ChevronUp size={18} style={{ color: "var(--text-primary)" }} />
          ) : (
            <ChevronDown size={18} style={{ color: "var(--text-primary)" }} />
          )}
        </button>

        {showFaq && (
          <div className="mt-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-football-text/60 mb-3">
              Frequently Asked Questions
            </p>
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        )}
      </div>

      {/* ── Confirm Modals ── */}
      <ConfirmModal
        open={modal === "page"}
        title="Reset Page Data"
        message="Are you sure you want to clear all values on this screen? This action cannot be undone."
        onConfirm={confirmAction}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal === "all"}
        title="Reset All App Data"
        message="This will permanently delete ALL Touches™ data stored on this device."
        warning="Deleted items include: Stats · Counters · Reflections · Evaluations · Grades · Reports. This action cannot be reversed."
        onConfirm={confirmAction}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={deleteAccountModal}
        title="Delete My Account"
        message="Are you sure you want to delete your account? This will permanently delete your player profile, session history, and cached credentials on this device."
        warning="Consequences: All local statistics and training data will be erased immediately. For external server-side records, formal deletion requests can also be submitted to FootballerAthletics@gmail.com."
        onConfirm={handleDeleteAccountConfirm}
        onCancel={() => setDeleteAccountModal(false)}
      />
    </div>
  );
}
