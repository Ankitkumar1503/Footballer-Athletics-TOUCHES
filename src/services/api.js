import axios from "axios";

// Base URL configured from VITE_BACKEND_API_URL env variable with fallback
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "https://football-backend-gfr2.onrender.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Attach stored JWT token to Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Verify a login_token with the existing backend
 * GET /api/auth/verify-login-token?token=<token>
 */
export const verifyLoginToken = async (token) => {
  try {
    const response = await apiClient.get("/api/auth/verify-login-token", {
      params: { token },
    });
    return response.data;
  } catch (error) {
    console.error(
      "[API] Token verification request failed:",
      error?.response?.status || error.message
    );
    throw error;
  }
};

/**
 * Fetch authenticated user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/api/auth/me");
    return response.data;
  } catch (error) {
    console.error(
      "[API] Error fetching current user profile:",
      error?.response?.status || error.message
    );
    throw error;
  }
};

/**
 * Delete authenticated user account on backend
 * DELETE /api/auth/account
 */
export const deleteAccount = async () => {
  try {
    const response = await apiClient.delete("/api/auth/account");
    return response.data;
  } catch (error) {
    console.error(
      "[API] Error deleting account:",
      error?.response?.status || error.message
    );
    throw error;
  }
};

/**
 * Register a new player with the backend API
 * POST /api/registrations
 */
export const registerPlayer = async (registrationData) => {
  const full = (
    registrationData.fullName ||
    registrationData.playerName ||
    registrationData.firstName ||
    "Player"
  ).trim();

  let firstName = full;
  let lastName = (registrationData.lastName || "").trim();
  if (!lastName && full.includes(" ")) {
    const parts = full.split(/\s+/);
    firstName = parts[0];
    lastName = parts.slice(1).join(" ");
  }

  // Country fallback if not provided or left on default placeholder
  const rawCountry = (registrationData.country || "").trim();
  const country =
    rawCountry && rawCountry !== "Select country"
      ? rawCountry
      : "United States";

  // Foot preference normalization ('left' | 'right')
  const rawFoot = (
    registrationData.activeFooter ||
    registrationData.footPreference ||
    "RIGHT"
  ).toLowerCase();
  const footPreference = rawFoot === "left" ? "left" : "right";

  // Clean or fallback email
  const cleanName = firstName.toLowerCase().replace(/[^a-z0-9]/g, "") || "player";
  const email =
    registrationData.email && registrationData.email.trim().length > 0
      ? registrationData.email.trim()
      : `${cleanName}${Date.now().toString().slice(-4)}@touches.app`;

  const ageNum = registrationData.age ? parseInt(registrationData.age, 10) : null;
  const isUnder13 = ageNum !== null && !isNaN(ageNum) && ageNum < 13;

  const payload = {
    firstName,
    lastName: lastName || undefined,
    email,
    country,
    footPreference,
    age: registrationData.age ? String(registrationData.age) : undefined,
    club: registrationData.club || registrationData.team || undefined,
    position:
      registrationData.position &&
      registrationData.position !== "Select Position"
        ? registrationData.position
        : undefined,
    phone: isUnder13
      ? undefined
      : registrationData.cellPhone || registrationData.phone || undefined,
    parentConsent:
      isUnder13 && registrationData.parentConsent
        ? registrationData.parentConsent
        : undefined,
  };

  try {
    const response = await apiClient.post("/api/registrations", payload);
    return response.data;
  } catch (error) {
    console.error(
      "[API] Registration failed:",
      error?.response?.status || error.message,
      error?.response?.data
    );
    const err = new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Registration failed. Please check your network and try again."
    );
    err.status = error?.response?.status;
    err.data = error?.response?.data;
    throw err;
  }
};
