
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Try to find profile by matching with auth user email
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.email) {
          const username = authUser.email === 'admin@smartpos.com' ? 'admin' : 'staff';
          const { data: profileByUsername } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('username', username)
            .maybeSingle();
          
          if (profileByUsername) {
            // Link this profile to the auth user
            await supabase
              .from('user_profiles')
              .update({ user_id: userId })
              .eq('username', username);
            
            setUser({
              id: userId,
              username: profileByUsername.username,
              role: profileByUsername.role,
              email: authUser.email,
            });
          }
        }
        setLoading(false);
        return;
      }

      if (profile) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser({
          id: profile.user_id,
          username: profile.username,
          role: profile.role,
          email: authUser?.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };
}
