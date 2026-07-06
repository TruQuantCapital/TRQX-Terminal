import { createClient } from "@supabase/supabase-js";
console.log("[env check] key starts with:", import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 15));
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);