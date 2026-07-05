import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as api from './api';

const AuthContext = createContext(null);

const readStoredAuth = () => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  return token && username ? { token, username } : null;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(readStoredAuth);

  const persist = (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setAuth({ token, username });
  };

  const doLogin = useCallback(async (username, password) => {
    const { token, user } = await api.login(username, password);
    persist(token, user.username);
    return user;
  }, []);

  const doRegister = useCallback(async (username, password) => {
    const { token, user } = await api.register(username, password);
    persist(token, user.username);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuth(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(auth),
      token: auth?.token ?? null,
      username: auth?.username ?? null,
      login: doLogin,
      register: doRegister,
      logout,
    }),
    [auth, doLogin, doRegister, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
