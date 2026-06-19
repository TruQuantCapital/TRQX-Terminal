import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Scanner from "./pages/Scanner";
import Pricing from "./pages/Pricing";
import Auth    from "./pages/Auth";
import Alerts  from "./pages/Alerts";
import Reports from "./pages/Reports";
import Welcome from "./pages/Welcome";
import "./app.css";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="loading-logo">⚡</div>
      <div className="loading-text">TRQX FLOW SCANNER</div>
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function Nav() {
  const { user, tier, signOut } = useAuth();
  const loc = useLocation();
  if (loc.pathname === "/auth" || loc.pathname === "/welcome") return null;
  const tierColors = {
    free: "#666",
    starter: "#C9A84C",
    pro: "#00d4ff",
    elite: "#FFD700",
  };
  return (
    <nav className="nav">
      <Link to="/scanner" className="nav-brand">
        <img
          src="https://thetrulies.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-7-2026-09_11_29-PM.png"
          alt="TRQX"
          style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
        />
        <div>
          <div className="nav-brand-text">TRQX</div>
          <div className="nav-brand-sub">FLOW SCANNER</div>
        </div>
      </Link>
      <div className="nav-links">
        <Link to="/scanner"  className={loc.pathname === "/scanner"  ? "active" : ""}>Scanner</Link>
        <Link to="/alerts"   className={loc.pathname === "/alerts"   ? "active" : ""}>Alerts</Link>
        <Link to="/reports"  className={loc.pathname === "/reports"  ? "active" : ""}>Reports</Link>
        <Link to="/pricing"  className={loc.pathname === "/pricing"  ? "active" : ""}>Pricing</Link>
      </div>
      <div className="nav-right">
        {user && (
          <span className="nav-tier" style={{ color: tierColors[tier] || "#C9A84C", borderColor: tierColors[tier] || "#C9A84C" }}>
            {tier.toUpperCase()}
          </span>
        )}
        {user && (
          <a
            href="https://whop.com/tqpx-tru-quant-enterprise"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn"
          >
            Manage Plan
          </a>
        )}
        {user
          ? <button className="nav-btn" onClick={signOut}>Sign out</button>
          : <Link to="/auth" className="nav-btn">Sign in</Link>
        }
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/auth"    element={<Auth />} />
          <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
          <Route path="/alerts"  element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="*"        element={<Navigate to="/scanner" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
