
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
    console.log('useAuth: Initializing...');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('useAuth: Initial session:', session);
        
        if (error) {
          console.error('useAuth: Session error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          // Check for demo authentication in localStorage
          checkDemoAuth();
        }
      } catch (error) {
        console.error('useAuth: Error getting session:', error);
        checkDemoAuth();
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('useAuth: Auth state changed:', event, session);
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        // Check demo auth when no session
        checkDemoAuth();
      }
    });

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkDemoAuth = () => {
    try {
      const storedUser = localStorage.getItem('pos_auth_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.isAuthenticated && userData.username) {
          console.log('useAuth: Found demo auth:', userData.username);
          setUser({
            id: userData.id,
            username: userData.username,
            role: userData.role,
            email: userData.email,
          });
        } else {
          localStorage.removeItem('pos_auth_user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('useAuth: Demo auth error:', error);
      localStorage.removeItem('pos_auth_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('useAuth: Fetching profile for user:', authUser.id);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('useAuth: Profile fetch error:', error);
        setLoading(false);
        return;
      }

      if (profile) {
        console.log('useAuth: Profile found:', profile);
        setUser({
          id: profile.user_id || authUser.id,
          username: profile.username,
          role: profile.role,
          email: authUser.email || '',
        });
      } else {
        console.log('useAuth: No profile found, using auth user data');
        // Create profile if it doesn't exist
        const username = authUser.email?.split('@')[0] || 'user';
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authUser.id,
            username: username,
            role: 'staff'
          })
          .select()
          .maybeSingle();

        if (!createError && newProfile) {
          setUser({
            id: authUser.id,
            username: newProfile.username,
            role: newProfile.role,
            email: authUser.email || '',
          });
        }
      }
    } catch (error) {
      console.error('useAuth: Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('useAuth: Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('useAuth: Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('useAuth: Login successful');
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('useAuth: Login exception:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      console.log('useAuth: Logging out...');
      
      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Clear localStorage
      localStorage.removeItem('pos_auth_user');
      
      // Clear user state
      setUser(null);
      
      // Redirect to login
      window.location.href = '/';
    } catch (error) {
      console.error('useAuth: Logout error:', error);
      // Force logout even if Supabase fails
      localStorage.removeItem('pos_auth_user');
      setUser(null);
      window.location.href = '/';
    }
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };
}
