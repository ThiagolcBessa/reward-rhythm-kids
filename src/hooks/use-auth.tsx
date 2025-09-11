import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { notifySuccess, notifyError, pgFriendlyMessage } from '@/lib/notify';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return;
            console.log('Auth state change:', event, session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            setInitialized(true);
          }
        );

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        console.log('Initial session check:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setInitialized(true);

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        if (!mounted) return;
        console.error('Failed to initialize auth:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      mounted = false;
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in with:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        notifyError("Sign in failed", pgFriendlyMessage(error));
      }
      
      return { error };
    } catch (networkError) {
      console.error('Network error during sign in:', networkError);
      notifyError("Connection failed", "Unable to connect to authentication service. Please check your internet connection.");
      return { error: networkError };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/parent`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      notifyError("Magic link failed", pgFriendlyMessage(error));
    } else {
      notifySuccess("Check your email", "We've sent you a magic link to sign in.");
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/parent`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      notifyError("Sign up failed", pgFriendlyMessage(error));
    } else {
      notifySuccess("Check your email", "We've sent you a confirmation link to complete your sign up.");
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    notifySuccess("Signed out", "You have been signed out successfully.");
  };

  // Don't render children until auth is initialized
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-kid-primary/10 to-kid-secondary/10">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-kid-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signInWithMagicLink,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};