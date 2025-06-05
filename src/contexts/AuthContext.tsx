
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';

interface AuthUser {
  id: string;
  username?: string;
  phone?: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string, isAdmin?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string, isAdmin: boolean = false) => {
    setIsLoading(true);
    try {
      let result;
      
      if (isAdmin) {
        // Admin login using username
        result = await supabaseService.authenticateAdmin(identifier, password);
      } else {
        // Customer login using phone
        result = await supabaseService.authenticateCustomer(identifier, password);
      }
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('auth_user', JSON.stringify(result.user));
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
