import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { apiFetch, getToken, setToken } from '../lib/api';

const AuthContext = createContext(undefined);

// Auto logout after 10 minutes of inactivity (in milliseconds)
const AUTO_LOGOUT_TIME = 10 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const resetLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (user) {
      logoutTimerRef.current = setTimeout(() => {
        console.log('Auto logout due to inactivity');
        signOut();
      }, AUTO_LOGOUT_TIME);
    }
  }, [user, signOut]);

  // Set up activity listeners for auto-logout
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetLogoutTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Start the initial timer
    resetLogoutTimer();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [user, resetLogoutTimer]);

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
