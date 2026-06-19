import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const [mode, setMode]       = useState("login");
  const [email, setEmail]     = useState("");
  const [pass,  setPass]      = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [agreeNonPro, setAgreeNonPro] = useState(false);
  const [showTerms, setShowTerms]     = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !agreeNonPro) {
      setError("You must certify Non-Professional status and accept the Market Data Terms to create an account.");
      return;
    }

    setLoading(true);
    const fn = mode === "login" ? signIn : signUp;
    const { error: err } = await fn(email, pass);
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (mode === "signup") {
      navigate("/welcome");
    } else {
      navigate("/scanner");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow" />
      </div>

      {/* Left side flow tickers */}
      <div className="auth-side-tickers auth-tickers-left">
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">SPY</span>
          <span className="ticker-pct">$24.8M</span>
          <span className="ticker-tag">⚡ BLOCK</span>
        </div>
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">AAPL</span>
          <span className="ticker-pct">$8.24M</span>
          <span className="ticker-tag">🏦 BLOCK</span>
        </div>
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">NVDA</span>
          <span className="ticker-pct">$1.43M</span>
          <span className="ticker-tag">⚡ SWEEP</span>
        </div>
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">MSFT</span>
          <span className="ticker-pct">$980K</span>
          <span className="ticker-tag">⚡ SWEEP</span>
        </div>
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">AMZN</span>
          <span className="ticker-pct">$2.1M</span>
          <span className="ticker-tag">🏦 BLOCK</span>
        </div>
        <div className="auth-ticker-item bearish">
          <span className="ticker-sym">QQQ</span>
          <span className="ticker-pct">$3.2M</span>
          <span className="ticker-tag">🔥 PUT</span>
        </div>
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">META</span>
          <span className="ticker-pct">$49.8M</span>
          <span className="ticker-tag">🏦 BLOCK</span>
        </div>
      </div>

      {/* Right side flow tickers */}
      <div className="auth-side-tickers auth-tickers-right">
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">GOOGL</span>
          <span className="ticker-pct">$5.6M</span>
          <span className="ticker-tag">⚡ SWEEP</span>
        </div>
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">TSLA</span>
          <span className="ticker-pct">$3.2M</span>
          <span className="ticker-tag">🏦 BLOCK</span>
        </div>
        <div className="auth-ticker-item bearish">
          <span className="ticker-sym">IWM</span>
          <span className="ticker-pct">$1.8M</span>
          <span className="ticker-tag">🔥 PUT</span>
        </div>
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">SPX</span>
          <span className="ticker-pct">$12.4M</span>
          <span className="ticker-tag">🏦 BLOCK</span>
        </div>
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">PLTR</span>
          <span className="ticker-pct">$920K</span>
          <span className="ticker-tag">⚡ SWEEP</span>
        </div>
        <div className="auth-ticker-item bullish">
          <span className="ticker-sym">AMD</span>
          <span className="ticker-pct">$1.1M</span>
          <span className="ticker-tag">🔥 UNUSUAL</span>
        </div>
        <div className="auth-ticker-item bearish">
          <span className="ticker-sym">VIX</span>
          <span className="ticker-pct">$2.7M</span>
          <span className="ticker-tag">🔥 UNUSUAL</span>
        </div>
      </div>

      <div className="auth-card">
        {/* Crown + Brand */}
        <div className="auth-brand-hero">
          <div className="auth-crown-container">
            <img
              src="https://thetrulies.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-7-2026-09_11_29-PM.png"
              className="auth-crown-img"
              alt="TRQX Crown"
            />
          </div>
          <div className="auth-brand-name">TRQX</div>
          <div className="auth-brand-sub">FLOW SCANNER</div>
          <div className="auth-brand-desc">Institutional Options Flow Intelligence</div>
        </div>

        <div className="auth-divider" />

        <div className="auth-headline">
          {mode === "login" ? "Welcome Back" : "Get Started"}
        </div>
        <div className="auth-tagline">
          {mode === "login"
            ? "Track smart money. Execute with precision."
            : "Create your account — no card required"}
        </div>

        {/* Stats */}
        <div className="auth-stats">
          <div className="auth-stat">
            <div className="auth-stat-icon">📊</div>
            <div className="auth-stat-val">$127M+</div>
            <div className="auth-stat-label">Flow Tracked</div>
          </div>
          <div className="auth-stat-divider" />
          <div className="auth-stat">
            <div className="auth-stat-icon">📡</div>
            <div className="auth-stat-val">Live</div>
            <div className="auth-stat-label">Options Flow</div>
          </div>
          <div className="auth-stat-divider" />
          <div className="auth-stat">
            <div className="auth-stat-icon">🤖</div>
            <div className="auth-stat-val">AI</div>
            <div className="auth-stat-label">Market Detection</div>
          </div>
          <div className="auth-stat-divider" />
          <div className="auth-stat">
            <div className="auth-stat-icon">📅</div>
            <div className="auth-stat-val">2YR</div>
            <div className="auth-stat-label">Historical Data</div>
          </div>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field">
            <label className="auth-label">EMAIL</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••••"
              />
              <span className="auth-input-icon">🔒</span>
            </div>
          </div>

          {mode === "login" && (
            <div className="auth-form-extras">
              <label className="auth-remember">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <span>Remember me</span>
              </label>
              <button type="button" className="auth-forgot">Forgot Password?</button>
            </div>
          )}

          {/* Non-Professional Subscriber Attestation — signup only */}
          {mode === "signup" && (
            <div style={{
              marginTop: "14px",
              padding: "12px 14px",
              background: "rgba(212, 175, 55, 0.05)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              borderRadius: "8px",
            }}>
              <label style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                cursor: "pointer",
                fontSize: "12px",
                lineHeight: "1.5",
                color: "#c9c9c9",
              }}>
                <input
                  type="checkbox"
                  checked={agreeNonPro}
                  onChange={e => setAgreeNonPro(e.target.checked)}
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
                  I certify that I am a <b style={{ color: "#d4af37" }}>Non-Professional subscriber</b> and
                  I agree to the Market Data Terms &amp; Risk Disclaimer.{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(s => !s)}
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
                <div style={{
                  marginTop: "10px",
                  paddingTop: "10px",
                  borderTop: "1px solid rgba(212, 175, 55, 0.15)",
                  fontSize: "11px",
                  lineHeight: "1.6",
                  color: "#9a9a9a",
                  maxHeight: "180px",
                  overflowY: "auto",
                }}>
                  <div style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "6px", letterSpacing: "0.5px" }}>
                    NON-PROFESSIONAL SUBSCRIBER CERTIFICATION
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    By checking the box above, you certify that you are a natural person
                    and that you: (1) use market data solely for personal, non-business
                    purposes; (2) are NOT registered or qualified with the SEC, the CFTC,
                    any state securities agency, any securities exchange or association,
                    or any commodities or futures contract market or association;
                    (3) are NOT engaged as an investment advisor (as defined by the
                    Investment Advisers Act of 1940), whether or not registered or
                    qualified; and (4) are NOT employed by a bank or other organization
                    exempt from registration under federal or state securities laws to
                    perform functions that would require registration if performed for an
                    organization not so exempt.
                  </div>
                  <div style={{ color: "#d4af37", fontWeight: "bold", marginBottom: "6px", letterSpacing: "0.5px" }}>
                    RISK DISCLAIMER
                  </div>
                  <div>
                    TRQX Flow Scanner is operated by Tru Quant Capital for informational
                    and educational purposes only. Nothing on this platform constitutes
                    financial, investment, legal, or tax advice, or a recommendation to
                    buy or sell any security. Tru Quant Capital is not a registered
                    investment advisor or broker-dealer. Options trading involves
                    substantial risk and is not suitable for all investors. Market data
                    may be delayed. Past performance does not guarantee future results.
                    You are solely responsible for your own trading decisions.
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <div className="auth-error">⚠ {error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? <span className="auth-loading">Authenticating...</span>
              : <span>{mode === "login" ? "Enter The Scanner →" : "Create Account →"}</span>
            }
          </button>
        </form>

        <div className="auth-toggle">
          {mode === "login" ? "New to TRQX?" : "Already have an account?"}
          <button
            className="auth-toggle-btn"
            onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(""); }}
          >
            {mode === "login" ? "Start free" : "Sign in"}
          </button>
        </div>

        <div className="auth-footer">Plan It. Trade It. Slay It.</div>
      </div>

      {/* Bottom trust bar */}
      <div className="auth-trust-bar">
        <div className="auth-trust-item">
          <span className="trust-icon">👥</span>
          <div>
            <div className="trust-val">2,000+</div>
            <div className="trust-label">TRUSTED BY ELITE TRADERS</div>
          </div>
        </div>
        <div className="auth-trust-divider" />
        <div className="auth-trust-item">
          <span className="trust-icon">📈</span>
          <div>
            <div className="trust-val">$500M+</div>
            <div className="trust-label">FLOW ANALYZED DAILY</div>
          </div>
        </div>
        <div className="auth-trust-divider" />
        <div className="auth-trust-item">
          <span className="trust-icon">🛡️</span>
          <div>
            <div className="trust-val">99.9%</div>
            <div className="trust-label">SYSTEM UPTIME</div>
          </div>
        </div>
        <div className="auth-trust-divider" />
        <div className="auth-trust-item">
          <span className="trust-icon">📅</span>
          <div>
            <div className="trust-val">2024</div>
            <div className="trust-label">LIVE SINCE</div>
          </div>
        </div>
        <div className="auth-trust-secure">🔒 Bank-level encryption · Your data is secure with us</div>
      </div>
    </div>
  );
}
