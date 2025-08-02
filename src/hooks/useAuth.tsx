
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
    console.log('useAuth: Initializing auth check...');
    
    // Check localStorage for stored auth
    const checkStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem('pos_auth_user');
        console.log('useAuth: Stored user data:', storedUser);
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('useAuth: Parsed user data:', userData);
          
          // Check if session is still valid
          if (userData.isAuthenticated && userData.username) {
            console.log('useAuth: Setting authenticated user:', userData.username);
            setUser({
              id: userData.id,
              username: userData.username,
              role: userData.role,
              email: userData.email,
            });
          } else {
            console.log('useAuth: Session invalid, clearing storage');
            localStorage.removeItem('pos_auth_user');
            setUser(null);
          }
        } else {
          console.log('useAuth: No stored auth found');
          setUser(null);
        }
      } catch (error) {
        console.error('useAuth: Error checking stored auth:', error);
        localStorage.removeItem('pos_auth_user');
        setUser(null);
      } finally {
        console.log('useAuth: Setting loading to false');
        setLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(checkStoredAuth, 100);
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
