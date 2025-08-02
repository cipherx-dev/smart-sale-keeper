
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for stored auth
    const checkStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem('pos_auth_user');
        console.log('Checking stored auth:', storedUser);
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('Parsed user data:', userData);
          
          // Check if session is still valid (not expired)
          if (userData.isAuthenticated && userData.username) {
            setUser({
              id: userData.id,
              username: userData.username,
              role: userData.role,
              email: userData.email,
            });
            console.log('User authenticated:', userData.username);
          } else {
            console.log('Session invalid, clearing storage');
            localStorage.removeItem('pos_auth_user');
          }
        } else {
          console.log('No stored auth found');
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
        localStorage.removeItem('pos_auth_user');
      } finally {
        setLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // This is handled in LoginForm component
    return true;
  };

  const logout = () => {
    localStorage.removeItem('pos_auth_user');
    setUser(null);
    window.location.reload();
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };
}
