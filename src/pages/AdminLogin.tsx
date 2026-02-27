import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { signIn } from '@/lib/supabase';
import { getUserRole, getBusiness } from '@/lib/database';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast.error('Please enter email and password');
        setIsLoading(false);
        return;
      }

      if (isDemoMode) {
        // Demo mode - use mock data
        localStorage.setItem('adminAuth', JSON.stringify({
          email,
          role: 'business', // or 'super_admin'
          businessId: 'demo-1',
          isDemo: true,
          timestamp: new Date().toISOString(),
        }));

        toast.success('Demo login successful!');
        
        // Redirect based on role (in real app, get from database)
        if (email.includes('admin')) {
          navigate('/admin/superadmin');
        } else {
          navigate('/admin/agency');
        }
      } else {
        // Real Supabase authentication
        const { data, error } = await signIn(email, password);

        if (error) {
          toast.error(error.message);
          setIsLoading(false);
          return;
        }

        if (data?.user) {
          // Get user role from database
          const role = await getUserRole(data.user.id);

          if (role === 'super_admin') {
            localStorage.setItem('adminAuth', JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
              role: 'super_admin',
              timestamp: new Date().toISOString(),
            }));
            navigate('/admin/superadmin');
          } else if (role === 'business') {
            // Get business ID
            const { data: business } = await getBusiness(parseInt(data.user.id));
            
            localStorage.setItem('adminAuth', JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
              role: 'business',
              businessId: business?.business_id,
              timestamp: new Date().toISOString(),
            }));
            navigate('/admin/agency');
          } else {
            toast.error('You do not have admin access');
            setIsLoading(false);
            return;
          }

          toast.success('Login successful!');
        }
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">RentPlan Admin</h1>
          <p className="text-muted-foreground mt-2">Manage your rental business</p>
        </div>

        <Card className="border border-blue-200/50 shadow-lg">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Sign in to your admin account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Demo Mode Toggle */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="demo-mode"
                  checked={isDemoMode}
                  onChange={(e) => setIsDemoMode(e.target.checked)}
                  className="rounded cursor-pointer"
                />
                <label htmlFor="demo-mode" className="text-sm font-medium cursor-pointer text-blue-900">
                  Demo Mode (no Supabase needed)
                </label>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={isDemoMode ? "admin@demo.com or agency@demo.com" : "admin@rentplan.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                {isDemoMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Use "admin" in email for Superadmin, or any other email for Agency Admin
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Demo Credentials Note */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Demo:</strong> Use any email/password to login
                </p>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold"
              >
                {isLoading ? (
                  'Logging in...'
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>

              {/* Back to Home */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
