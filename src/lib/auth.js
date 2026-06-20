import { supabase } from './supabase';

/**
 * Signs a user in with email/password, then fetches their profile
 * (including subscription tier) from the `profiles` table.
 *
 * Returns: { user, profile, error }
 *   profile.tier will be one of: 'free' | 'starter' | 'elite' (etc.)
 *   profile may be null if no profiles row exists yet for this user —
 *   callers should handle that case (e.g. treat as 'free' tier) rather
 *   than assuming profile is always present.
 */
export async function signInWithTier(email, password) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { user: null, profile: null, error: authError.message };
  }

  const user = authData.user;

  // .maybeSingle() instead of .single() — returns null instead of throwing
  // a 406 when zero rows match, which happens if a user's profile row
  // hasn't been created yet (e.g. trigger didn't fire, or new signup).
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tier, non_professional, attested_at, welcome_sent')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Profile fetch error:', profileError.message);
    // Don't block login over a profile read failure — treat as free tier
    // and let the rest of the app handle a null/missing profile gracefully.
    return { user, profile: null, error: null };
  }

  return { user, profile, error: null };
}

/**
 * Fetches the current session's profile/tier. Useful for route guards
 * on app load (e.g. checking if an already-logged-in user can access
 * a gated page).
 */
export async function getCurrentTier() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { user: null, profile: null };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('tier, non_professional, attested_at')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('getCurrentTier profile fetch error:', error.message);
  }

  // profile may legitimately be null here — callers must handle that
  // (hasMinimumTier already does, via the ?? fallback below).
  return { user: session.user, profile: profile || null };
}

/**
 * Simple tier-rank helper for gating features by minimum plan level.
 * Adjust the order to match your actual plan hierarchy.
 */
const TIER_RANK = { free: 0, starter: 1, elite: 2 };

export function hasMinimumTier(userTier, requiredTier) {
  return (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[requiredTier] ?? 0);
}