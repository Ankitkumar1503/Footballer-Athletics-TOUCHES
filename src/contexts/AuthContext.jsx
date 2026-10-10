import React, { createContext, useContext, useState, useEffect } from "react";
import { verifyLoginToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("authToken") || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("authToken"));
  });

  // Check synchronously on mount if URL contains a login_token parameter
  const [isVerifyingToken, setIsVerifyingToken] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.has("login_token");
  });

  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    async function handleAutoLogin() {
      const urlParams = new URLSearchParams(window.location.search);
      const loginToken = urlParams.get("login_token");

      if (loginToken) {
        try {
          // Call API endpoint GET /api/auth/verify-login-token?token=<token>
          const response = await verifyLoginToken(loginToken);

          const jwt = response?.token || response?.jwt || loginToken;
          const userData = response?.user || {
            name: response?.name || response?.playerName || "Player",
            email: response?.email || "",
            footer: response?.footer || response?.activeFooter || "RIGHT",
            paymentStatus: response?.paymentStatus || "paid",
          };

          // Persist session tokens & user profile
          localStorage.setItem("authToken", jwt);
          localStorage.setItem("user", JSON.stringify(userData));

          try {
            const savedProfile = JSON.parse(localStorage.getItem("playerProfile") || "{}");
            localStorage.setItem(
              "playerProfile",
              JSON.stringify({
                ...savedProfile,
                fullName: userData.name || userData.playerName || savedProfile.fullName || "Player",
                activeFooter: (userData.footer || userData.activeFooter || "RIGHT").toUpperCase(),
                email: userData.email || savedProfile.email || "",
              })
            );
          } catch (e) {
            console.error("Error saving playerProfile:", e);
          }

          setToken(jwt);
          setUser(userData);
          setIsAuthenticated(true);

          // Clean login_token query param from URL without reloading
          const url = new URL(window.location.href);
          url.searchParams.delete("login_token");
          window.history.replaceState({}, document.title, url.pathname + url.search);

          window.location.href = "/dashboard";
        } catch (error) {
          console.error("[AUTH] Token verification failed:", error?.message || "Verification error");
          setAuthError("Invalid or expired login token.");

          // Remove parameter from URL
          const url = new URL(window.location.href);
          url.searchParams.delete("login_token");
          window.history.replaceState({}, document.title, url.pathname + url.search);
        } finally {
          setIsVerifyingToken(false);
        }
      } else {
        // No login_token parameter present — check stored session
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } catch (e) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
          }
        }
        setIsVerifyingToken(false);
      }
    }

    handleAutoLogin();
  }, []);

  const login = (jwtToken, userData) => {
    localStorage.setItem("authToken", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const completeRegistration = (profileData, jwtToken, backendData) => {
    try {
      localStorage.setItem("isRegistered", "true");
      localStorage.setItem("playerProfile", JSON.stringify(profileData));

      if (jwtToken) {
        localStorage.setItem("authToken", jwtToken);
        setToken(jwtToken);
      }

      const userData = {
        id: backendData?.id || undefined,
        name:
          profileData.fullName ||
          profileData.playerName ||
          backendData?.name ||
          "Player",
        email: profileData.email || backendData?.email || "",
        footer: (profileData.activeFooter || "RIGHT").toUpperCase(),
        paymentStatus: backendData?.paymentStatus || "unpaid",
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (e) {
      console.error("Error persisting registration state:", e);
      throw e;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("playerProfile");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/register";
  };

  // Block route evaluation while token verification is active
  if (isVerifyingToken) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-6 text-white text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#FF4422] border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-[#FF4422]/20" />
        <div className="space-y-1">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#FF4422]">
            Verifying Login Token...
          </h2>
          <p className="text-[11px] text-white/60 font-medium">
            Authenticating your session with TOUCHES backend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isVerifyingToken,
        authError,
        login,
        completeRegistration,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
