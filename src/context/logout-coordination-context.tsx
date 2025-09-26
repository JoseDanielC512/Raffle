'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LogoutCoordinationContextType {
  isManualLogoutInProgress: boolean;
  setManualLogoutInProgress: (inProgress: boolean) => void;
}

const LogoutCoordinationContext = createContext<LogoutCoordinationContextType | undefined>(undefined);

export function LogoutCoordinationProvider({ children }: { children: ReactNode }) {
  const [isManualLogoutInProgress, setManualLogoutInProgress] = useState(false);

  return (
    <LogoutCoordinationContext.Provider value={{ 
      isManualLogoutInProgress, 
      setManualLogoutInProgress 
    }}>
      {children}
    </LogoutCoordinationContext.Provider>
  );
}

export function useLogoutCoordination() {
  const context = useContext(LogoutCoordinationContext);
  if (context === undefined) {
    throw new Error('useLogoutCoordination must be used within a LogoutCoordinationProvider');
  }
  return context;
}
