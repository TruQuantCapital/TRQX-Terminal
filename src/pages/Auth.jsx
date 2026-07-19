import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);

  // Signup fields
  const [fullName, setFullName] = useState("");
  const [accountSize, setAccountSize] = useState("");
  const [mentorshipInterest, setMentorshipInterest] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [agreeNonPro, setAgreeNonPro] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);
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

  async function handleSignUp() {
    setError("");

    // Validation
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!accountSize) {
      setError("Please select your account size.");
      return;
    }

    if (!agreeNonPro) {
      setError("You must certify Non-Professional status to create an account.");
      return;
    }

    if (!agreeRefund) {
      setError("You must agree to the refund disclaimer.");
      return;
    }

    if (mentorshipInterest && !monthlyBudget) {
      setError("Please tell us your budget for mentorship.");
      return;
    }

    setLoading(true);

    // Sign up with Supabase
    const { error: signUpError, data } = await signUp(email, pass);
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

   // Create profile record with additional data
if (data?.user?.id) {
  const profileData = {
    user_id: data.user.id,
    full_name: fullName,
    account_size: accountSize,
    mentorship_interest: mentorshipInterest,
    mentorship_budget: mentorshipInterest ? monthlyBudget : null,
    agreed_to_terms: true,
    agreed_to_refund: true,
  };

  console.log("Attempting to insert profile:", profileData);

  // Wait briefly for the authenticated user to be available in the database.
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { error: profileError, data: profileResult } = await supabase
    .from("profiles")
    .insert([profileData])
    .select();

  console.log("Profile insert result:", {
    error: profileError,
    data: profileResult,
  });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    setError(`Profile error: ${profileError.message}`);
    return;
  }
} else {
  console.error("No user ID returned from signup:", data);
}

navigate("/welcome");
}

async function submit(e) {
    e.preventDefault();
    setError("");

    if (mode === "reset") {
      await resetPassword();
      return;
    }

    if (mode === "signup") {
      await handleSignUp();
      return;
    }

    // Login flow
    setLoading(true);
    const { error: err } = await signIn(email, pass);
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Hero */}
        <div className="auth-brand-hero">
          <div className="auth-crown-container">
            <img
              src="https://thetrulies.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-7-2026-09_11_29-PM.png"
              className="auth-crown-img"
              alt="TRQX Crown"
            />
          </div>
          <div className="auth-brand-name">TRQX</div>
          <div className="auth-brand-sub">CAPITAL TERMINAL</div>
          <div className="auth-brand-desc">Institutional Market Intelligence</div>
        </div>

        <div className="auth-divider" />

        {/* Headline & Tagline */}
        <div className="auth-headline">
          {mode === "login"
            ? ""
            : mode === "reset"
              ? "Reset Password"
              : "Create Your Account"}
        </div>

        <div className="auth-tagline">
          {mode === "login"
            ? "Track smart money. Execute with precision."
            : mode === "reset"
              ? "Enter your email and we will send a reset link."
              : "Join thousands of traders learning to trade smart."}
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={submit}>
          {/* LOGIN MODE */}
          {mode === "login" && (
            <>
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
            </>
          )}

          {/* SIGNUP MODE */}
          {mode === "signup" && (
            <>
              {/* Email */}
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

              {/* Full Name */}
              <div className="auth-field">
                <label className="auth-label">FULL NAME</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                  <span className="auth-input-icon">👤</span>
                </div>
              </div>

              {/* Password */}
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

              {/* Account Size */}
              <div className="auth-field">
                <label className="auth-label">ACCOUNT SIZE</label>
                <select
                  className="auth-input"
                  required
                  value={accountSize}
                  onChange={(e) => setAccountSize(e.target.value)}
                  style={{
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d4af37' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    paddingRight: "36px",
                    color: "#c9c9c9",
                  }}
                >
                  <option value="" style={{ color: "#333" }}>Select your account size...</option>
                  <option value="small" style={{ color: "#333" }}>Small ($0 - $500)</option>
                  <option value="intermediate" style={{ color: "#333" }}>Intermediate ($500 - $1,500)</option>
                  <option value="larger" style={{ color: "#333" }}>Larger ($2,500 - $10,000+)</option>
                </select>
              </div>

              {/* Mentorship Interest */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 14px",
                  background: "rgba(212, 175, 55, 0.05)",
                  border: "1px solid rgba(212, 175, 55, 0.25)",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#d4af37", marginBottom: "10px" }}>
                  INTERESTED IN MENTORSHIP?
                </div>
                <div style={{ fontSize: "12px", color: "#9a9a9a", marginBottom: "10px" }}>
                  Elite mentorship with live coaching & market prep: <b style={{ color: "#d4af37" }}>$299/month</b>
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "#c9c9c9",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={mentorshipInterest}
                    onChange={(e) => {
                      setMentorshipInterest(e.target.checked);
                      if (!e.target.checked) setMonthlyBudget("");
                    }}
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: "#d4af37",
                      cursor: "pointer",
                    }}
                  />
                  <span>Yes, I'm interested in mentorship</span>
                </label>
              </div>

              {/* Monthly Budget (Conditional) */}
              {mentorshipInterest && (
                <div className="auth-field" style={{ marginTop: "14px" }}>
                  <label className="auth-label">WHAT WOULD YOU PAY MONTHLY?</label>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input"
                      type="text"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      placeholder="e.g., $299, $500, flexible..."
                    />
                    <span className="auth-input-icon">💰</span>
                  </div>
                </div>
              )}

              {/* Non-Professional Checkbox */}
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
                    <b style={{ color: "#d4af37" }}>Non-Professional subscriber</b> and I agree to the
                    Market Data Terms & Risk Disclaimer.{" "}
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
                      {showTerms ? "Hide" : "View"}
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
                      By checking the box above, you certify that you are a natural person and that you use market data
                      solely for personal, non-business purposes.
                    </div>

                    <div style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "6px" }}>
                      RISK DISCLAIMER
                    </div>
                    <div>
                      TRQX Flow Scanner is for informational and educational purposes only. Nothing on this platform
                      is financial advice. Options trading involves substantial risk.
                    </div>
                  </div>
                )}
              </div>

              {/* Refund Disclaimer */}
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
                    checked={agreeRefund}
                    onChange={(e) => setAgreeRefund(e.target.checked)}
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
                    I understand that all memberships are non-refundable and final. Trading results are not guaranteed.
                  </span>
                </label>
              </div>
            </>
          )}

          {/* RESET PASSWORD MODE */}
          {mode === "reset" && (
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
          )}

          {/* Error Message */}
          {error && <div className="auth-error">⚠ {error}</div>}

          {/* Submit Button */}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? mode === "reset"
                ? "Sending..."
                : "Authenticating..."
              : mode === "reset"
                ? "Send Reset Link →"
                : mode === "login"
                  ? "Enter TRQX Command Center →"
                  : "Create Account →"}
          </button>
        </form>

        {/* Toggle Between Modes */}
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
              setFullName("");
              setAccountSize("");
              setMentorshipInterest(false);
              setMonthlyBudget("");
            }}
          >
            {mode === "reset"
              ? "Back to login"
              : mode === "login"
                ? "Create account"
                : "Sign in"}
          </button>
        </div>

                <div className="auth-footer">Plan It. Trade It. Slay It.</div>
      </div>
    </div>
  );
}
