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
  Crown
} from "lucide-react";

export const nav = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "scanner", label: "Scanner", icon: Search },
  { key: "options", label: "Options Flow", icon: Activity },
  { key: "tradeplan", label: "Trade Plan", icon: Target },
  { key: "gamma", label: "Gamma Ex", icon: Waves },
  { key: "news", label: "News", icon: Newspaper },
  { key: "calendar", label: "Economic Calendar", icon: CalendarDays },
  { key: "alerts", label: "Alerts", icon: Bell },
  { key: "academy", label: "Academy", icon: GraduationCap },
  { key: "discord", label: "Discord", icon: MessageCircle },
  { key: "settings", label: "Settings", icon: Settings },
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
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={"navBtn " + (active === item.key ? "active" : "")}
              onClick={() => setActive(item.key)}
            >
              <Icon className="navIcon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebarCard pro">
        <Crown className="sidebarCardIcon" />

        <div>
          <b>TRQX CAPITAL ELITE</b>
          <p>Elite Member</p>
        </div>

        <button>Elite Access</button>
      </div>

      <div className="sidebarCard discord">
        <MessageCircle className="sidebarCardIcon" />

        <div>
          <b>TRQX Trading Floor</b>
          <p>Live alerts - Education - Market prep</p>
        </div>

        <button>Join Floor</button>
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
