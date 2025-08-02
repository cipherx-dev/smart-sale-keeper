import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginForm {
  username: string;
  password: string;
}

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  // Demo credentials for testing
  const demoCredentials = {
    admin: { username: 'admin', password: 'cisco@123', email: 'admin@smartpos.com', role: 'admin' as const },
    staff: { username: 'staff', password: 'staff123', email: 'staff@smartpos.com', role: 'staff' as const }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      let authEmail = data.username;
      let authPassword = data.password;
      let userRole: 'admin' | 'staff' = 'staff';

      // Check if using demo credentials
      const isDemoAdmin = data.username === 'admin' && data.password === 'cisco@123';
      const isDemoStaff = data.username === 'staff' && data.password === 'staff123';

      if (isDemoAdmin) {
        authEmail = demoCredentials.admin.email;
        userRole = 'admin';
        
        // Store demo auth for immediate access
        const demoAuthData = {
          id: 'demo-admin',
          username: 'admin',
          role: 'admin',
          email: 'admin@smartpos.com',
          isAuthenticated: true,
          loginTime: Date.now()
        };
        
        localStorage.setItem('pos_auth_user', JSON.stringify(demoAuthData));
        
        toast({
          title: "Demo Login Successful",
          description: "Welcome Admin! Using demo mode.",
        });
        
        // Force page reload to update auth state
        window.location.href = '/';
        return;
        
      } else if (isDemoStaff) {
        authEmail = demoCredentials.staff.email;
        userRole = 'staff';
        
        // Store demo auth for immediate access
        const demoAuthData = {
          id: 'demo-staff',
          username: 'staff',
          role: 'staff',
          email: 'staff@smartpos.com',
          isAuthenticated: true,
          loginTime: Date.now()
        };
        
        localStorage.setItem('pos_auth_user', JSON.stringify(demoAuthData));
        
        toast({
          title: "Demo Login Successful",
          description: "Welcome Staff! Using demo mode.",
        });
        
        // Force page reload to update auth state
        window.location.href = '/';
        return;
      }

      // For non-demo accounts, use regular Supabase auth
      const result = await login(authEmail, authPassword);
      
      // Type guard to check if result has success property
      const hasSuccessProperty = (obj: any): obj is { success: boolean; error?: string } => {
        return obj && typeof obj === 'object' && 'success' in obj;
      };
      
      if (hasSuccessProperty(result)) {
        if (result.success) {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
        } else {
          toast({
            title: "Login Failed",
            description: result.error || "Invalid credentials",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login Failed", 
          description: "Authentication failed",
          variant: "destructive",
        });
      }

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
          <p className="text-sm text-muted-foreground text-center">
            Enter your credentials to access the system
          </p>
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
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="Enter password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-medium mb-2">Demo Credentials</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                <strong>Admin:</strong> admin / cisco@123
              </div>
              <div>
                <strong>Staff:</strong> staff / staff123
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;