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

export default function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      <div className="brandBlock">
        <div className="brandMain">
          <span>TRQX</span>
          <strong>Capital</strong>
        </div>

        <div className="brandDivider"></div>

        <div className="brandTagline">
  DISCIPLINE • EXECUTION • PRECISION
</div>
      </div>

      <nav className="nav">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={`navBtn ${active === item.key ? "active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebarCard pro">
  <Crown size={20} />

  <div>
    <b>TRQX CAPITAL ELITE</b>
    <p>Elite Member</p>
  </div>

  <button>Elite Access</button>
</div>

      <div className="sidebarCard discord">
  <MessageCircle size={22} />

  <div>
    <b>TRQX Trading Floor</b>
    <p>Live alerts • Education • Market prep</p>
  </div>

  <button>Join Floor</button>
</div>

      <div className="userMini">
        <div className="avatar">MJ</div>
        <div>
          <b>Michael J.</b>
          <p>Premium Member</p>
        </div>
      </div>
    </aside>
  );
}
