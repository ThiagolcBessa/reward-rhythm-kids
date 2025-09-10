import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const { user, loading } = useAuth();
  
  // Sign in form state
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signInErrors, setSignInErrors] = useState({ email: '', password: '' });
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  // Sign up form state
  const [signUpForm, setSignUpForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [signUpErrors, setSignUpErrors] = useState({ email: '', password: '', confirmPassword: '' });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  
  // Magic link state
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [isSubmittingMagicLink, setIsSubmittingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  // Form toggle
  const [passwordFormMode, setPasswordFormMode] = useState<'signin' | 'signup'>('signin');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-kid-primary/10 to-kid-secondary/10">
        <Loader2 className="h-8 w-8 animate-spin text-kid-primary" />
      </div>
    );
  }

  if (user) {
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');
    
    if (returnTo) {
      return <Navigate to={decodeURIComponent(returnTo)} replace />;
    }
    
    return <Navigate to="/" replace />;
  }

  const validateSignInForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    if (!signInForm.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(signInForm.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!signInForm.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setSignInErrors(errors);
    return isValid;
  };

  const validateSignUpForm = () => {
    const errors = { email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!signUpForm.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(signUpForm.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!signUpForm.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (signUpForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }

    if (!signUpForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (signUpForm.password !== signUpForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setSignUpErrors(errors);
    return isValid;
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignInForm()) return;

    setIsSigningIn(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: signInForm.email,
      password: signInForm.password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Redirect will happen automatically via auth state change
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo');
      window.location.href = returnTo ? decodeURIComponent(returnTo) : '/';
    }
    
    setIsSigningIn(false);
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUpForm()) return;

    setIsSigningUp(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: signUpForm.email,
      password: signUpForm.password,
      options: {
        emailRedirectTo: `${window.location.origin}${window.location.pathname}${window.location.search}`
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.user && !data.user.email_confirmed_at) {
      // Email confirmation required
      setSignUpSuccess(true);
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration.",
      });
    } else {
      // Auto sign in successful
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo');
      window.location.href = returnTo ? decodeURIComponent(returnTo) : '/';
    }
    
    setIsSigningUp(false);
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMagicLink(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: magicLinkEmail,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      toast({
        title: "Failed to send magic link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMagicLinkSent(true);
    }
    
    setIsSubmittingMagicLink(false);
  };

  if (magicLinkSent && !passwordFormMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-kid-primary/10 to-kid-secondary/10 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-kid-success/20">
              <Mail className="h-6 w-6 text-kid-success" />
            </div>
            <CardTitle className="text-2xl font-bold text-kid-primary">Check your email</CardTitle>
            <CardDescription>
              We've sent a magic link to <strong>{magicLinkEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in your email to sign in. You can close this tab.
            </p>
            <Link to="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signUpSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-kid-primary/10 to-kid-secondary/10 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-kid-success/20">
              <Mail className="h-6 w-6 text-kid-success" />
            </div>
            <CardTitle className="text-2xl font-bold text-kid-primary">Check your email</CardTitle>
            <CardDescription>
              We've sent a confirmation link to <strong>{signUpForm.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your email to confirm your account before signing in.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setSignUpSuccess(false)}
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-kid-primary/10 to-kid-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-kid-primary/20">
            <Sparkles className="h-6 w-6 text-kid-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-kid-primary">Welcome Back!</CardTitle>
          <CardDescription>
            Choose your preferred way to sign in to your family dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password" className="text-sm">
                <Lock className="mr-2 h-4 w-4" />
                Email & Password
              </TabsTrigger>
              <TabsTrigger value="magic" className="text-sm">
                <Mail className="mr-2 h-4 w-4" />
                Magic Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="mt-6">
              <div className="space-y-4">
                {/* Form Toggle */}
                <div className="flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setPasswordFormMode('signin')}
                    className={`text-sm font-medium ${
                      passwordFormMode === 'signin' 
                        ? 'text-kid-primary border-b-2 border-kid-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    } pb-2`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasswordFormMode('signup')}
                    className={`text-sm font-medium ${
                      passwordFormMode === 'signup' 
                        ? 'text-kid-primary border-b-2 border-kid-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    } pb-2`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Sign In Form */}
                {passwordFormMode === 'signin' && (
                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email address</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signInForm.email}
                        onChange={(e) => {
                          setSignInForm({ ...signInForm, email: e.target.value });
                          if (signInErrors.email) setSignInErrors({ ...signInErrors, email: '' });
                        }}
                        required
                        aria-label="Email address for sign in"
                        className={signInErrors.email ? 'border-destructive' : ''}
                      />
                      {signInErrors.email && (
                        <p className="text-xs text-destructive">{signInErrors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={signInForm.password}
                        onChange={(e) => {
                          setSignInForm({ ...signInForm, password: e.target.value });
                          if (signInErrors.password) setSignInErrors({ ...signInErrors, password: '' });
                        }}
                        required
                        aria-label="Password for sign in"
                        className={signInErrors.password ? 'border-destructive' : ''}
                      />
                      {signInErrors.password && (
                        <p className="text-xs text-destructive">{signInErrors.password}</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <Link to="/reset-password" className="text-xs text-kid-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSigningIn}
                      aria-label="Sign in with email and password"
                    >
                      {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </form>
                )}

                {/* Sign Up Form */}
                {passwordFormMode === 'signup' && (
                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email address</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signUpForm.email}
                        onChange={(e) => {
                          setSignUpForm({ ...signUpForm, email: e.target.value });
                          if (signUpErrors.email) setSignUpErrors({ ...signUpErrors, email: '' });
                        }}
                        required
                        aria-label="Email address for sign up"
                        className={signUpErrors.email ? 'border-destructive' : ''}
                      />
                      {signUpErrors.email && (
                        <p className="text-xs text-destructive">{signUpErrors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={signUpForm.password}
                        onChange={(e) => {
                          setSignUpForm({ ...signUpForm, password: e.target.value });
                          if (signUpErrors.password) setSignUpErrors({ ...signUpErrors, password: '' });
                        }}
                        required
                        minLength={8}
                        aria-label="Password for sign up, minimum 8 characters"
                        className={signUpErrors.password ? 'border-destructive' : ''}
                      />
                      {signUpErrors.password && (
                        <p className="text-xs text-destructive">{signUpErrors.password}</p>
                      )}
                      {!signUpErrors.password && (
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 8 characters long
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={signUpForm.confirmPassword}
                        onChange={(e) => {
                          setSignUpForm({ ...signUpForm, confirmPassword: e.target.value });
                          if (signUpErrors.confirmPassword) setSignUpErrors({ ...signUpErrors, confirmPassword: '' });
                        }}
                        required
                        aria-label="Confirm password for sign up"
                        className={signUpErrors.confirmPassword ? 'border-destructive' : ''}
                      />
                      {signUpErrors.confirmPassword && (
                        <p className="text-xs text-destructive">{signUpErrors.confirmPassword}</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSigningUp}
                      aria-label="Create account with email and password"
                    >
                      {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Lock className="mr-2 h-4 w-4" />
                      Create Account
                    </Button>
                  </form>
                )}
              </div>
            </TabsContent>

            <TabsContent value="magic" className="mt-6">
              {magicLinkSent ? (
                // Success state
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-kid-success/20">
                    <Mail className="h-6 w-6 text-kid-success" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-kid-primary">Check your email</h3>
                    <p className="text-sm text-muted-foreground">
                      We sent you a login link. Check your email and click the link to sign in.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sent to: <strong>{magicLinkEmail}</strong>
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setMagicLinkSent(false)}
                  >
                    Send another link
                  </Button>
                </div>
              ) : (
                // Magic link form
                <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-magic">Email address</Label>
                    <Input
                      id="email-magic"
                      type="email"
                      placeholder="your@email.com"
                      value={magicLinkEmail}
                      onChange={(e) => setMagicLinkEmail(e.target.value)}
                      required
                      aria-label="Email address for magic link authentication"
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send you a secure link to sign in instantly
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmittingMagicLink}
                    aria-label="Send magic link to email"
                  >
                    {isSubmittingMagicLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-kid-primary transition-colors">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;