'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { User } from '@/lib/types/auth';
import type { LoginInput, RegisterInput } from '@/lib/types/auth.schemas';
import * as authApi from '@/lib/api/auth';
import { clearSession, restoreSession } from '@/lib/api/client';
import { broadcastAuthSync, subscribeToAuthSync } from '@/lib/auth/auth-sync';
import { applyAuthSession } from '@/lib/auth/csrf';
import { setAccessToken } from '@/lib/auth/token-store';

export type AuthDialogStep =
  | 'login'
  | 'register'
  | 'verify-otp'
  | 'forgot-password'
  | 'forgot-sent';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDialogOpen: boolean;
  dialogStep: AuthDialogStep;
  pendingEmail: string | null;
  openLoginDialog: (step?: AuthDialogStep) => void;
  closeLoginDialog: () => void;
  setDialogStep: (step: AuthDialogStep) => void;
  setPendingEmail: (email: string | null) => void;
  queuePendingAction: (action: () => void) => void;
  completeAuth: (session: { user: User; accessToken: string; csrfToken?: string }) => void;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<AuthDialogStep>('login');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const completeAuth = useCallback((session: { user: User; accessToken: string; csrfToken?: string }) => {
    setAccessToken(session.accessToken);
    applyAuthSession(session);
    setUser(session.user);
    broadcastAuthSync({ type: 'login' });

    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
    }

    setIsDialogOpen(false);
    setDialogStep('login');
  }, []);

  const openLoginDialog = useCallback(
    (step: AuthDialogStep = 'login') => {
      if (user) {
        return;
      }

      setDialogStep(step);
      setIsDialogOpen(true);
    },
    [user],
  );

  const closeLoginDialog = useCallback(() => {
    setIsDialogOpen(false);
    setDialogStep('login');
    pendingActionRef.current = null;
  }, []);

  const queuePendingAction = useCallback((action: () => void) => {
    pendingActionRef.current = action;
  }, []);

  const refreshUser = useCallback(async () => {
    const session = await restoreSession();
    if (session) {
      setUser(session.user);
      return;
    }
    setUser(null);
  }, []);

  useEffect(() => {
    if (user) {
      setIsDialogOpen(false);
      setDialogStep('login');
      pendingActionRef.current = null;
    }
  }, [user]);

  useEffect(() => {
    return subscribeToAuthSync((message) => {
      if (message.type === 'logout') {
        clearSession();
        setUser(null);
        return;
      }

      void restoreSession().then((session) => {
        if (session) {
          setUser(session.user);
        }
      });
    });
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const session = await restoreSession();
        if (!active) return;
        setUser(session?.user ?? null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const session = await authApi.login(input);
      completeAuth(session);
    },
    [completeAuth],
  );

  const register = useCallback(async (input: RegisterInput) => {
    await authApi.register(input);
    setPendingEmail(input.email);
    setDialogStep('verify-otp');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      setUser(null);
      broadcastAuthSync({ type: 'logout' });
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isDialogOpen,
      dialogStep,
      pendingEmail,
      openLoginDialog,
      closeLoginDialog,
      setDialogStep,
      setPendingEmail,
      queuePendingAction,
      completeAuth,
      login,
      register,
      logout,
      refreshUser,
    }),
    [
      user,
      isLoading,
      isDialogOpen,
      dialogStep,
      pendingEmail,
      openLoginDialog,
      closeLoginDialog,
      queuePendingAction,
      completeAuth,
      login,
      register,
      logout,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
