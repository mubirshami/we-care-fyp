import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('TOKEN') || null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin') || null);
  const [name, setName] = useState(() => localStorage.getItem('Name') || '');

  useEffect(() => {
    if (token) localStorage.setItem('TOKEN', token);
    else localStorage.removeItem('TOKEN');
  }, [token]);

  useEffect(() => {
    if (adminToken) localStorage.setItem('admin', adminToken);
    else localStorage.removeItem('admin');
  }, [adminToken]);

  useEffect(() => {
    if (name) localStorage.setItem('Name', name);
    else localStorage.removeItem('Name');
  }, [name]);

  const login = (newToken) => setToken(newToken);
  const setAdmin = (newAdminToken) => setAdminToken(newAdminToken);
  const setUserName = (newName) => setName(newName);
  const logout = () => {
    setToken(null);
    setAdminToken(null);
    localStorage.removeItem('TOKEN');
    localStorage.removeItem('admin');
  };

  return (
    <AuthContext.Provider value={{ token, adminToken, name, login, setAdmin, setUserName, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
