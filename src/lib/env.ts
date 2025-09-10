import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
});

const parseEnv = () => {
  try {
    return envSchema.parse({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    });
  } catch (error) {
    console.error("❌ Environment validation failed:", error);
    throw new Error(
      "Missing or invalid environment variables. Please check your .env.local file contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    );
  }
};

const env = parseEnv();

export const SUPABASE_URL = env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;