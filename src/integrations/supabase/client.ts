import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use hardcoded URLs to avoid env loading issues
const SUPABASE_URL = 'https://hkifxngnfjyfyfnwildx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhraWZ4bmduZmp5ZnlmbndpbGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDIwNzksImV4cCI6MjA3MzA3ODA3OX0.qtJ4cJRVxMNc4OyLdx1LLxb7ts41jmnOXc_lh58n8lw';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
    },
  },
});