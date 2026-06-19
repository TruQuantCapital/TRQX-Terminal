import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";

export default function Alerts() {
  const { token, tier } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [minPremium, setMinPremium] = useState(100000);
  const [types, setTypes] = useState(["sweep", "block", "unusual"]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const isElite = tier === "elite";
  const isPro   = ["pro","elite"].includes(tier);

  const toggleType = (t) => {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const saveWebhook = async () => {
    if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
      setError("Please enter a valid Discord webhook URL");
      return;
    }
    setError(null);
    try {
      const res = await fetch(`${API}/api/webhooks/discord`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ webhookUrl, minPremium, types }),
      });
      const data = await res.json();
      if (data.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(data.error || "Failed to save");
    } catch { setError("Connection error"); }
  };

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <h1>🔔 Flow Alerts</h1>
        <p>Get notified when unusual options activity is detected</p>
      </div>

      {/* Alert Types Overview */}
      <div className="alert-types">
        <div className="alert-type-card">
          <div className="at-icon">⚡</div>
          <div className="at-name">SWEEP ALERTS</div>
          <div className="at-desc">Multi-leg, cross-exchange sweep orders. Signals urgency and directional conviction.</div>
          <div className={`at-badge ${isPro ? "at-available" : "at-locked"}`}>{isPro ? "Available" : "Pro+"}</div>
        </div>
        <div className="alert-type-card">
          <div className="at-icon">🏦</div>
          <div className="at-name">BLOCK TRADE ALERTS</div>
          <div className="at-desc">Large institutional orders $1M+. Follow the smart money positioning.</div>
          <div className={`at-badge ${isPro ? "at-available" : "at-locked"}`}>{isPro ? "Available" : "Pro+"}</div>
        </div>
        <div className="alert-type-card">
          <div className="at-icon">🔥</div>
          <div className="at-name">UNUSUAL ACTIVITY</div>
          <div className="at-desc">Abnormal volume vs open interest ratio. Early signal of informed positioning.</div>
          <div className={`at-badge ${isPro ? "at-available" : "at-locked"}`}>{isPro ? "Available" : "Pro+"}</div>
        </div>
        <div className="alert-type-card">
          <div className="at-icon">👑</div>
          <div className="at-name">GOLDEN FLOW</div>
          <div className="at-desc">Premium $500K+ trades. The biggest money moving in the market.</div>
          <div className={`at-badge ${isPro ? "at-available" : "at-locked"}`}>{isPro ? "Available" : "Pro+"}</div>
        </div>
      </div>

      {/* Discord Webhook Setup */}
      <div className={`discord-setup ${!isElite ? "discord-locked" : ""}`}>
        <div className="discord-header">
          <span className="discord-icon">💬</span>
          <span className="discord-title">Discord Webhook Alerts</span>
          <span className={`discord-badge ${isElite ? "badge-elite" : "badge-locked"}`}>
            {isElite ? "ELITE" : "🔒 ELITE ONLY"}
          </span>
        </div>

        {!isElite ? (
          <div className="discord-upgrade">
            <p>Get real-time Discord alerts for every sweep, block, and unusual print directly in your server.</p>
            <ul className="discord-features">
              <li>✅ Instant notification on qualifying trades</li>
              <li>✅ Customizable premium threshold</li>
              <li>✅ Filter by trade type</li>
              <li>✅ TRQX Flow Score included in every alert</li>
            </ul>
            <a href="/pricing" className="upgrade-btn">Upgrade to Elite →</a>
          </div>
        ) : (
          <div className="discord-form">
            <div className="form-group">
              <label>Discord Webhook URL</label>
              <input
                className="form-input"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Minimum Premium</label>
              <select className="form-select" value={minPremium} onChange={e => setMinPremium(+e.target.value)}>
                <option value={50000}>$50K+</option>
                <option value={100000}>$100K+</option>
                <option value={250000}>$250K+</option>
                <option value={500000}>$500K+</option>
                <option value={1000000}>$1M+</option>
              </select>
            </div>
            <div className="form-group">
              <label>Alert Types</label>
              <div className="type-toggles">
                {["sweep","block","unusual"].map(t => (
                  <button
                    key={t}
                    className={`type-toggle ${types.includes(t) ? "toggle-on" : "toggle-off"}`}
                    onClick={() => toggleType(t)}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {error && <div className="form-error">{error}</div>}
            {saved && <div className="form-success">✅ Webhook saved! Alerts are now active.</div>}
            <button className="save-btn" onClick={saveWebhook}>Save Webhook</button>
            <div className="discord-help">
              <strong>How to get a webhook URL:</strong> In Discord → Server Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
