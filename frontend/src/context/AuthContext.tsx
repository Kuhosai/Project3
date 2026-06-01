import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService from '../services/authService';
import apiService from '../services/apiService';

interface AuthContextType {
  user: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Restore session from localStorage on mount
    if (authService.isAuthenticated()) {
      const email = authService.getEmail();
      setUser(email);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await apiService.login({ email, password });
    authService.saveTokens(response.accessToken, response.refreshToken, response.email);
    setUser(response.email);
  };

  const logout = (): void => {
    authService.clearTokens();
    setUser(null);
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
