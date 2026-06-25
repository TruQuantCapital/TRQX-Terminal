import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [agreeNonPro, setAgreeNonPro] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  async function resetPassword() {
    setError("");

    if (!email) {
      setError("Enter your email address first.");
      return;
    }

    setLoading(true);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://trqx.thetrulies.com/reset-password",
    });

    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    setError("Password reset email sent. Check your inbox and spam folder.");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (mode === "reset") {
      await resetPassword();
      return;
    }

    if (mode === "signup" && !agreeNonPro) {
      setError("You must certify Non-Professional status and accept the Market Data Terms to create an account.");
      return;
    }

    setLoading(true);
    const fn = mode === "login" ? signIn : signUp;
    const { error: err } = await fn(email, pass);
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    navigate(mode === "signup" ? "/welcome" : "/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand-hero">
          <div className="auth-crown-container">
            <img
              src="https://thetrulies.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-7-2026-09_11_29-PM.png"
              className="auth-crown-img"
              alt="TRQX Crown"
            />
          </div>
          <div className="auth-brand-name">TRQX</div>
          <div className="auth-brand-sub">CAPITAL</div>
          <div className="auth-brand-desc">Discipline. Execution. Precision.</div>
        </div>

        <div className="auth-divider" />

        <div className="auth-headline">
          {mode === "login"
            ? "Welcome Back"
            : mode === "reset"
              ? "Reset Password"
              : "Get Started"}
        </div>

        <div className="auth-tagline">
          {mode === "login"
            ? "Track smart money. Execute with precision."
            : mode === "reset"
              ? "Enter your email and we will send a reset link."
              : "Create your account — no card required"}
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field">
            <label className="auth-label">EMAIL</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <span className="auth-input-icon">✉</span>
            </div>
          </div>

          {mode !== "reset" && (
            <div className="auth-field">
              <label className="auth-label">PASSWORD</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type="password"
                  required
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••••"
                />
                <span className="auth-input-icon">🔒</span>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="auth-form-extras">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-forgot"
                onClick={() => {
                  setError("");
                  setPass("");
                  setMode("reset");
                }}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {mode === "signup" && (
            <div
              style={{
                marginTop: "14px",
                padding: "12px 14px",
                background: "rgba(212, 175, 55, 0.05)",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                borderRadius: "8px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  cursor: "pointer",
                  fontSize: "12px",
                  lineHeight: "1.5",
                  color: "#c9c9c9",
                }}
              >
                <input
                  type="checkbox"
                  checked={agreeNonPro}
                  onChange={(e) => setAgreeNonPro(e.target.checked)}
                  style={{
                    marginTop: "2px",
                    width: "16px",
                    height: "16px",
                    accentColor: "#d4af37",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                />

                <span>
                  I certify that I am a{" "}
                  <b style={{ color: "#d4af37" }}>Non-Professional subscriber</b>{" "}
                  and I agree to the Market Data Terms & Risk Disclaimer.{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms((s) => !s)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#d4af37",
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "12px",
                    }}
                  >
                    {showTerms ? "Hide terms" : "View full terms"}
                  </button>
                </span>
              </label>

              {showTerms && (
                <div
                  style={{
                    marginTop: "10px",
                    paddingTop: "10px",
                    borderTop: "1px solid rgba(212, 175, 55, 0.15)",
                    fontSize: "11px",
                    lineHeight: "1.6",
                    color: "#9a9a9a",
                    maxHeight: "180px",
                    overflowY: "auto",
                  }}
                >
                  <div style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "6px" }}>
                    NON-PROFESSIONAL SUBSCRIBER CERTIFICATION
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    By checking the box above, you certify that you are a natural person and that
                    you use market data solely for personal, non-business purposes.
                  </div>

                  <div style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "6px" }}>
                    RISK DISCLAIMER
                  </div>
                  <div>
                    TRQX Flow Scanner is for informational and educational purposes only. Nothing
                    on this platform is financial advice. Options trading involves substantial risk.
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <div className="auth-error">⚠ {error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? mode === "reset"
                ? "Sending..."
                : "Authenticating..."
              : mode === "reset"
                ? "Send Reset Link →"
                : mode === "login"
                  ? "Enter TRQX Capital →"
                  : "Create Account →"}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === "reset"
            ? "Remembered your password?"
            : mode === "login"
              ? "New to TRQX?"
              : "Already have an account?"}

          <button
            className="auth-toggle-btn"
            onClick={() => {
              setMode(mode === "reset" ? "login" : mode === "login" ? "signup" : "login");
              setError("");
              setPass("");
            }}
          >
            {mode === "reset"
              ? "Back to login"
              : mode === "login"
                ? "Start free"
                : "Sign in"}
          </button>
        </div>

        <div className="auth-footer">Plan It. Trade It. Slay It.</div>
      </div>
    </div>
  );
}