// Global auth session state. Wraps the whole app in app/_layout.tsx.
// Token lives in SecureStore (see src/utils/storage); user profile is kept
// in memory + refetched from /users/me on cold start.
import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from "react";

import { AUTH_TOKEN_KEY, api } from "@/src/api/client";
import { storage } from "@/src/utils/storage";

export type ZodiacUser = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  dob: string;
  time_of_birth: string | null;
  place_of_birth: string;
  zodiac_sign: string;
  subscription_status: string;
  streak_count: number;
  last_checkin_date: string | null;
  notif_prefs: {
    daily_reminder: boolean;
    streak_reminder: boolean;
    subscription_updates: boolean;
  };
};

type AuthContextValue = {
  user: ZodiacUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: ZodiacUser) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (partial: Partial<ZodiacUser>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<ZodiacUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await storage.secureGet(AUTH_TOKEN_KEY, "");
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me);
        } catch {
          await storage.secureRemove(AUTH_TOKEN_KEY);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (token: string, userData: ZodiacUser) => {
    await storage.secureSet(AUTH_TOKEN_KEY, token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await storage.secureRemove(AUTH_TOKEN_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      // Silent: keep last known profile if refresh fails.
    }
  }, []);

  const updateUser = useCallback((partial: Partial<ZodiacUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout, refreshUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
