import React, { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_TRQX_OPERATIONS_API_URL || "http://127.0.0.1:8000";

export default function OperationsPage() {
  const [apiStatus, setApiStatus] = useState({
    loading: true,
    online: false,
    message: "Checking TRQX Operations API...",
    version: null,
  });

  async function checkApiHealth() {
    setApiStatus({
      loading: true,
      online: false,
      message: "Checking TRQX Operations API...",
      version: null,
    });

    try {
      const response = await fetch(`${API_BASE_URL}/health`);

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
      }

      const data = await response.json();

      setApiStatus({
        loading: false,
        online: data.status === "ok",
        message:
          data.status === "ok"
            ? "TRQX Operations API is online."
            : "TRQX Operations API returned an unexpected status.",
        version: data.version || null,
      });
    } catch (error) {
      setApiStatus({
        loading: false,
        online: false,
        message: error instanceof Error ? error.message : "Unable to reach API.",
        version: null,
      });
    }
  }

  useEffect(() => {
    checkApiHealth();
  }, []);

  return (
    <main style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <section
        style={{
          border: "1px solid rgba(212,175,55,0.25)",
          background:
            "linear-gradient(145deg, rgba(13,17,23,0.98), rgba(20,24,31,0.96))",
          borderRadius: "18px",
          padding: "28px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
        }}
      >
        <div
          style={{
            color: "#d4af37",
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Owner Administration
        </div>

        <h1 style={{ margin: "8px 0 4px", fontSize: "32px" }}>
          TRQX Operations Center
        </h1>

        <p style={{ color: "#94a3b8", marginTop: 0 }}>
          Trading-floor control, market publishing and Discord operations.
        </p>

        <div
          style={{
            marginTop: "24px",
            padding: "18px",
            borderRadius: "14px",
            border: apiStatus.online
              ? "1px solid rgba(34,197,94,0.4)"
              : "1px solid rgba(239,68,68,0.4)",
            background: apiStatus.online
              ? "rgba(34,197,94,0.08)"
              : "rgba(239,68,68,0.08)",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: "16px" }}>
            {apiStatus.loading
              ? "?? API CHECK IN PROGRESS"
              : apiStatus.online
                ? "?? OPERATIONS API ONLINE"
                : "?? OPERATIONS API OFFLINE"}
          </div>

          <div style={{ marginTop: "7px", color: "#cbd5e1" }}>
            {apiStatus.message}
          </div>

          {apiStatus.version && (
            <div style={{ marginTop: "5px", color: "#94a3b8" }}>
              Version {apiStatus.version}
            </div>
          )}

          <button
            type="button"
            onClick={checkApiHealth}
            disabled={apiStatus.loading}
            style={{
              marginTop: "15px",
              padding: "10px 16px",
              borderRadius: "9px",
              border: "1px solid rgba(212,175,55,0.45)",
              background: "rgba(212,175,55,0.1)",
              color: "#f4d675",
              cursor: apiStatus.loading ? "not-allowed" : "pointer",
              fontWeight: 800,
            }}
          >
            Recheck Connection
          </button>
        </div>
      </section>
    </main>
  );
}
