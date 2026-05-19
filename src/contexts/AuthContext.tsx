import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AUTH_KEY = 'clipai_auth';
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  checked: boolean;  // true once the initial /api/auth/me check is done
}

interface AuthContextValue extends AuthState {
  saveAuth: (token: string, user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStored(): Pick<AuthState, 'token' | 'user'> {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = loadStored();
  const [state, setState] = useState<AuthState>({
    ...stored,
    checked: false,
  });

  // On mount, validate the stored token against the server
  useEffect(() => {
    if (!stored.token) {
      setState(s => ({ ...s, checked: true }));
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${stored.token}` },
    })
      .then(r => {
        if (r.ok) return r.json();
        throw new Error('invalid');
      })
      .then((data: { id: string; name: string; email: string; role: string; token: string }) => {
        setState({ token: data.token, user: { id: data.id, name: data.name, email: data.email, role: data.role }, checked: true });
      })
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem(AUTH_KEY);
        setState({ token: null, user: null, checked: true });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveAuth = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }));
    setState({ token, user, checked: true });
  }, []);

  const logout = useCallback(async () => {
    if (state.token) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(AUTH_KEY);
    setState({ token: null, user: null, checked: true });
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ ...state, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** Read the stored token without a hook (for non-React code like fetch calls) */
export function getStoredToken(): string | null {
  return loadStored().token;
}
