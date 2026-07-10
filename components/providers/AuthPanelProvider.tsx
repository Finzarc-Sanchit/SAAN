'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AuthTab = 'sign-in' | 'register';

type AuthPanelContextValue = {
  isOpen: boolean;
  tab: AuthTab;
  openAuth: (tab?: AuthTab) => void;
  closeAuth: () => void;
  setTab: (tab: AuthTab) => void;
};

const AuthPanelContext = createContext<AuthPanelContextValue | null>(null);

export function AuthPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthTab>('sign-in');

  const openAuth = useCallback((nextTab: AuthTab = 'sign-in') => {
    setTab(nextTab);
    setIsOpen(true);
  }, []);

  const closeAuth = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, tab, openAuth, closeAuth, setTab }),
    [isOpen, tab, openAuth, closeAuth]
  );

  return (
    <AuthPanelContext.Provider value={value}>{children}</AuthPanelContext.Provider>
  );
}

export function useAuthPanel() {
  const context = useContext(AuthPanelContext);
  if (!context) {
    throw new Error('useAuthPanel must be used within AuthPanelProvider');
  }
  return context;
}
