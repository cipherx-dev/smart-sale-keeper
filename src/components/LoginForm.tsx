
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LoginForm {
  username: string;
  password: string;
}

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  // Hardcoded users mapping
  const defaultUsers = {
    admin: { username: 'admin', password: 'cisco@123', role: 'admin' as const, email: 'admin@pos.local' },
    staff: { username: 'staff', password: 'staff123', role: 'staff' as const, email: 'staff@pos.local' }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      // Check hardcoded credentials first
      let userInfo = null;
      if (data.username === 'admin' && data.password === 'cisco@123') {
        userInfo = defaultUsers.admin;
      } else if (data.username === 'staff' && data.password === 'staff123') {
        userInfo = defaultUsers.staff;
      }

      if (!userInfo) {
        toast({
          title: "Invalid Credentials",
          description: "Username or password is incorrect",
          variant: "destructive",
        });
        return;
      }

      // Try to sign in with existing user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userInfo.email,
        password: data.password,
      });

      if (authError) {
        console.log('User does not exist in auth, creating new user...');
        // Create the user account if it doesn't exist
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: userInfo.email,
          password: data.password,
          options: {
            data: {
              username: userInfo.username,
              role: userInfo.role,
            }
          }
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          toast({
            title: "Authentication Error",
            description: "Failed to create user account",
            variant: "destructive",
          });
          return;
        }

        console.log('User account created successfully');
      }

      // Check if user profile exists and create/update if necessary
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', userInfo.username)
        .single();

      if (!existingProfile && authData?.user) {
        // Create profile for the user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            username: userInfo.username,
            role: userInfo.role,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      } else if (existingProfile && authData?.user) {
        // Update the user_id in the profile to link it to the auth user
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ user_id: authData.user.id })
          .eq('username', userInfo.username);

        if (updateError) {
          console.error('Profile update error:', updateError);
        }
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userInfo.username}!`,
      });

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">POS System Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register('username', { required: 'Username is required' })}
                placeholder="Enter username"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                placeholder="Enter password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                "Logging in..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
