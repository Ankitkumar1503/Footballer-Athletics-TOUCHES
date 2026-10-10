import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If auth status is still loading (verifying token), show loading overlay
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-4 text-white">
        <div className="w-10 h-10 border-4 border-[#FF4422] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-black uppercase tracking-widest text-white/70">
          Verifying Session...
        </p>
      </div>
    );
  }

  // Check if authenticated via backend token OR valid local profile exists
  let isProfileValid = false;
  const storedProfile = localStorage.getItem("playerProfile");
  const isRegistered = localStorage.getItem("isRegistered") === "true";

  if (storedProfile && isRegistered) {
    try {
      const parsed = JSON.parse(storedProfile);
      const isUnder13 = parsed.age !== "" && parseInt(parsed.age, 10) < 13;
      if (isUnder13) {
        // Under 13 requires parent consent to access protected routes
        if (
          parsed.parentConsent?.parentName &&
          parsed.parentConsent?.parentEmail &&
          parsed.parentConsent?.verified
        ) {
          isProfileValid = true;
        } else {
          isProfileValid = false;
        }
      } else {
        isProfileValid = true;
      }
    } catch {
      isProfileValid = false;
    }
  }

  if (!isAuthenticated && !isProfileValid) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return children;
}
