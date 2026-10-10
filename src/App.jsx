import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { IntroSequence } from "./components/IntroSequence";
import { PlayerProfile } from "./components/sections/PlayerProfile";
import { PlayerStats } from "./components/sections/PlayerStats";
import { LiveStats } from "./components/sections/LiveStats";
import { ActionWheel } from "./components/sections/ActionWheel";
import { PlayerReflection } from "./components/sections/ReflectionAndFooter";
import { PlayerEvaluation } from "./components/sections/PlayerEvaluation";
import { PlayerAttendanceGrade } from "./components/sections/PlayerAttendanceGrade";
import { FootballFormation } from "./components/sections/Footballformation";
import { NoteToCoach } from "./components/sections/NoteToCoach";
import { UsagePolicy } from "./components/sections/UsagePolicy";
import { Settings } from "./components/sections/Settings";
import { Account } from "./components/sections/Account";
import { PdfReportPage } from "./components/sections/PdfReportPage";
import { PaymentSuccess } from "./components/sections/PaymentSuccess";
import { PlayerDashboard } from "./components/sections/PlayerDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useActiveSession } from "./hooks/useActiveSession";

import { PlayerPassport } from "./components/sections/PlayerPassport";
import { ThirtyDayChallenge } from "./components/sections/ThirtyDayChallenge";
import { AiPlayerAgent } from "./components/sections/AiPlayerAgent";
import { MatchDayPrep } from "./components/sections/MatchDayPrep";

function TouchCounterPage() {
  return <ActionWheel />;
}

function IndexRedirect() {
  const { isAuthenticated } = useAuth();
  let hasValidProfile = false;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("playerProfile");
    const isRegistered = localStorage.getItem("isRegistered") === "true";
    if (stored && isRegistered) {
      try {
        const parsed = JSON.parse(stored);
        const isUnder13 = parsed.age !== "" && parseInt(parsed.age, 10) < 13;
        if (isUnder13) {
          hasValidProfile = Boolean(
            parsed.parentConsent?.parentName &&
            parsed.parentConsent?.parentEmail &&
            parsed.parentConsent?.verified
          );
        } else {
          hasValidProfile = true;
        }
      } catch {
        hasValidProfile = false;
      }
    }
  }

  if (isAuthenticated || hasValidProfile) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/register" replace />;
}

function AppContent() {
  useActiveSession();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<IndexRedirect />} />
        <Route path="register" element={<PlayerProfile />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <PlayerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="stats" element={<PlayerStats />} />
        <Route path="touch-counter" element={<TouchCounterPage />} />
        <Route path="passport" element={<PlayerPassport />} />
        <Route path="challenge" element={<ThirtyDayChallenge />} />
        <Route path="ai-agent" element={<AiPlayerAgent />} />
        <Route path="match-prep" element={<MatchDayPrep />} />
        <Route path="reflection" element={<PlayerReflection />} />
        <Route path="evaluation" element={<PlayerEvaluation />} />
        <Route path="roster" element={<PlayerAttendanceGrade />} />
        <Route path="lineup" element={<FootballFormation />} />
        <Route path="note-to-coach" element={<NoteToCoach />} />
        <Route path="policy" element={<UsagePolicy />} />
        <Route path="settings" element={<Settings />} />
        <Route path="account" element={<Account />} />
        <Route path="pdf-report" element={<PdfReportPage />} />
        <Route path="payment-success" element={<PaymentSuccess />} />
      </Route>
    </Routes>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    // If URL contains login_token parameter, bypass intro sequence completely
    if (typeof window === "undefined") return true;
    const params = new URLSearchParams(window.location.search);
    return !params.has("login_token");
  });

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            {showIntro ? (
              <IntroSequence onComplete={() => setShowIntro(false)} />
            ) : (
              <AppContent />
            )}
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
