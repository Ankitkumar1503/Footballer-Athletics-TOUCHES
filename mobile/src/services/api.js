import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Backend API URL: Supports EXPO_PUBLIC_BACKEND_API_URL or local development backend
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_BACKEND_API_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_API_URL;
  }
  // Android emulator accesses host machine's localhost via 10.0.2.2
  if (typeof Platform !== 'undefined' && Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

console.log('[API CONFIG] Active API_BASE_URL:', API_BASE_URL);

/**
 * Robust fetch wrapper with timeout and auth header attachment
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/+$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const token = await AsyncStorage.getItem('authToken').catch(() => null);
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), options.timeout || 15000) : null;

  try {
    const sanitizedPath = endpoint.split('?')[0];
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller?.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error(`[API ERROR] ${options.method || 'GET'} failed:`, error?.message || 'Network error');
    throw error;
  }
}

/**
 * Register a new player with the backend API
 * POST /api/registrations
 */
export const registerPlayer = async (registrationData) => {
  const full = (
    registrationData.fullName ||
    registrationData.playerName ||
    registrationData.firstName ||
    'Player'
  ).trim();

  let firstName = full;
  let lastName = (registrationData.lastName || '').trim();
  if (!lastName && full.includes(' ')) {
    const parts = full.split(/\s+/);
    firstName = parts[0];
    lastName = parts.slice(1).join(' ');
  }

  // Country fallback if not provided or left on default placeholder
  const rawCountry = (registrationData.country || '').trim();
  const country =
    rawCountry && rawCountry !== 'Select country'
      ? rawCountry
      : 'United States';

  // Foot preference normalization ('left' | 'right')
  const rawFoot = (
    registrationData.activeFooter ||
    registrationData.footPreference ||
    'RIGHT'
  ).toLowerCase();
  const footPreference = rawFoot === 'left' ? 'left' : 'right';

  // If email not provided, generate fallback so backend validation succeeds
  const cleanName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';
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
      registrationData.position !== 'Select Position'
        ? registrationData.position
        : undefined,
    // Data minimization: Do not collect or transmit cell phone for players under 13
    phone: isUnder13 ? undefined : (registrationData.cellPhone || registrationData.phone || undefined),
    parentConsent: isUnder13 && registrationData.parentConsent ? registrationData.parentConsent : undefined,
  };

  return await request('/api/registrations', {
    method: 'POST',
    body: JSON.stringify(payload),
    timeout: 15000,
  });
};

/**
 * Verify a login_token with backend
 * GET /api/auth/verify-login-token?token=<token>
 */
export const verifyLoginToken = async (token) => {
  return await request(`/api/auth/verify-login-token?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    timeout: 12000,
  });
};

/**
 * Fetch authenticated user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async () => {
  return await request('/api/auth/me', {
    method: 'GET',
    timeout: 12000,
  });
};

/**
 * Delete authenticated user account on backend
 * DELETE /api/auth/account
 */
export const deleteAccount = async () => {
  return await request('/api/auth/account', {
    method: 'DELETE',
    timeout: 12000,
  });
};

