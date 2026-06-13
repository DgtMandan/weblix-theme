import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

function storeToken(token, remember = true) {
  const primary = remember ? localStorage : sessionStorage;
  const secondary = remember ? sessionStorage : localStorage;
  secondary.removeItem('weblix_token');
  primary.setItem('weblix_token', token);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAdmin: user?.role === 'admin',
    async login(payload, remember = true) {
      const { data } = await api.post('/auth/login', payload);
      if (data.pendingTwoFactor) return data;
      storeToken(data.token, remember);
      setUser(data.user);
      return data.user;
    },
    async verifyLoginOtp(payload, remember = true) {
      const { data } = await api.post('/auth/verify-login-otp', payload);
      storeToken(data.token, remember);
      setUser(data.user);
      return data.user;
    },
    async resendLoginOtp(email) {
      const { data } = await api.post('/auth/resend-login-otp', { email });
      return data;
    },
    async signup(payload) {
      const { data } = await api.post('/auth/signup', payload);
      if (data.pendingVerification) return data;
      storeToken(data.token);
      setUser(data.user);
      return data.user;
    },
    async verifySignupOtp(payload) {
      const { data } = await api.post('/auth/verify-otp', payload);
      storeToken(data.token);
      setUser(data.user);
      return data.user;
    },
    async resendSignupOtp(email) {
      const { data } = await api.post('/auth/resend-otp', { email });
      return data;
    },
    async logout() {
      await api.post('/auth/logout');
      localStorage.removeItem('weblix_token');
      sessionStorage.removeItem('weblix_token');
      setUser(null);
    },
    acceptToken(token) {
      storeToken(token);
      return api.get('/auth/me').then(({ data }) => setUser(data.user));
    },
    async updateProfile(payload) {
      const { data } = await api.put('/auth/profile', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(data.user);
      return data.user;
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
