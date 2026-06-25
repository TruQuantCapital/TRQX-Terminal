import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Sidebar from "./components/Sidebar";
import TopRibbon from "./components/TopRibbon";
import TickerTape from "./components/TickerTape";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import GammaPage from "./pages/GammaPage";
import LandingPage from "./pages/LandingPage";
import NewsPage from "./pages/NewsPage";
import OptionsPage from "./pages/OptionsPage";
import TradePlanPage from "./pages/TradePlanPage";
import EconomicCalendarPage from "./pages/EconomicCalendarPage";
import AcademyPage from "./pages/AcademyPage";
import PatternsPage from "./pages/PatternsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Welcome from "./pages/Welcome";
import ResetPassword from "./pages/ResetPassword";
import SettingsPage from "./pages/SettingsPage";
import "./styles.css";
import "./app.css";

const routeByKey = {
  dashboard: "/dashboard",
  scanner: "/scanner",
  options: "/options-flow",
  tradeplan: "/trade-plan",
  gamma: "/gamma-ex",
  calendar: "/economic-calendar",
  alerts: "/alerts",
  academy: "/academy",
  patterns: "/patterns",
  discord: "/discord",
  news: "/news",
  settings: "/settings",
};

const keyByPath = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/scanner": "scanner",
  "/options-flow": "options",
  "/trade-plan": "tradeplan",
  "/gamma-ex": "gamma",
  "/economic-calendar": "calendar",
  "/alerts": "alerts",
  "/academy": "academy",
  "/patterns": "patterns",
  "/discord": "discord",
  "/news": "news",
  "/settings": "settings",
  "/pricing": "settings",
  "/reports": "news",
};

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">⚡</div>
      <div className="loading-text">TRQX UNIFIED TERMINAL</div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function TerminalLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, tier, signOut } = useAuth();
  const active = keyByPath[location.pathname] || "dashboard";

  const setActive = (key) => {
    const next = routeByKey[key] || "/dashboard";
    navigate(next);
  };

  return (
    <div className="app">
      <Sidebar active={active} setActive={setActive} user={user} tier={tier} />

      <section className="content">
        <TopRibbon />
        <TickerTape />

        {user && (
          <div className="terminal-userbar">
            <span>{user.email}</span>
            <b>{tier?.toUpperCase?.() || "FREE"}</b>
            <button onClick={() => navigate("/pricing")}>Plans</button>
            <button onClick={signOut}>Sign out</button>
          </div>
        )}

        {children}
      </section>
    </div>
  );
}

function ProtectedTerminal({ children }) {
  return (
    <ProtectedRoute>
      <TerminalLayout>{children}</TerminalLayout>
    </ProtectedRoute>
  );
}
function DiscordRedirect() {
  React.useEffect(() => {
    window.open("https://discord.gg/jy3ta9qkfH", "_blank");
    window.history.back();
  }, []);
  return null;
}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/" element={<ProtectedTerminal><Dashboard /></ProtectedTerminal>} />
          <Route path="/dashboard" element={<ProtectedTerminal><Dashboard /></ProtectedTerminal>} />
          <Route path="/scanner" element={<ProtectedTerminal><Scanner /></ProtectedTerminal>} />
          <Route path="/options-flow" element={<ProtectedTerminal><OptionsPage /></ProtectedTerminal>} />
          <Route path="/trade-plan" element={<ProtectedTerminal><TradePlanPage /></ProtectedTerminal>} />
          <Route path="/gamma-ex" element={<ProtectedTerminal><GammaPage /></ProtectedTerminal>} />
          <Route path="/economic-calendar" element={<ProtectedTerminal><EconomicCalendarPage /></ProtectedTerminal>} />
          <Route path="/news" element={<ProtectedTerminal><NewsPage /></ProtectedTerminal>} />
          <Route path="/patterns" element={<ProtectedTerminal><PatternsPage /></ProtectedTerminal>} />
          <Route path="/academy" element={<ProtectedTerminal><AcademyPage /></ProtectedTerminal>} />

          <Route path="/pricing" element={<ProtectedTerminal><Pricing /></ProtectedTerminal>} />
          <Route path="/alerts" element={<ProtectedTerminal><Alerts /></ProtectedTerminal>} />
          <Route path="/reports" element={<ProtectedTerminal><Reports /></ProtectedTerminal>} />

          <Route path="/discord" element={<DiscordRedirect />} />
          <Route path="/settings" element={<ProtectedTerminal><SettingsPage /></ProtectedTerminal>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}







