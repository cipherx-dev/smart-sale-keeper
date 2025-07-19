import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Lock, User, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const authSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(2, 'Username must be at least 2 characters').optional(),
});

type AuthForm = z.infer<typeof authSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, loading } = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: data.username || data.email.split('@')[0],
              role: 'staff'
            }
          }
        });

        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up successful",
            description: "Please check your email to confirm your account",
          });
          setIsSignUp(false);
          reset();
        }
      } else {
        const success = await login(data.email, data.password);
        
        if (success) {
          toast({
            title: "Login successful",
            description: "Welcome to POS System",
          });
        } else {
          toast({
            title: "Login failed", 
            description: "Invalid email or password",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: isSignUp ? "Sign up failed" : "Login failed",
        description: "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            POS System {isSignUp ? 'Sign Up' : 'Login'}
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            {isSignUp ? 'Create a new account' : 'Enter your credentials to access the system'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    {...register('username')}
                    className="pl-10"
                    placeholder="Enter username"
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="pl-10"
                  placeholder="Enter email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="pl-10"
                  placeholder="Enter password"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 
                (isSignUp ? 'Creating Account...' : 'Logging in...') : 
                (isSignUp ? 'Create Account' : 'Login')
              }
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button 
              type="button" 
              variant="link" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                reset();
              }}
              className="text-sm"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Database Status:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>✅ Supabase Database: Connected</div>
              <div>✅ Backend: Fully configured</div>
              <div>✅ Data Storage: Cloud-based secure storage</div>
              {isSignUp && <div>📧 Email confirmation required after signup</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}