'use client';

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface DataModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  isInitialized: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(
  undefined
);

export const DataModeProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Initialize from localStorage after mount to avoid hydration issues
  useEffect(() => {
    const savedMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(savedMode);
    setIsInitialized(true);
  }, []);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('demoMode', String(newMode));
      
      // Clear React Query cache to force refetch with new mode
      queryClient.invalidateQueries();
      
      return newMode;
    });
  }, [queryClient]);

  return (
    <DataModeContext.Provider value={{ isDemoMode, toggleDemoMode, isInitialized }}>
      {children}
    </DataModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DataModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DataModeProvider');
  }
  return context;
};