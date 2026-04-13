import { createContext, useCallback, useContext, useState } from 'react';

interface ActiveUserContextValue {
  activeUser: 'arpit' | 'madhu';
  setActiveUser: (userId: 'arpit' | 'madhu') => void;
  switchUser: () => void;
}

const ActiveUserContext = createContext<ActiveUserContextValue | null>(null);

export function ActiveUserProvider({ children }: { children: React.ReactNode }) {
  const stored = localStorage.getItem('activeUser') as 'arpit' | 'madhu' | null;
  const [activeUser, setActiveUserState] = useState<'arpit' | 'madhu'>(stored ?? 'arpit');

  const setActiveUser = useCallback((userId: 'arpit' | 'madhu') => {
    localStorage.setItem('activeUser', userId);
    setActiveUserState(userId);
  }, []);

  const switchUser = useCallback(() => {
    setActiveUser(activeUser === 'arpit' ? 'madhu' : 'arpit');
  }, [activeUser, setActiveUser]);

  return (
    <ActiveUserContext.Provider value={{ activeUser, setActiveUser, switchUser }}>
      {children}
    </ActiveUserContext.Provider>
  );
}

export function useActiveUser(): ActiveUserContextValue {
  const ctx = useContext(ActiveUserContext);
  if (!ctx) throw new Error('useActiveUser must be used within ActiveUserProvider');
  return ctx;
}
