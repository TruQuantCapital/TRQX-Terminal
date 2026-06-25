import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { User, Bell, ExternalLink, Shield, Crown, MessageCircle, LogOut } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";

export default function SettingsPage() {
  const { user, tier, token, signOut } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [webhookError, setWebhookError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const isElite = tier === "elite";
  const isPro = ["pro", "elite"].includes(tier);
  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "Free";
  const email = user?.email || "";

  const saveWebhook = async () => {
    if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
      setWebhookError("Please enter a valid Discord webhook URL");
      return;
    }
    setWebhookError(null);
    try {
      const res = await fetch(`${API}/api/webhooks/discord`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ webhookUrl, minPremium: 100000, types: ["sweep", "block", "unusual"] }),
      });
      const data = await res.json();
      if (data.ok) { setWebhookSaved(true); setTimeout(() => setWebhookSaved(false), 3000); }
      else setWebhookError(data.error || "Failed to save");
    } catch { setWebhookError("Connection error"); }
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: User },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "membership", label: "Membership", icon: Crown },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "860px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ color: "#d4af37", fontSize: "24px", fontWeight: "700", margin: 0 }}>Settings</h1>
        <p style={{ color: "#9ca3af", margin: "4px 0 0", fontSize: "14px" }}>Manage your account, notifications, and membership</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid rgba(212,175,55,0.15)", paddingBottom: "0" }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              background: "none",
              border: "none",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: activeTab === key ? "#d4af37" : "#9ca3af",
              borderBottom: activeTab === key ? "2px solid #d4af37" : "2px solid transparent",
              marginBottom: "-1px",
              transition: "color 0.2s",
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Account Info */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "12px", padding: "24px" }}>
            <h2 style={{ color: "#f5f1e8", fontSize: "16px", fontWeight: "700", margin: "0 0 20px" }}>Account Information</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Email Address</label>
                <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "#f5f1e8", fontSize: "14px" }}>
                  {email}
                </div>
              </div>
              <div>
                <label style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Membership Tier</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    background: isElite ? "rgba(212,175,55,0.15)" : isPro ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isElite ? "rgba(212,175,55,0.4)" : isPro ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "8px", padding: "10px 14px",
                    color: isElite ? "#d4af37" : isPro ? "#818cf8" : "#9ca3af",
                    fontSize: "14px", fontWeight: "700", flex: 1,
                  }}>
                    {tierLabel} Member
                  </div>
                  <a
                    href="/pricing"
                    style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "8px", padding: "10px 16px", color: "#d4af37", fontSize: "13px", fontWeight: "600", textDecoration: "none", whiteSpace: "nowrap" }}
                  >
                    {isElite ? "Manage Plan" : "Upgrade →"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Discord Community */}
          <div style={{ background: "rgba(88,101,242,0.08)", border: "1px solid rgba(88,101,242,0.25)", borderRadius: "12px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <MessageCircle size={20} color="#818cf8" />
              <h2 style={{ color: "#f5f1e8", fontSize: "16px", fontWeight: "700", margin: 0 }}>TRQX Trading Floor</h2>
            </div>
            <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 16px", lineHeight: "1.5" }}>
              Live alerts, market prep, and trade ideas — directly in Discord with the TRQX community.
            </p>
            <a
              href="https://discord.gg/jy3ta9qkfH"
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#5865f2", border: "none", borderRadius: "8px", padding: "10px 20px", color: "#fff", fontSize: "14px", fontWeight: "600", textDecoration: "none", cursor: "pointer" }}
            >
              <ExternalLink size={15} />
              Join Discord Server
            </a>
          </div>

          {/* Sign Out */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#f5f1e8", fontSize: "14px", fontWeight: "600" }}>Sign Out</div>
              <div style={{ color: "#9ca3af", fontSize: "13px", marginTop: "2px" }}>Sign out of your TRQX account</div>
            </div>
            <button
              onClick={signOut}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "10px 18px", color: "#ef4444", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Discord Webhook */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "12px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ color: "#f5f1e8", fontSize: "16px", fontWeight: "700", margin: "0 0 4px" }}>Discord Webhook Alerts</h2>
                <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>Get real-time flow alerts delivered directly to your Discord server</p>
              </div>
              <span style={{
                background: isElite ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${isElite ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "6px", padding: "4px 10px",
                color: isElite ? "#d4af37" : "#9ca3af",
                fontSize: "11px", fontWeight: "700",
              }}>
                {isElite ? "ELITE" : "🔒 ELITE ONLY"}
              </span>
            </div>

            {!isElite ? (
              <div>
                <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
                  Upgrade to Elite to receive instant Discord alerts for every sweep, block, and unusual options print.
                </p>
                <a href="/pricing" style={{ display: "inline-block", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "8px", padding: "10px 20px", color: "#d4af37", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                  Upgrade to Elite →
                </a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Discord Webhook URL</label>
                  <input
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "#f5f1e8", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                    placeholder="https://discord.com/api/webhooks/..."
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                  />
                </div>
                {webhookError && <div style={{ color: "#ef4444", fontSize: "13px" }}>{webhookError}</div>}
                {webhookSaved && <div style={{ color: "#22c55e", fontSize: "13px" }}>✅ Webhook saved! Alerts are now active.</div>}
                <button
                  onClick={saveWebhook}
                  style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "8px", padding: "11px 24px", color: "#d4af37", fontSize: "14px", fontWeight: "700", cursor: "pointer", alignSelf: "flex-start" }}
                >
                  Save Webhook
                </button>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "14px", color: "#9ca3af", fontSize: "13px", lineHeight: "1.6" }}>
                  <strong style={{ color: "#f5f1e8" }}>How to get your webhook URL:</strong><br />
                  Discord → Your Server → Server Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEMBERSHIP TAB */}
      {activeTab === "membership" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Current Plan */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "12px", padding: "24px" }}>
            <h2 style={{ color: "#f5f1e8", fontSize: "16px", fontWeight: "700", margin: "0 0 20px" }}>Current Plan</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: isElite ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${isElite ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", marginBottom: "20px" }}>
              <Crown size={28} color={isElite ? "#d4af37" : "#9ca3af"} />
              <div>
                <div style={{ color: isElite ? "#d4af37" : "#f5f1e8", fontSize: "18px", fontWeight: "700" }}>{tierLabel}</div>
                <div style={{ color: "#9ca3af", fontSize: "13px", marginTop: "2px" }}>
                  {isElite ? "Full access to all TRQX features including flow scanner, GEMX, Discord alerts, and Academy" :
                   isPro ? "Access to flow scanner, GEMX, and Academy" :
                   "Limited access — upgrade to unlock the full TRQX Terminal"}
                </div>
              </div>
            </div>

            {/* Feature access summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "Flow Scanner", available: isPro || isElite },
                { label: "GEMX Dashboard", available: isPro || isElite },
                { label: "Options Flow Page", available: isPro || isElite },
                { label: "Discord Alerts", available: isElite },
                { label: "TRQX Academy", available: true },
                { label: "Flash Cards", available: true },
                { label: "Trade Plan", available: true },
                { label: "Economic Calendar", available: true },
              ].map(({ label, available }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", color: available ? "#f5f1e8" : "#6b7280", fontSize: "13px" }}>
                  <span style={{ color: available ? "#22c55e" : "#6b7280", fontSize: "16px" }}>{available ? "✓" : "✗"}</span>
                  {label}
                </div>
              ))}
            </div>

            {!isElite && (
              <a
                href="/pricing"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "8px", padding: "12px 24px", color: "#d4af37", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}
              >
                <Crown size={16} />
                Upgrade Your Plan →
              </a>
            )}
          </div>

          {/* Manage on Whop */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#f5f1e8", fontSize: "14px", fontWeight: "600" }}>Manage Subscription</div>
              <div style={{ color: "#9ca3af", fontSize: "13px", marginTop: "2px" }}>Update billing, cancel, or change your plan on Whop</div>
            </div>
            <a
              href="https://whop.com"
              target="_blank"
              rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 18px", color: "#f5f1e8", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}
            >
              <ExternalLink size={14} />
              Open Whop
            </a>
          </div>

          {/* Security */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Shield size={18} color="#9ca3af" />
              <div>
                <div style={{ color: "#f5f1e8", fontSize: "14px", fontWeight: "600" }}>Account Security</div>
                <div style={{ color: "#9ca3af", fontSize: "13px", marginTop: "2px" }}>Reset your password via email</div>
              </div>
            </div>
            <a
              href="/reset-password"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 18px", color: "#f5f1e8", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}
            >
              Reset Password
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
