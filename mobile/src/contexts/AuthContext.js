import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyLoginToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('user');
        const storedProfile = await AsyncStorage.getItem('playerProfile');
        const registeredFlag = await AsyncStorage.getItem('isRegistered');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }

        // Check if player has completed registration with valid consent
        if (registeredFlag === 'true' && storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile);
            const isUnder13 = parsed.age !== '' && parseInt(parsed.age, 10) < 13;
            if (isUnder13 && (!parsed.parentConsent?.parentName || !parsed.parentConsent?.parentEmail)) {
              setIsRegistered(false);
            } else {
              setIsRegistered(true);
            }
          } catch {
            setIsRegistered(false);
          }
        } else {
          setIsRegistered(false);
        }
      } catch (e) {
        console.error('Error loading stored session:', e);
        setIsRegistered(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredSession();
  }, []);

  const completeRegistration = async (profileData, jwtToken, backendData) => {
    try {
      await AsyncStorage.setItem('isRegistered', 'true');
      await AsyncStorage.setItem('playerProfile', JSON.stringify(profileData));

      if (jwtToken) {
        await AsyncStorage.setItem('authToken', jwtToken);
        setToken(jwtToken);
      }

      const userData = {
        id: backendData?.id || undefined,
        name: profileData.fullName || profileData.playerName || backendData?.name || 'Player',
        email: profileData.email || backendData?.email || '',
        footer: (profileData.activeFooter || 'RIGHT').toUpperCase(),
        paymentStatus: backendData?.paymentStatus || 'unpaid',
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setIsRegistered(true);
      return true;
    } catch (e) {
      console.error('Error persisting registration state:', e);
      throw e;
    }
  };

  const loginWithToken = async (loginToken) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await verifyLoginToken(loginToken);
      const jwt = response?.token || response?.jwt || loginToken;
      const userData = response?.user || {
        name: response?.name || response?.playerName || 'Player',
        email: response?.email || '',
        footer: response?.footer || response?.activeFooter || 'RIGHT',
        paymentStatus: response?.paymentStatus || 'paid',
      };

      await AsyncStorage.setItem('authToken', jwt);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('isRegistered', 'true');

      // Update player profile if needed
      try {
        const savedProfileJson = await AsyncStorage.getItem('playerProfile');
        const savedProfile = savedProfileJson ? JSON.parse(savedProfileJson) : {};
        await AsyncStorage.setItem(
          'playerProfile',
          JSON.stringify({
            ...savedProfile,
            fullName: userData.name || userData.playerName || savedProfile.fullName || 'Player',
            activeFooter: (userData.footer || userData.activeFooter || 'RIGHT').toUpperCase(),
            email: userData.email || savedProfile.email || '',
          })
        );
      } catch (e) {
        console.error('Error saving playerProfile:', e);
      }

      setToken(jwt);
      setUser(userData);
      setIsAuthenticated(true);
      setIsRegistered(true);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('Invalid or expired login token.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (jwtToken, userData) => {
    await AsyncStorage.setItem('authToken', jwtToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('isRegistered', 'true');
    setToken(jwtToken);
    setUser(userData);
    setIsAuthenticated(true);
    setIsRegistered(true);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isRegistered');
      await AsyncStorage.removeItem('playerProfile');
    } catch (e) {
      console.error('Logout storage error:', e);
    }
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsRegistered(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isRegistered,
        isLoading,
        authError,
        login,
        loginWithToken,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
