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
  signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
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
          setLoading(false);
        }
      } catch (error) {
        console.error('useAuth: Error getting session:', error);
        setLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('useAuth: Auth state changed:', event, session);
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        console.log('useAuth: No profile found, creating new profile');
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
      setLoading(true);
      
      // Input validation
      if (!email?.trim() || !password?.trim()) {
        return { 
          success: false, 
          error: 'Email and password are required.' 
        };
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return { 
          success: false, 
          error: 'Please enter a valid email address.' 
        };
      }
      
      // Password strength validation
      if (password.length < 6) {
        return { 
          success: false, 
          error: 'Password must be at least 6 characters long.' 
        };
      }
      
      // Handle real Supabase authentication only
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { 
            success: false, 
            error: 'Invalid email or password. Please try again.' 
          };
        }
        if (error.message.includes('Email not confirmed')) {
          return { 
            success: false, 
            error: 'Please confirm your email address before logging in.' 
          };
        }
        throw error;
      }

      return { success: !!data.user };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again later.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem('pos_auth_user');
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Supabase logout fails, clear local state
      setUser(null);
    }
  };

  // Add signup function for complete authentication
  const signup = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Input validation
      if (!email?.trim() || !password?.trim() || !username?.trim()) {
        return { 
          success: false, 
          error: 'All fields are required.' 
        };
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return { 
          success: false, 
          error: 'Please enter a valid email address.' 
        };
      }
      
      // Password strength validation
      if (password.length < 6) {
        return { 
          success: false, 
          error: 'Password must be at least 6 characters long.' 
        };
      }
      
      // Username validation
      if (username.trim().length < 3) {
        return { 
          success: false, 
          error: 'Username must be at least 3 characters long.' 
        };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username.trim()
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { 
            success: false, 
            error: 'An account with this email already exists.' 
          };
        }
        throw error;
      }

      return { 
        success: true,
        error: data.user?.email_confirmed_at 
          ? undefined 
          : 'Please check your email and click the confirmation link to complete registration.'
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again later.' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    login,
    logout,
    signup,
    isAuthenticated: !!user,
    loading,
  };
}