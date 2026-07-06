import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

const OWNER_EMAILS = ["michaelvalerio@thetrulies.com", "michaelvalerio@taurustechs.com"];
const TIER_FEATURES = {
  free:    ["market_intelligence", "news", "calendar"],
  starter: ["market_intelligence", "news", "calendar", "academy", "flashcards", "guide", "stock_research"],
  pro:     ["market_intelligence", "news", "calendar", "academy", "flashcards", "guide", "stock_research", "basic_flow", "filters", "alerts", "ai_chat", "dark_pool", "golden", "sector_heat", "reports", "flow_score", "gemx", "trade_plan", "options_flow", "capital_allocator", "morning_coach"],
  elite:   ["market_intelligence", "news", "calendar", "academy", "flashcards", "guide", "stock_research", "basic_flow", "filters", "alerts", "ai_chat", "dark_pool", "golden", "sector_heat", "reports", "flow_score", "gemx", "trade_plan", "options_flow", "capital_allocator", "morning_coach", "webhooks", "api_access", "smart_money", "flow_replay", "orb_indicator", "ai_everywhere", "market_brief_ai"],
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[auth] session on load:", session?.user?.email, "token:", session?.access_token?.slice(0,20));
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      console.log("[auth] state change:", session?.user?.email, "token:", session?.access_token?.slice(0,20));
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setAccessToken(null); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid) {
    const { data, error } = await supabase
      .from("profiles")
      .select("tier, stripe_customer_id, non_professional, attested_at")
      .eq("id", uid)
      .maybeSingle();

    if (error) {
      console.error("[auth] fetchProfile error:", error.message);
    }
    setProfile(data);

    // ── Tawk.to visitor identification ──
    const tawkTier = OWNER_EMAILS.includes(uid) ? 'Elite' : (data?.tier ?? 'Free');
    const setTawkAttrs = () => {
      window.Tawk_API?.setAttributes?.({
        name: user?.user_metadata?.full_name || user?.email || 'Unknown',
        email: user?.email || '',
        tier: tawkTier,
        userId: uid,
      }, () => {});
    };
    if (window.Tawk_API?.setAttributes) {
      setTawkAttrs();
    } else {
      const prev = window.Tawk_API?.onLoad;
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.onLoad = function () {
        prev?.();
        setTawkAttrs();
      };
    }
  }

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email, password) {
    const result = await supabase.auth.signUp({ email, password });
    // Fire-and-forget welcome email — confirmation is off, so a session exists at signup
    const token = result.data?.session?.access_token;
    if (!result.error && token) {
      fetch("https://trqx-flow-scanner-production.up.railway.app/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    return result;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function getToken() {
    if (accessToken) return accessToken;
    try {
      const key = `sb-${import.meta.env.VITE_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.access_token ?? null;
      }
    } catch {}
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  const isOwner = OWNER_EMAILS.includes(user?.email);
  const tier = isOwner ? "elite" : (profile?.tier ?? "free");
  const token = null;

  const canAccess = (feature) => {
    return TIER_FEATURES[tier]?.includes(feature) ?? false;
  };

  return (
    <AuthContext.Provider value={{
      user, profile, tier, loading,
      signIn, signUp, signOut, getToken, canAccess,
      token: accessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
