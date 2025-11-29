import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useDatabase } from '../hooks/useDatabase.js';

export const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  switchRole: () => {},
  roles: []
});

export const AuthProvider = ({ children }) => {
  const { ready, query } = useDatabase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) {
      return;
    }
    const stored = window.sessionStorage.getItem('farming-platform-user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, [ready]);

  const login = async (email, password) => {
    const results = await query(
      'SELECT id, name, email, role, location, organization, avatar FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (!results.length) {
      throw new Error('Invalid credentials');
    }
    const profile = results[0];
    setUser(profile);
    window.sessionStorage.setItem('farming-platform-user', JSON.stringify(profile));
    return profile;
  };

  const logout = () => {
    setUser(null);
    window.sessionStorage.removeItem('farming-platform-user');
  };

  const switchRole = (role) => {
    if (!user) {
      return;
    }
    const updated = { ...user, role };
    setUser(updated);
    window.sessionStorage.setItem('farming-platform-user', JSON.stringify(updated));
  };

  const roles = useMemo(
    () => [
      { id: 'admin', label: 'Admin' },
      { id: 'farmer', label: 'Farmer' },
      { id: 'expert', label: 'Agricultural Expert' },
      { id: 'public', label: 'Public' }
    ],
    []
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      switchRole,
      roles
    }),
    [user, loading, roles]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
