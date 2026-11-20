"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  setInMemoryToken,
  persistSessionCookie,
  clearSessionCookie,
  getRefreshTokenFromCookie,
  getInMemoryToken,
  getFreshAccessToken,
} from "@/lib/api-client";
import type { AuthResponse, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // 1. Server-side or no window: stop loading immediately
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    // 2. Login page: never wait for session restore
    const path = window.location.pathname;
    if (path.startsWith("/login")) {
      setIsLoading(false);
      return;
    }

    const existing = getInMemoryToken();
    const refreshToken = getRefreshTokenFromCookie();

    // 3. No tokens at all: stop loading and let the proxy/middleware handle redirect
    if (!existing && !refreshToken) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    // 4. Bulletproof timeout — ensures UI unlocks even if the network hangs
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn("[auth] session restore timed out — forcing load");
        setIsLoading(false);
      }
    }, 1500);

    (async () => {
      try {
        // Try with existing in-memory token first (fastest)
        if (existing) {
          try {
            const me = await api.get<User>("/auth/me");
            if (!cancelled) {
              setUser(me);
              setIsLoading(false);
              clearTimeout(timeoutId);
              return;
            }
          } catch {
            // Token expired/invalid, fall through to refresh
          }
        }

        // Refresh token flow
        const token = await getFreshAccessToken();
        if (!token) {
          if (!cancelled) {
            setInMemoryToken(null);
            clearSessionCookie();
            setUser(null);
          }
          return;
        }

        // Verify with /auth/me using new token
        const me = await api.get<User>("/auth/me");
        if (!cancelled) setUser(me);
      } catch (err) {
        console.warn("[auth] session restore failed", err);
        if (!cancelled) {
          setInMemoryToken(null);
          clearSessionCookie();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<AuthResponse & { refreshToken?: string }>(
      "/auth/login",
      { email, password }
    );
    setInMemoryToken(data.accessToken);
    persistSessionCookie(data.refreshToken);
    setUser(data.user);
    window.location.href = "/dashboard";
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setInMemoryToken(null);
    clearSessionCookie();
    setUser(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}