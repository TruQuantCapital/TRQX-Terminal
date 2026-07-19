import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Sidebar from "./components/Sidebar";
import TawkIdentity from "./components/TawkIdentity";
import TopRibbon from "./components/TopRibbon";
import MorningCoach from "./components/MorningCoach";
import TickerTape from "./components/TickerTape";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import DividendPage from "./pages/DividendPage";
import GammaPage from "./pages/GammaPage";
import LandingPage from "./pages/LandingPage";
import NewsPage from "./pages/NewsPage";
import OptionsPage from "./pages/OptionsPage";
import TradePlanPage from "./pages/TradePlanPage";
import CapitalAllocatorPage from "./pages/CapitalAllocatorPage";
import EconomicCalendarPage from "./pages/EconomicCalendarPage";
import AcademyPage from "./pages/AcademyPage";
import ResearchPage from "./pages/ResearchPage";
import PatternsPage from "./pages/PatternsPage";
import Auth from "./pages/Auth";
import GuidePage from "./pages/GuidePage";
import Pricing from "./pages/Pricing";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Welcome from "./pages/Welcome";
import ResetPassword from "./pages/ResetPassword";
import SettingsPage from "./pages/SettingsPage";
import OperationsPage from "./pages/OperationsPage";
import MentorshipPage from "./pages/MentorshipPage";
import EliteCommandCenter from "./pages/EliteCommandCenter";
import WidgetLab from "./pages/WidgetLab";
import "./styles.css";
import "./app.css";

const routeByKey = {
  dashboard: "/dashboard",
  operations: "/operations",
  scanner: "/scanner",
  options: "/options-flow",
  dividends: "/dividends",
  tradeplan: "/trade-plan",
  "capital-allocator": "/capital-allocator",
  gamma: "/gamma-ex",
  calendar: "/economic-calendar",
  alerts: "/alerts",
  academy: "/academy",
  research: "/research",
  patterns: "/patterns",
  guide: "/guide",
  mentorship: "/mentorship",
  elite: "/elite",
  discord: "/discord",
  news: "/news",
  settings: "/settings",
};

const keyByPath = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/operations": "operations",
  "/mentorship": "mentorship",
  "/scanner": "scanner",
  "/elite": "elite",
  "/options-flow": "options",
  "/trade-plan": "tradeplan",
  "/capital-allocator": "capital-allocator",
  "/gamma-ex": "gamma",
  "/economic-calendar": "calendar",
  "/alerts": "alerts",
  "/academy": "academy",
  "/research": "research",
  "/patterns": "patterns",
  "/guide": "guide",
  "/discord": "discord",
  "/news": "news",
  "/settings": "settings",
  "/pricing": "settings",
  "/reports": "news",
  "/dividends": "dividends",
};
const OPERATIONS_OWNER_EMAIL = "michaelvalerio@thetrulies.com";

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

function OwnerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  const signedInEmail = user.email?.trim().toLowerCase();
  const ownerEmail = OPERATIONS_OWNER_EMAIL.trim().toLowerCase();

  if (signedInEmail !== ownerEmail) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function TerminalLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, tier, signOut, canAccess } = useAuth();
  const active = keyByPath[location.pathname] || "dashboard";

  const setActive = (key) => {
    const next = routeByKey[key] || "/dashboard";
    navigate(next);
  };

  return (
    <div className="app">
      <MorningCoach />
      <Sidebar active={active} setActive={setActive} user={user} tier={tier} canAccess={canAccess} />
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
function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}
export default function App() {
  return (
    <AuthProvider>
  <TawkIdentity />
  <BrowserRouter>
        <Routes>

          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/research"
            element={
              <ProtectedTerminal>
                <ResearchPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/dividends"
            element={
              <ProtectedTerminal>
                <DividendPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/welcome"
            element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            }
          />

          <Route path="/home" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/" element={<PublicRoute />} />
          


          <Route
            path="/dashboard"
            element={
              <ProtectedTerminal>
                <Dashboard />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/scanner"
            element={
              <ProtectedTerminal>
                <Scanner />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/options-flow"
            element={
              <ProtectedTerminal>
                <OptionsPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/trade-plan"
            element={
              <ProtectedTerminal>
                <TradePlanPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/capital-allocator"
            element={
              <ProtectedTerminal>
                <CapitalAllocatorPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/gamma-ex"
            element={
              <ProtectedTerminal>
                <GammaPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/economic-calendar"
            element={
              <ProtectedTerminal>
                <EconomicCalendarPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/news"
            element={
              <ProtectedTerminal>
                <NewsPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/patterns"
            element={
              <ProtectedTerminal>
                <PatternsPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/academy"
            element={
              <ProtectedTerminal>
                <AcademyPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/mentorship"
            element={
              <ProtectedTerminal>
                <MentorshipPage />
              </ProtectedTerminal>
            }
          />

          <Route
  path="/elite"
  element={
    <ProtectedTerminal>
      <EliteCommandCenter />
    </ProtectedTerminal>
  }
/>

          <Route
            path="/guide"
            element={
              <ProtectedTerminal>
                <GuidePage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/pricing"
            element={
              <ProtectedTerminal>
                <Pricing />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedTerminal>
                <Alerts />
              </ProtectedTerminal>
            }
          />

<Route
  path="/widget-lab"
  element={
    <OwnerRoute>
      <WidgetLab />
    </OwnerRoute>
  }
/>

          <Route
            path="/reports"
            element={
              <ProtectedTerminal>
                <Reports />
              </ProtectedTerminal>
            }
          />

          <Route path="/discord" element={<DiscordRedirect />} />

          <Route
            path="/settings"
            element={
              <ProtectedTerminal>
                <SettingsPage />
              </ProtectedTerminal>
            }
          />

          <Route
            path="/operations"
            element={
              <OwnerRoute>
                <TerminalLayout>
                  <OperationsPage />
                </TerminalLayout>
              </OwnerRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}