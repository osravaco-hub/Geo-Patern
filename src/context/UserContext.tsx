import { createContext, useContext, ReactNode } from 'react';
import { useClerkUser, PaymentStatus } from '../hooks/useClerkUser';
import { UserState } from '../lib/userTier';

interface UserContextType {
  user: UserState;
  isLoaded: boolean;
  registerDownload: () => void;
  paymentStatus: PaymentStatus;
  dismissPayment: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded, registerDownload, paymentStatus, dismissPayment } = useClerkUser();
  return (
    <UserContext.Provider value={{ user, isLoaded, registerDownload, paymentStatus, dismissPayment }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUserContext must be used within a UserProvider');
  return context;
}
