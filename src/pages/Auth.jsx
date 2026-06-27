import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

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
        filter: "brightness(0.4)",
        zIndex: 0,
      }} />

      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(5,8,16,0.55) 50%, rgba(0,0,0,0.85) 100%)",
        zIndex: 1,
      }} />

      {/* Bottom left — Mike's photo + signature */}
      <div style={{
        position: "absolute", bottom: 0, left: "48px",
        zIndex: 3, display: "flex", flexDirection: "column", alignItems: "flex-start",
      }}>
        <img
          src="/mike-photo.jpg"
          alt="Michael Valerio"
          style={{
            height: "380px", width: "auto",
            objectFit: "cover", objectPosition: "top",
            filter: "drop-shadow(0 0 40px rgba(212,175,55,0.25))",
          }}
        />
        {/* Signature */}
        <div style={{ paddingBottom: "24px", marginTop: "-8px" }}>
          <svg width="140" height="48" viewBox="0 0 140 48" style={{ display: "block", marginBottom: "4px" }}>
            <path d="M 10 38 C 20 10, 35 42, 45 20 C 52 5, 58 38, 68 22 C 75 10, 82 36, 95 18 C 102 8, 110 34, 125 20 C 130 16, 133 24, 136 22"
              fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              opacity="0.85" />
            <path d="M 15 42 C 25 38, 40 44, 60 40 C 80 36, 100 42, 130 38"
              fill="none" stroke="#d4af37" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          </svg>
          <div style={{ color: "#d4af37", fontSize: "12px", fontWeight: "800", letterSpacing: "0.12em" }}>MICHAEL VALERIO</div>
          <div style={{ color: "#6b7280", fontSize: "10px", fontWeight: "700", letterSpacing: "0.2em" }}>FOUNDER | CEO</div>
        </div>
      </div>

      {/* Bottom right — Stats */}
      <div style={{
        position: "absolute", bottom: "40px", right: "48px",
        zIndex: 3, textAlign: "right",
      }}>
        {/* Tagline */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>I DON'T FOLLOW THE MARKET.</div>
          <div style={{ color: "#ffffff", fontSize: "32px", fontWeight: "900", letterSpacing: "0.05em", lineHeight: 1.1, textShadow: "0 0 40px rgba(212,175,55,0.5)" }}>I MASTER IT.</div>
        </div>
        {/* Stats row */}
        <div style={{ display: "flex", gap: "32px", justifyContent: "flex-end" }}>
          {[
            { value: "1.2M+", label: "TRADES ANALYZED" },
            { value: "98.7%", label: "PRECISION RATE" },
            { value: "250K+", label: "TRADERS EMPOWERED" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ color: "#d4af37", fontSize: "26px", fontWeight: "900", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: "#6b7280", fontSize: "9px", fontWeight: "700", letterSpacing: "0.15em", marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Center — Login Card */}
      <div style={{
        position: "relative", zIndex: 4,
        width: "100%", maxWidth: "520px",
        background: "rgba(5, 8, 16, 0.94)",
        border: "1px solid rgba(212,175,55,0.3)",
        borderRadius: "24px",
        padding: "44px 52px",
        boxShadow: "0 0 100px rgba(0,0,0,0.9), 0 0 60px rgba(212,175,55,0.08)",
        backdropFilter: "blur(24px)",
      }}>
        {/* Logo — no background */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="/trqx-logo-auth.png"
            alt="TRQX"
            style={{
              width: "130px", height: "130px",
              objectFit: "contain",
              mixBlendMode: "lighten",
              filter: "drop-shadow(0 0 20px rgba(212,175,55,0.4))",
              marginBottom: "4px",
            }}
          />
          <div style={{ color: "#d4af37", fontSize: "26px", fontWeight: "900", letterSpacing: "0.2em", lineHeight: 1 }}>TRQX</div>
          <div style={{ color: "#6b7280", fontSize: "10px", fontWeight: "700", letterSpacing: "0.3em", marginTop: "2px" }}>CAPITAL</div>
          <div style={{ color: "rgba(212,175,55,0.4)", fontSize: "9px", letterSpacing: "0.18em", marginTop: "6px" }}>PRECISION. DISCIPLINE. EXECUTION.</div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)", marginBottom: "22px" }} />

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <h2 style={{ color: "#f5f1e8", fontSize: "22px", fontWeight: "800", margin: "0 0 6px", letterSpacing: "0.02em" }}>
            {mode === "login" ? <>Welcome Back, <span style={{ color: "#d4af37" }}>Trader</span></> :
             mode === "reset" ? "Reset Password" : "Get Started"}
          </h2>
          <p style={{ color: "#6b7280", fontSize: "12px", margin: 0, letterSpacing: "0.08em" }}>
            {mode === "login" ? "Master the Market & Mind." :
             mode === "reset" ? "Enter your email for a reset link." :
             "Create your account — no card required"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email */}
          <div>
            <label style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "800", letterSpacing: "0.18em", display: "block", marginBottom: "7px" }}>EMAIL</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "15px" }}>✉</span>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px 14px 14px 42px", color: "#f5f1e8", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </div>

          {/* Password */}
          {mode !== "reset" && (
            <div>
              <label style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "800", letterSpacing: "0.18em", display: "block", marginBottom: "7px" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "15px" }}>🔒</span>
                <input type={showPass ? "text" : "password"} required value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="••••••••••"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px 42px 14px 42px", color: "#f5f1e8", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "16px", padding: 0 }}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>
          )}

          {/* Remember + Forgot */}
          {mode === "login" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#9ca3af", fontSize: "12px" }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                Remember me
              </label>
              <button type="button" onClick={() => { setError(""); setPass(""); setMode("reset"); }}
                style={{ background: "none", border: "none", color: "#d4af37", fontSize: "12px", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                Forgot Password?
              </button>
            </div>
          )}

          {/* Non-Pro */}
          {mode === "signup" && (
            <div style={{ padding: "14px", background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "10px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: "11px", lineHeight: "1.5", color: "#c9c9c9" }}>
                <input type="checkbox" checked={agreeNonPro} onChange={e => setAgreeNonPro(e.target.checked)}
                  style={{ marginTop: "2px", accentColor: "#d4af37", flexShrink: 0, cursor: "pointer" }} />
                <span>
                  I certify that I am a <b style={{ color: "#d4af37" }}>Non-Professional subscriber</b> and agree to the Market Data Terms & Risk Disclaimer.{" "}
                  <button type="button" onClick={() => setShowTerms(s => !s)}
                    style={{ background: "none", border: "none", color: "#d4af37", textDecoration: "underline", cursor: "pointer", padding: 0, fontSize: "11px" }}>
                    {showTerms ? "Hide terms" : "View terms"}
                  </button>
                </span>
              </label>
              {showTerms && (
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(212,175,55,0.15)", fontSize: "11px", lineHeight: "1.6", color: "#9a9a9a", maxHeight: "140px", overflowY: "auto" }}>
                  <div style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "6px" }}>NON-PROFESSIONAL SUBSCRIBER CERTIFICATION</div>
                  <div style={{ marginBottom: "8px" }}>By checking the box above, you certify that you are a natural person and that you use market data solely for personal, non-business purposes.</div>
                  <div style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "6px" }}>RISK DISCLAIMER</div>
                  <div>TRQX Capital is a financial education and market intelligence platform for informational purposes only. Nothing on this platform constitutes financial advice. Options and securities trading involves substantial risk of loss.</div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", color: "#fca5a5", fontSize: "12px" }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg, #c9a227, #f8bf31, #c9a227)",
              border: "none", borderRadius: "12px",
              color: "#000", fontSize: "13px", fontWeight: "900",
              letterSpacing: "0.12em", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, fontFamily: "inherit",
              boxShadow: "0 4px 24px rgba(212,175,55,0.35)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}>
            {loading ? (mode === "reset" ? "SENDING..." : "AUTHENTICATING...") :
              mode === "reset" ? "SEND RESET LINK →" :
              mode === "login" ? "ACCESS TERMINAL →" : "CREATE ACCOUNT →"}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: "center", marginTop: "18px", fontSize: "12px", color: "#6b7280" }}>
          {mode === "reset" ? "Remembered your password?" : mode === "login" ? "New to TRQX?" : "Already have an account?"}
          {" "}
          <button onClick={() => { setMode(mode === "reset" ? "login" : mode === "login" ? "signup" : "login"); setError(""); setPass(""); }}
            style={{ background: "none", border: "none", color: "#d4af37", fontWeight: "800", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>
            {mode === "reset" ? "Back to login" : mode === "login" ? "Start free" : "Sign in"}
          </button>
        </div>

        {/* Feature icons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { icon: "📊", label: "OPTIONS FLOW" },
            { icon: "⚡", label: "GAMMA ANALYTICS" },
            { icon: "🎓", label: "TRADING ACADEMY" },
            { icon: "🤖", label: "AI INTELLIGENCE" },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", marginBottom: "5px" }}>{f.icon}</div>
              <div style={{ color: "#4b5563", fontSize: "8px", fontWeight: "800", letterSpacing: "0.08em", lineHeight: 1.3 }}>{f.label}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "14px", color: "#374151", fontSize: "10px", letterSpacing: "0.12em" }}>
          Trusted by traders worldwide.
        </div>
      </div>
    </div>
  );
}
