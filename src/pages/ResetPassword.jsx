import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function updatePassword(e) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully. Redirecting...");
    setTimeout(() => navigate("/auth"), 1200);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand-hero">
          <div className="auth-brand-name">TRQX</div>
          <div className="auth-brand-sub">RESET PASSWORD</div>
        </div>

        <form className="auth-form" onSubmit={updatePassword}>
          <div className="auth-field">
            <label className="auth-label">NEW PASSWORD</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">CONFIRM PASSWORD</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
              />
            </div>
          </div>

          {message && <div className="auth-error">{message}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}