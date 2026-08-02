import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing VITE_SUPABASE_URL. Check .env.local."
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Missing VITE_SUPABASE_PUBLISHABLE_KEY. Check .env.local."
  );
}

if (
  !supabasePublishableKey.startsWith(
    "sb_publishable_"
  )
) {
  throw new Error(
    "Legacy or invalid Supabase key detected. The frontend must use an sb_publishable_ key."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

export default supabase;
