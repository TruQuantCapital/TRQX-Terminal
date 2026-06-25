import React from "react";
import {
  LayoutDashboard,
  Search,
  Activity,
  Target,
  Waves,
  CalendarDays,
  Bell,
  GraduationCap,
  MessageCircle,
  Newspaper,
  Settings,
  Crown,
  BookOpen,
  Home,
  BarChart3,
} from "lucide-react";

export const nav = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "news", label: "News & Alerts", icon: Newspaper },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "research", label: "Stock Research", icon: BarChart3 },
  { key: "options", label: "Options Flow", icon: Activity },
  { key: "scanner", label: "Flow Scanner", icon: Search },
  { key: "gamma", label: "GEMX", icon: Waves },
  { key: "tradeplan", label: "Trade Plan", icon: Target },
  { key: "alerts", label: "Alerts", icon: Bell },
  { key: "academy", label: "Academy", icon: GraduationCap },
  { key: "patterns", label: "Flash Cards", icon: BookOpen },
  { key: "guide", label: "How To Use", icon: BookOpen },
  { key: "discord", label: "Discord", icon: MessageCircle },
  { key: "home", label: "Home", icon: Home },
  { key: "settings", label: "Settings", icon: Settings },
];

const navGroups = [
  {
    label: "MARKET INTELLIGENCE",
    keys: ["dashboard", "news", "calendar", "research"],
  },
  {
    label: "TRADING TOOLS",
    keys: ["options", "scanner", "gamma", "tradeplan", "alerts"],
  },
  {
    label: "EDUCATION",
    keys: ["academy", "patterns", "guide"],
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

export default function Sidebar({ active, setActive, user, tier }) {
  const email = user && user.email;
  const initials = initialsFromEmail(email);
  const displayName = displayNameFromEmail(email);
  const tierLabel = tier ? (tier.charAt(0).toUpperCase() + tier.slice(1) + " Member") : "Free Member";

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

      <nav className="nav">
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
              const item = nav.find(n => n.key === key);
              if (!item) return null;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={"navBtn " + (active === item.key ? "active" : "")}
                  onClick={() => {
                    if (item.key === "home") {
                      window.open("https://thetrulies.com", "_blank");
                    } else if (item.key === "discord") {
                      window.open("https://discord.gg/jy3ta9qkfH", "_blank");
                    } else {
                      setActive(item.key);
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
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


