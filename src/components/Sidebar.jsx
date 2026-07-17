import React from "react";
import {
  LayoutDashboard,
  Search,
  Activity,
  Crown,
  Target,
  Waves,
  CalendarDays,
  Bell,
  GraduationCap,
  BookOpen,
  MessageCircle,
  Home,
  Settings,
  Newspaper,
  BarChart3,
  DollarSign,
  PieChart,
  Users,
} from "lucide-react";

export const nav = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, feature: null },
  { key: "news", label: "News & Alerts", icon: Newspaper, feature: "news" },
  { key: "calendar", label: "Economic Calendar", icon: CalendarDays, feature: "calendar" },
  { key: "research", label: "Stock Research", icon: BarChart3, feature: "stock_research" },
  { key: "dividends", label: "Dividend Stocks", icon: DollarSign, feature: "stock_research" },
  { key: "options", label: "Options Flow", icon: Activity, feature: "options_flow" },
  { key: "scanner", label: "Flow Scanner", icon: Search, feature: "basic_flow" },
  { key: "gamma", label: "GEMX", icon: Waves, feature: "gemx" },
  { key: "tradeplan", label: "Trade Plan", icon: Target, feature: "trade_plan" },
  { key: "capital-allocator", label: "Capital Allocator", icon: PieChart, feature: "trade_plan" },
  { key: "alerts", label: "Alerts", icon: Bell, feature: "alerts" },
  { key: "academy", label: "Academy", icon: GraduationCap, feature: "academy" },
  { key: "patterns", label: "Flash Cards", icon: BookOpen, feature: "flashcards" },
  { key: "guide", label: "How To Use", icon: BookOpen, feature: "guide" },
  { key: "mentorship", label: "Elite Mentorship", icon: Users,feature: null, },
  { key: "mentorship", label: "Elite Mentorship", icon: Users, feature: null },
{
  key: "elite",
  label: "Elite Command Center",
  icon: Crown,
  feature: null,
},
{ key: "discord", label: "Discord", icon: MessageCircle, feature: null },
  { key: "discord", label: "Discord", icon: MessageCircle, feature: null },
  { key: "home", label: "Home", icon: Home, feature: null },
  { key: "settings", label: "Settings", icon: Settings, feature: null },
];

const navGroups = [
  {
    label: "MARKET INTELLIGENCE",
    keys: ["dashboard", "news", "calendar", "research", "dividends"],
  },
  {
    label: "TRADING TOOLS",
    keys: ["options", "scanner", "gamma", "tradeplan", "capital-allocator", "alerts"],
  },
  {
  label: "EDUCATION",
  keys: ["academy", "patterns", "guide"],
},
{
  label: "MENTORSHIP",
  keys: ["mentorship", "elite"],
},
{
  label: "COMMUNITY & ACCOUNT",
  keys: ["discord", "home", "settings"],
},
  
];

function initialsFromEmail(email) {
  if (!email) return "?";
  const namePart = email.split("@")[0];
  const segments = namePart.split(/[._-]/).filter(Boolean);
  if (segments.length >= 2) {
    return (segments[0][0] + segments[1][0]).toUpperCase();
  }
  return namePart.slice(0, 2).toUpperCase();
}

function displayNameFromEmail(email) {
  if (!email) return "Guest";
  const namePart = email.split("@")[0];
  const segments = namePart.split(/[._-]/).filter(Boolean);
  if (segments.length >= 2) {
    return capitalize(segments[0]) + " " + segments[1][0].toUpperCase() + ".";
  }
  return capitalize(namePart);
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export default function Sidebar({ active, setActive, user, tier, canAccess }) {
  const email = user && user.email;
  const initials = initialsFromEmail(email);
  const displayName = displayNameFromEmail(email);
  const tierLabel = tier ? (tier.charAt(0).toUpperCase() + tier.slice(1) + " Member") : "Free Member";
  const normalizedTier = String(tier || "free").toLowerCase();

const isOwner =
  String(email || "").toLowerCase() ===
  "michaelvalerio@thetrulies.com";

const hasEliteAccess =
  normalizedTier === "elite" || isOwner;

  return (
    <aside className="sidebar">
      <div className="brandBlock">
        <div className="brandMain">
          <span>TRQX</span>
          <strong>Capital</strong>
        </div>

        <div className="brandDivider"></div>

        <div className="brandTagline">
          DISCIPLINE - EXECUTION - PRECISION
        </div>
      </div>

      <nav className="sidebarNav">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div style={{
              color: "rgba(212,175,55,0.6)",
              fontSize: "10px",
              fontWeight: "900",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "20px 12px 4px",
              borderTop: group.label === "MARKET INTELLIGENCE" ? "none" : "1px solid rgba(255,255,255,0.06)",
              marginTop: group.label === "MARKET INTELLIGENCE" ? "0" : "8px",
            }}>
              {group.label}
            </div>
            {group.keys.map((key) => {
              const item = nav.find((n) => n.key === key);

if (!item) return null;

if (item.key === "elite" && !hasEliteAccess) {
  return null;
}
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={"navBtn " + (active === item.key ? "active" : "") + (item.feature && canAccess && !canAccess(item.feature) ? " navBtn-locked" : "")}
                  onClick={() => {
                    if (item.feature && canAccess && !canAccess(item.feature)) {
                      window.location.href = "/pricing";
                      return;
                    }
                    if (item.key === "home") {
                      window.location.href = "/home";
                    } else if (item.key === "discord") {
                      window.open("https://discord.gg/jy3ta9qkfH", "_blank");
                    } else {
                      setActive(item.key);
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.feature && canAccess && !canAccess(item.feature) && (
                    <span style={{ marginLeft: "auto", fontSize: "10px", color: "#6b7280" }}>🔒</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebarCard pro">
        <Crown size={20} />
        <div>
          <b>TRQX CAPITAL ELITE</b>
          <p>Elite Member</p>
        </div>
        <button onClick={() => window.location.href = "/pricing"}>Elite Access</button>
      </div>

      <div className="sidebarCard discord">
        <MessageCircle size={22} />
        <div>
          <b>TRQX Trading Floor</b>
          <p>Live alerts - Education - Market prep</p>
        </div>
        <button onClick={() => window.open("https://discord.gg/jy3ta9qkfH", "_blank")}>Join Floor</button>
      </div>

      <div className="userMini">
        <div className="avatar">{initials}</div>
        <div>
          <b>{displayName}</b>
          <p>{tierLabel}</p>
        </div>
      </div>
    </aside>
  );
}