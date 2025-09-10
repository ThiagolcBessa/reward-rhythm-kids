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
  const [emailPassword, setEmailPassword] = useState({ email: '', password: '' });
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSubmittingMagicLink, setIsSubmittingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-kid-primary/10 to-kid-secondary/10">
        <Loader2 className="h-8 w-8 animate-spin text-kid-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/parent" replace />;
  }

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailPassword.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingPassword(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: emailPassword.email,
      password: emailPassword.password,
    });

    if (error) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsSubmittingPassword(false);
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMagicLink(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: magicLinkEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/parent`
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
      toast({
        title: "Magic link sent!",
        description: "Check your email for the login link.",
      });
    }
    
    setIsSubmittingMagicLink(false);
  };

  if (magicLinkSent) {
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
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-password">Email address</Label>
                  <Input
                    id="email-password"
                    type="email"
                    placeholder="your@email.com"
                    value={emailPassword.email}
                    onChange={(e) => setEmailPassword({ ...emailPassword, email: e.target.value })}
                    required
                    aria-label="Email address for login"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={emailPassword.password}
                    onChange={(e) => setEmailPassword({ ...emailPassword, password: e.target.value })}
                    required
                    minLength={8}
                    aria-label="Password for login, minimum 8 characters"
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmittingPassword}
                  aria-label="Sign in with email and password"
                >
                  {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Lock className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="magic" className="mt-6">
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