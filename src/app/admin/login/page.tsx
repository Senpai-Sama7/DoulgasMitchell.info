'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_ADMIN_EMAIL } from '@/lib/admin-config';
import { startAuthentication } from '@simplewebauthn/browser';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [hasAdminAccount, setHasAdminAccount] = useState(true);
  const { toast } = useToast();
  const asciiRows = useMemo(
    () =>
      Array.from({ length: 50 }, (_, rowIndex) =>
        Array.from({ length: 100 }, (_, columnIndex) =>
          (rowIndex * 17 + columnIndex * 31 + 7) % 2 === 0 ? '1' : '0'
        ).join('')
      ),
    []
  );

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check');
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setHasAdminAccount((data.adminCount ?? 0) > 0);
      } catch {
        setHasAdminAccount(true);
      }
    };

    checkAdminStatus();
  }, []);

  const readErrorMessage = async (response: Response, fallback: string) => {
    try {
      const data = await response.json();
      if (typeof data?.error === 'string' && data.error.trim()) {
        return data.error;
      }
      if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message;
      }
    } catch {
      return fallback;
    }

    return fallback;
  };

  const handleSetupAdmin = async () => {
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Enter the admin email address you want to initialize.',
        variant: 'destructive',
      });
      return;
    }

    if (password.trim().length < 8) {
      toast({
        title: 'Password required',
        description: 'Enter an admin password with at least 8 characters before enabling the portal.',
        variant: 'destructive',
      });
      return;
    }

    setIsSetupLoading(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: 'Douglas Mitchell' }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to enable admin portal');
      }

      toast({
        title: 'Admin portal enabled',
        description: 'The admin account is ready. Sign in with the credentials you just entered.',
      });
      setHasAdminAccount(true);
      setEmail(data.email || DEFAULT_ADMIN_EMAIL);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to initialize admin user.';
      toast({
        title: 'Setup failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSetupLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email to sign in with a passkey.',
        variant: 'destructive',
      });
      return;
    }

    setIsPasskeyLoading(true);

    try {
      const optionsRes = await fetch('/api/admin/auth/passkey/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!optionsRes.ok) {
        const message = await readErrorMessage(optionsRes, 'Failed to get authentication options');
        throw new Error(message);
      }

      const optionsPayload = await optionsRes.json();

      if (!optionsPayload.available) {
        toast({
          title: 'No passkeys registered',
          description: 'Sign in with your password first, then register a passkey from the Security page.',
          variant: 'destructive',
        });
        return;
      }

      const options = optionsPayload.options;

      let authResp;
      try {
        authResp = await startAuthentication({ optionsJSON: options });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Authentication was cancelled.';

        if (
          message.includes('NotAllowedError') ||
          message.includes('timed out') ||
          message.includes('cancelled') ||
          message.includes('canceled')
        ) {
          toast({
            title: 'Passkey cancelled',
            description: 'The passkey prompt was dismissed before authentication completed.',
          });
          return;
        }

        throw error;
      }

      const verifyRes = await fetch('/api/admin/auth/passkey/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          response: authResp,
        }),
      });

      if (verifyRes.ok) {
        toast({
          title: 'Authenticated!',
          description: 'Redirecting to dashboard...',
        });
        window.location.href = '/admin';
      } else {
        throw new Error(await readErrorMessage(verifyRes, 'Verification failed'));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication unsuccessful.';
      toast({
        title: 'Passkey failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: 'Password recovery',
      description: hasAdminAccount
        ? 'Self-serve password reset is not enabled. Use your passkey if it is registered, or rotate the admin password through the secure maintenance flow.'
        : 'No admin account exists yet. Use Enable Admin Portal to create the admin account first.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast({
          title: 'Welcome back!',
          description: 'Redirecting to dashboard...',
        });
        window.location.href = '/admin';
      } else {
        const error = await response.json();
        toast({
          title: 'Authentication failed',
          description: error.message || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      {/* Background ASCII Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <pre className="font-mono text-[8px] text-foreground leading-none">
          {asciiRows.map((row, index) => (
            <div key={index}>{row}</div>
          ))}
        </pre>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">Sign in to manage your content</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasAdminAccount && (
              <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-sm text-amber-700 dark:text-amber-200">No admin account detected. Enter your email and a new password, then enable the admin portal.</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 w-full"
                  onClick={handleSetupAdmin}
                  disabled={isSetupLoading}
                >
                  {isSetupLoading ? 'Enabling admin portal...' : 'Enable Admin Portal'}
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={DEFAULT_ADMIN_EMAIL}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    autoComplete={hasAdminAccount ? 'current-password' : 'new-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isPasskeyLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ◌
                    </motion.span>
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handlePasskeyLogin}
                disabled={isLoading || isPasskeyLoading || !hasAdminAccount}
              >
                {isPasskeyLoading ? 'Authenticating...' : (
                  <>
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Biometric Sign In
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Protected by enterprise-grade security
        </p>
      </motion.div>
    </div>
  );
}
