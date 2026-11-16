import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useClerkUser } from '../hooks/useClerkUser';
import { UserState } from '../lib/userTier';

interface UserContextType {
  user: UserState;
  isLoaded: boolean;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded, upgradeToPro } = useClerkUser();
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshUser = () => setRefreshKey(k => k + 1);

  // Forzar re-render cuando cambie refreshKey
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <UserContext.Provider value={{ user, isLoaded, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}