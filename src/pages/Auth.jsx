import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { Mail, Lock, Eye, EyeOff, BarChart3, Zap, GraduationCap, Bot } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [agreeNonPro, setAgreeNonPro] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  async function resetPassword() {
    setError("");
    if (!email) { setError("Enter your email address first."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://trqx.thetrulies.com/reset-password",
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setError("Password reset email sent. Check your inbox.");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (mode === "reset") { await resetPassword(); return; }
    if (mode === "signup" && !agreeNonPro) {
      setError("You must certify Non-Professional status to create an account.");
      return;
    }
    setLoading(true);
    const fn = mode === "login" ? signIn : signUp;
    const { error: err } = await fn(email, pass);
    setLoading(false);
    if (err) { setError(err.message); return; }
    navigate(mode === "signup" ? "/welcome" : "/dashboard");
  }

  const features = [
    { icon: BarChart3, label: "OPTIONS FLOW" },
    { icon: Zap, label: "GAMMA ANALYTICS" },
    { icon: GraduationCap, label: "TRADING ACADEMY" },
    { icon: Bot, label: "AI INTELLIGENCE" },
  ];

  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/auth-bg.jpg')",
        backgroundSize: "cover", backgroundPosition: "center",
        filter: "brightness(0.55)", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, rgba(0,0,0,0.7) 0%, rgba(5,8,16,0.4) 40%, rgba(0,0,0,0.97) 100%)",
        zIndex: 1,
      }} />

      {/* LEFT - Mike photo + signature + name */}
      <div style={{
        position: "absolute", left: 0, bottom: 0, top: 0,
        width: "380px", zIndex: 3,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        paddingLeft: "32px", paddingBottom: "24px",
      }}>
        <img src="/mike-photo.png" alt="Michael Valerio"
          style={{ width: "360px", height: "auto", objectFit: "contain", objectPosition: "bottom",
            filter: "drop-shadow(0 0 50px rgba(212,175,55,0.15))" }} />
        <img src="/signature.png" alt="Signature"
          style={{ width: "220px", height: "auto",
            filter: "drop-shadow(0 0 12px rgba(212,175,55,0.7))",
            marginBottom: "8px", marginTop: "-10px" }} />
        <div style={{ color: "#d4af37", fontSize: "16px", fontWeight: "900", letterSpacing: "0.1em" }}>MICHAEL A. VALERIO</div>
        <div style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "700", letterSpacing: "0.18em", marginTop: "4px" }}>FOUNDER &amp; CEO &mdash; TRQX CAPITAL</div>
      </div>

      {/* CENTER - Big Login Card */}
      <div style={{
        position: "relative", zIndex: 4,
        width: "100%", maxWidth: "720px",
        background: "rgba(4, 7, 14, 0.97)",
        border: "1px solid rgba(212,175,55,0.32)",
        borderRadius: "28px",
        padding: "52px 80px",
        boxShadow: "0 0 160px rgba(0,0,0,0.99), 0 0 80px rgba(212,175,55,0.06)",
        backdropFilter: "blur(40px)",
        maxHeight: "96vh", overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <img src="/trqx-logo-auth.png" alt="TRQX"
            style={{ width: "190px", height: "190px", objectFit: "contain",
              mixBlendMode: "screen",
              filter: "brightness(1.4) drop-shadow(0 0 30px rgba(212,175,55,0.6))",
              marginBottom: "6px" }} />
          <div style={{ color: "#d4af37", fontSize: "13px", fontWeight: "800", letterSpacing: "0.35em" }}>CAPITAL</div>
          <div style={{ color: "rgba(212,175,55,0.4)", fontSize: "10px", letterSpacing: "0.22em", marginTop: "5px" }}>PRECISION. DISCIPLINE. EXECUTION.</div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)", marginBottom: "26px" }} />

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <h2 style={{ color: "#f5f1e8", fontSize: "30px", fontWeight: "800", margin: "0 0 8px" }}>
            {mode === "login" ? <span>Welcome Back, <span style={{ color: "#d4af37" }}>Trader</span></span> :
             mode === "reset" ? "Reset Password" : "Get Started"}
          </h2>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: 0, letterSpacing: "0.06em" }}>
            {mode === "login" ? "Master the Market & Mind." :
             mode === "reset" ? "Enter your email for a reset link." :
             "Create your account — no card required"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Email */}
          <div>
            <label style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "800", letterSpacing: "0.18em", display: "block", marginBottom: "8px" }}>EMAIL</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px", padding: "17px 18px 17px 50px", color: "#f5f1e8", fontSize: "15px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </div>

          {/* Password */}
          {mode !== "reset" && (
            <div>
              <label style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "800", letterSpacing: "0.18em", display: "block", marginBottom: "8px" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
                <input type={showPass ? "text" : "password"} required value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••••"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px", padding: "17px 50px 17px 50px", color: "#f5f1e8", fontSize: "15px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Remember + Forgot */}
          {mode === "login" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#9ca3af", fontSize: "13px" }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                Remember me
              </label>
              <button type="button" onClick={() => { setError(""); setPass(""); setMode("reset"); }}
                style={{ background: "none", border: "none", color: "#d4af37", fontSize: "13px", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                Forgot Password?
              </button>
            </div>
          )}

          {/* Non-Pro */}
          {mode === "signup" && (
            <div style={{ padding: "16px", background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "12px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", fontSize: "12px", lineHeight: "1.6", color: "#c9c9c9" }}>
                <input type="checkbox" checked={agreeNonPro} onChange={e => setAgreeNonPro(e.target.checked)}
                  style={{ marginTop: "2px", accentColor: "#d4af37", flexShrink: 0 }} />
                <span>
                  I certify that I am a <b style={{ color: "#d4af37" }}>Non-Professional subscriber</b> and agree to the Platform Terms, Market Data Agreement, and Risk Disclosure.{" "}
                  <button type="button" onClick={() => setShowTerms(s => !s)}
                    style={{ background: "none", border: "none", color: "#d4af37", textDecoration: "underline", cursor: "pointer", padding: 0, fontSize: "12px" }}>
                    {showTerms ? "Hide" : "View terms"}
                  </button>
                </span>
              </label>
              {showTerms && (
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(212,175,55,0.15)", fontSize: "11px", lineHeight: "1.7", color: "#9a9a9a", maxHeight: "180px", overflowY: "auto" }}>
                  <div style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "6px" }}>NON-PROFESSIONAL SUBSCRIBER CERTIFICATION</div>
                  <div style={{ marginBottom: "10px" }}>By creating an account, you represent and warrant that you are a natural person accessing this platform solely for personal, non-commercial purposes, and that you do not use market data in connection with any trade, business, or professional activity as defined under applicable exchange rules and regulations.</div>
                  <div style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "6px" }}>RISK DISCLOSURE AND DISCLAIMER</div>
                  <div style={{ marginBottom: "10px" }}>TRQX Capital LLC is a financial education and market intelligence technology platform. All content, data, tools, analyses, alerts, and materials provided through this platform are for informational and educational purposes only and do not constitute investment advice, financial advice, trading recommendations, or any form of solicitation to buy or sell any security, option, futures contract, or other financial instrument.</div>
                  <div style={{ marginBottom: "10px" }}>Nothing on this platform should be construed as a recommendation or endorsement of any particular investment strategy or security. Past performance of any strategy, signal, or indicator is not indicative of future results. All trading involves substantial risk of loss, including possible loss of principal.</div>
                  <div>TRQX Capital LLC, its officers, employees, affiliates, and licensors expressly disclaim any liability for losses or damages arising from your use of or reliance on any information or tools provided through this platform. You are solely responsible for your own investment and trading decisions.</div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "14px 18px", color: "#fca5a5", fontSize: "13px" }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "20px",
              background: "linear-gradient(135deg, #c9a227, #f8bf31, #c9a227)",
              border: "none", borderRadius: "14px",
              color: "#000", fontSize: "15px", fontWeight: "900",
              letterSpacing: "0.14em", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, fontFamily: "inherit",
              boxShadow: "0 4px 32px rgba(212,175,55,0.4)",
            }}>
            {loading
              ? (mode === "reset" ? "SENDING..." : "AUTHENTICATING...")
              : mode === "reset" ? "SEND RESET LINK"
              : mode === "login" ? "ACCESS TERMINAL"
              : "CREATE ACCOUNT"}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: "center", marginTop: "22px", fontSize: "14px", color: "#6b7280" }}>
          {mode === "reset" ? "Remembered your password?" : mode === "login" ? "New to TRQX?" : "Already have an account?"}
          {" "}
          <button onClick={() => { setMode(mode === "reset" ? "login" : mode === "login" ? "signup" : "login"); setError(""); setPass(""); }}
            style={{ background: "none", border: "none", color: "#d4af37", fontWeight: "800", cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>
            {mode === "reset" ? "Back to login" : mode === "login" ? "Start free" : "Sign in"}
          </button>
        </div>

        {/* Feature icons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginTop: "28px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <Icon size={28} color="#d4af37" style={{ marginBottom: "6px" }} />
                <div style={{ color: "#4b5563", fontSize: "10px", fontWeight: "800", letterSpacing: "0.06em" }}>{f.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: "16px", color: "#2d3748", fontSize: "10px", letterSpacing: "0.1em" }}>
          For educational use only. Not financial advice.
        </div>
      </div>
    </div>
  );
}