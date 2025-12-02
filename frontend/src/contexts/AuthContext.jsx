import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { apiFetch, getToken, setToken } from '../lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.uid, email: payload.sub, username: payload.username });
      } catch {
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email, password, username) => {
    try {
      const res = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      });
      setToken(res.token);
      setUser({ email: res.email, username: res.username });
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  const signIn = async (email, password) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      // Decode token to get uid if needed on refresh; here we set minimal user info
      setUser({ email: res.email, username: res.username });
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };


  const demoSignIn = async () => {
    try {
      const res = await apiFetch('/api/auth/demo-login', {
        method: 'POST',
      });
      setToken(res.token);
      setUser({ email: res.email, username: res.username });
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, demoSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
