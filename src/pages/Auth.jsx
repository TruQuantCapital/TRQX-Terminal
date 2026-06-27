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
        filter: "brightness(0.45)",
        zIndex: 0,
      }} />

      {/* Gold gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(10,8,2,0.5) 50%, rgba(0,0,0,0.8) 100%)",
        zIndex: 1,
      }} />

      {/* Left — Mike's photo */}
      <div style={{
        position: "absolute", bottom: 0, left: "40px",
        zIndex: 3, display: "flex", flexDirection: "column", alignItems: "flex-start",
      }}>
        <img
          src="/mike-photo.jpg"
          alt="Michael Valerio"
          style={{
            height: "340px", width: "auto",
            objectFit: "cover", objectPosition: "top",
            filter: "drop-shadow(0 0 30px rgba(212,175,55,0.3))",
          }}
        />
        <div style={{ paddingBottom: "20px" }}>
          <div style={{ color: "#d4af37", fontSize: "13px", fontWeight: "800", letterSpacing: "0.1em" }}>MICHAEL VALERIO</div>
          <div style={{ color: "#9ca3af", fontSize: "11px", letterSpacing: "0.15em" }}>FOUNDER | CEO</div>
        </div>
      </div>

      {/* Right — Stats + Tagline */}
      <div style={{
        position: "absolute", right: "48px", top: "50%", transform: "translateY(-50%)",
        zIndex: 3, textAlign: "right",
      }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>I DON'T FOLLOW THE MARKET.</div>
          <div style={{ color: "#ffffff", fontSize: "28px", fontWeight: "900", letterSpacing: "0.05em", lineHeight: 1.1, textShadow: "0 0 40px rgba(212,175,55,0.4)" }}>I MASTER IT.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "flex-end" }}>
          {[
            { value: "1.2M+", label: "TRADES ANALYZED" },
            { value: "98.7%", label: "PRECISION RATE" },
            { value: "250K+", label: "TRADERS EMPOWERED" },
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ color: "#d4af37", fontSize: "28px", fontWeight: "900", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: "#6b7280", fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Center — Login Card */}
      <div style={{
        position: "relative", zIndex: 4,
        width: "100%", maxWidth: "420px",
        background: "rgba(5, 8, 16, 0.92)",
        border: "1px solid rgba(212,175,55,0.25)",
        borderRadius: "20px",
        padding: "36px 40px",
        boxShadow: "0 0 80px rgba(0,0,0,0.8), 0 0 40px rgba(212,175,55,0.1)",
        backdropFilter: "blur(20px)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img
            src="/trqx-logo-auth.png"
            alt="TRQX Trading Academy"
            style={{ width: "100px", height: "100px", objectFit: "contain", marginBottom: "8px" }}
          />
          <div style={{ color: "#d4af37", fontSize: "22px", fontWeight: "900", letterSpacing: "0.15em" }}>TRQX</div>
          <div style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", letterSpacing: "0.25em" }}>CAPITAL</div>
          <div style={{ color: "rgba(212,175,55,0.5)", fontSize: "9px", letterSpacing: "0.2em", marginTop: "4px" }}>PRECISION. DISCIPLINE. EXECUTION.</div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)", marginBottom: "24px" }} />

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#f5f1e8", fontSize: "20px", fontWeight: "800", margin: "0 0 6px" }}>
            {mode === "login" ? "Welcome Back, " : mode === "reset" ? "Reset Password" : "Get Started"}
            {mode === "login" && <span style={{ color: "#d4af37" }}>Trader</span>}
          </h2>
          <p style={{ color: "#6b7280", fontSize: "12px", margin: 0, letterSpacing: "0.05em" }}>
            {mode === "login" ? "Master the Market & Mind." : mode === "reset" ? "Enter your email for a reset link." : "Create your account — no card required"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Email */}
          <div>
            <label style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "800", letterSpacing: "0.15em", display: "block", marginBottom: "6px" }}>EMAIL</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "14px" }}>✉</span>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
                  padding: "12px 14px 12px 38px", color: "#f5f1e8",
                  fontSize: "13px", outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Password */}
          {mode !== "reset" && (
            <div>
              <label style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "800", letterSpacing: "0.15em", display: "block", marginBottom: "6px" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "14px" }}>🔒</span>
                <input
                  type={showPass ? "text" : "password"} required value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••••"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
                    padding: "12px 40px 12px 38px", color: "#f5f1e8",
                    fontSize: "13px", outline: "none", boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "14px", padding: 0 }}>
                  {showPass ? "👁" : "👁"}
                </button>
              </div>
            </div>
          )}

          {/* Remember + Forgot */}
          {mode === "login" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#9ca3af", fontSize: "12px" }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ accentColor: "#d4af37" }} />
                Remember me
              </label>
              <button type="button" onClick={() => { setError(""); setPass(""); setMode("reset"); }}
                style={{ background: "none", border: "none", color: "#d4af37", fontSize: "12px", cursor: "pointer", padding: 0 }}>
                Forgot Password?
              </button>
            </div>
          )}

          {/* Non-Pro Attestation */}
          {mode === "signup" && (
            <div style={{ padding: "12px 14px", background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px" }}>
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
                  <div>TRQX Capital is for informational and educational purposes only. Nothing on this platform is financial advice. Options trading involves substantial risk.</div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "10px 14px", color: "#fca5a5", fontSize: "12px" }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #d4af37, #f8bf31)",
              border: "none", borderRadius: "10px",
              color: "#000", fontSize: "13px", fontWeight: "900",
              letterSpacing: "0.1em", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, fontFamily: "inherit",
              boxShadow: "0 4px 20px rgba(212,175,55,0.3)",
            }}>
            {loading ? (mode === "reset" ? "SENDING..." : "AUTHENTICATING...") :
              mode === "reset" ? "SEND RESET LINK →" :
              mode === "login" ? "ACCESS TERMINAL →" : "CREATE ACCOUNT →"}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#6b7280" }}>
          {mode === "reset" ? "Remembered your password?" : mode === "login" ? "New to TRQX?" : "Already have an account?"}
          {" "}
          <button onClick={() => { setMode(mode === "reset" ? "login" : mode === "login" ? "signup" : "login"); setError(""); setPass(""); }}
            style={{ background: "none", border: "none", color: "#d4af37", fontWeight: "700", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>
            {mode === "reset" ? "Back to login" : mode === "login" ? "Start free" : "Sign in"}
          </button>
        </div>

        {/* Features row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { icon: "📊", label: "Options Flow" },
            { icon: "⚡", label: "Gamma Analytics" },
            { icon: "🎓", label: "Trading Academy" },
            { icon: "🤖", label: "AI Intelligence" },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>{f.icon}</div>
              <div style={{ color: "#6b7280", fontSize: "9px", fontWeight: "700", letterSpacing: "0.05em", lineHeight: 1.3 }}>{f.label}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "16px", color: "#374151", fontSize: "10px", letterSpacing: "0.1em" }}>
          Trusted by traders worldwide.
        </div>
      </div>
    </div>
  );
}
