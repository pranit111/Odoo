import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService } from '../services/auth';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<any>;
  register: (userData: { username: string; email: string; password: string; password_confirm: string }) => Promise<any>;
  sendOTP: (username: string) => Promise<any>;
  verifyOTP: (username: string, otp: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      // Safety: don't block UI forever on slow networks
      if (!cancelled) setLoading(false);
    }, 5000);

    const initAuth = async () => {
      try {
        const currentUser = authService.getUser();
        if (currentUser && authService.isAuthenticated()) {
          // Optimistically set user to unblock UI, then refresh profile in background
          if (!cancelled) {
            setUser(currentUser);
            setLoading(false);
          }
          try {
            const profile = await authService.getUserProfile();
            if (!cancelled) setUser(profile);
          } catch (e) {
            console.warn('Auth profile refresh failed:', e);
          }
          return;
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authService.logout();
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    initAuth();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const register = async (userData: { username: string; email: string; password: string; password_confirm: string; role?: string }) => {
    try {
      const result = await authService.register({ ...userData, role: userData.role || 'OPERATOR' });
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  const sendOTP = async (username: string) => {
    try {
      const result = await authService.sendOTP(username);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send OTP' 
      };
    }
  };

  const verifyOTP = async (username: string, otp: string) => {
    try {
      const result = await authService.verifyOTP(username, otp);
      setUser(result.user);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'OTP verification failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    sendOTP,
    verifyOTP,
    logout,
    loading,
    isAuthenticated: !!user && authService.isAuthenticated()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};