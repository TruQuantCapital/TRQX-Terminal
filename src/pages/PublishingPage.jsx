import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  ImagePlus,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  XCircle,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_TRQX_OPERATIONS_API_URL || "http://127.0.0.1:8000";

const DRAFT_STORAGE_KEY = "trqx-publishing-center-draft-v1";

const CONTENT_TYPES = [
  ["trade_ticket", "Trade Ticket"],
  ["trade_update", "Trade Update"],
  ["daily_prep", "Daily Prep"],
  ["market_news", "Market News"],
  ["economic_event", "Economic Event"],
  ["education", "Education"],
  ["announcement", "Announcement"],
  ["weekly_recap", "Weekly Recap"],
];

const DESTINATIONS = [
  ["discord", "Discord", true],
  ["website", "Website", false],
  ["facebook", "Facebook", false],
  ["x", "X", false],
  ["linkedin", "LinkedIn", false],
  ["instagram", "Instagram", false],
  ["threads", "Threads", false],
  ["tiktok", "TikTok", false],
  ["youtube", "YouTube", false],
  ["email", "Email", false],
  ["push", "Push", false],
];

function blankForm() {
  return {
    content_type: "announcement",
    title: "",
    body: "",
    ticker: "",
    destinations: ["discord"],
    image_url: "",
    image_name: "",
    scheduled_for: "",
    platform_overrides: {},
  };
}

function cardStyle(extra = {}) {
  return {
    padding: "20px",
    borderRadius: "15px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.025)",
    ...extra,
  };
}

function inputStyle() {
  return {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "9px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(4,8,14,0.8)",
    color: "#f8fafc",
    padding: "11px 12px",
    outline: "none",
  };
}

function labelStyle() {
  return {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: "7px",
  };
}

function buttonStyle(primary = false) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 16px",
    borderRadius: "9px",
    border: primary
      ? "1px solid rgba(212,175,55,0.7)"
      : "1px solid rgba(255,255,255,0.14)",
    background: primary
      ? "linear-gradient(135deg, rgba(212,175,55,0.28), rgba(212,175,55,0.1))"
      : "rgba(255,255,255,0.05)",
    color: primary ? "#f4d675" : "#e2e8f0",
    fontWeight: 900,
    cursor: "pointer",
  };
}

function statusColor(status) {
  if (status === "published") return "#86efac";
  if (status === "partial") return "#f4d675";
  if (status === "queued" || status === "processing") return "#93c5fd";
  if (status === "failed") return "#fca5a5";
  return "#cbd5e1";
}

function destinationLabel(value) {
  return DESTINATIONS.find(([key]) => key === value)?.[1] || value;
}

export default function PublishingPage() {
  const [activeTab, setActiveTab] = useState("composer");
  const [form, setForm] = useState(blankForm);
  const [history, setHistory] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState("discord");
  const [notice, setNotice] = useState("");
  const [working, setWorking] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const imageInputRef = useRef(null);

  const selectedDestinationData = useMemo(
    () => DESTINATIONS.filter(([key]) => form.destinations.includes(key)),
    [form.destinations],
  );

  const previewBody =
    form.platform_overrides[selectedPreview] || form.body || "Your post preview will appear here.";

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const detail =
        typeof data === "object" && data?.detail
          ? JSON.stringify(data.detail)
          : `Request failed with HTTP ${response.status}`;
      throw new Error(detail);
    }

    return data;
  }

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const data = await apiRequest("/api/publishing");
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice(`Unable to load publishing history: ${error.message}`);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadHistory();

    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm({ ...blankForm(), ...parsed });
      }
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!form.destinations.includes(selectedPreview)) {
      setSelectedPreview(form.destinations[0] || "discord");
    }
  }, [form.destinations, selectedPreview]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleDestination(destination) {
    setForm((current) => {
      const exists = current.destinations.includes(destination);
      const destinations = exists
        ? current.destinations.filter((item) => item !== destination)
        : [...current.destinations, destination];

      return { ...current, destinations };
    });
  }

  function setPlatformOverride(destination, value) {
    setForm((current) => ({
      ...current,
      platform_overrides: {
        ...current.platform_overrides,
        [destination]: value,
      },
    }));
  }

  function processImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("The attachment must be an image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice("The image must be 5 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        image_url: String(reader.result || ""),
        image_name: file.name || "Pasted image",
      }));
      setNotice("Publishing image attached.");
    };
    reader.onerror = () => setNotice("Unable to read the selected image.");
    reader.readAsDataURL(file);
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
    setNotice("Draft saved in this browser.");
  }

  function resetComposer() {
    setForm(blankForm());
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setNotice("Composer reset.");
  }

  async function publish(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.body.trim()) {
      setNotice("Title and body are required.");
      return;
    }

    if (form.destinations.length === 0) {
      setNotice("Select at least one destination.");
      return;
    }

    setWorking(true);
    setNotice("");

    try {
      const payload = {
        content_type: form.content_type,
        title: form.title.trim(),
        body: form.body.trim(),
        destinations: form.destinations,
        image_url: form.image_url || null,
        ticker: form.ticker.trim().toUpperCase() || null,
        scheduled_for: form.scheduled_for
          ? new Date(form.scheduled_for).toISOString()
          : null,
      };

      const created = await apiRequest("/api/publishing", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setHistory((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setNotice(
        created.status === "published"
          ? "Content published successfully."
          : `Publishing request completed with status: ${created.status}.`,
      );
      setActiveTab("history");
    } catch (error) {
      setNotice(`Publishing failed: ${error.message}`);
    } finally {
      setWorking(false);
    }
  }

  return (
    <main style={{ padding: "24px", maxWidth: "1500px", margin: "0 auto" }}>
      <section
        style={{
          border: "1px solid rgba(212,175,55,0.25)",
          background: "linear-gradient(145deg, rgba(13,17,23,0.98), rgba(20,24,31,0.96))",
          borderRadius: "18px",
          padding: "28px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
        }}
      >
        <div style={{ color: "#d4af37", fontSize: "12px", fontWeight: 900, letterSpacing: "0.18em" }}>
          OWNER ADMINISTRATION
        </div>
        <h1 style={{ margin: "8px 0 4px", fontSize: "32px" }}>TRQX Publishing Center</h1>
        <p style={{ color: "#94a3b8", marginTop: 0 }}>
          Create once, preview by platform, schedule and distribute through the TRQX publishing engine.
        </p>

        {notice && (
          <div style={{ marginTop: "18px", padding: "13px 15px", borderRadius: "10px", border: "1px solid rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.07)", color: "#f4d675" }}>
            {notice}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setActiveTab("composer")} style={buttonStyle(activeTab === "composer")}>
            <FileText size={17} /> Composer
          </button>
          <button type="button" onClick={() => { setActiveTab("history"); loadHistory(); }} style={buttonStyle(activeTab === "history")}>
            <Clock3 size={17} /> History
          </button>
        </div>

        {activeTab === "composer" ? (
          <form onSubmit={publish}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)", gap: "20px", marginTop: "20px" }}>
              <section style={cardStyle()}>
                <div style={{ color: "#d4af37", fontWeight: 900 }}>CONTENT COMPOSER</div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "13px", marginTop: "16px" }}>
                  <div>
                    <label style={labelStyle()}>Content Type</label>
                    <select value={form.content_type} onChange={(event) => updateForm("content_type", event.target.value)} style={inputStyle()}>
                      {CONTENT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle()}>Ticker — optional</label>
                    <input value={form.ticker} maxLength={12} onChange={(event) => updateForm("ticker", event.target.value.toUpperCase())} placeholder="SPY" style={inputStyle()} />
                  </div>
                </div>

                <div style={{ marginTop: "13px" }}>
                  <label style={labelStyle()}>Title</label>
                  <input value={form.title} maxLength={160} onChange={(event) => updateForm("title", event.target.value)} placeholder="TRQX Market Update" style={inputStyle()} />
                </div>

                <div style={{ marginTop: "13px" }}>
                  <label style={labelStyle()}>Master Post</label>
                  <textarea value={form.body} maxLength={10000} rows={10} onChange={(event) => updateForm("body", event.target.value)} placeholder="Write the full master version of the post..." style={{ ...inputStyle(), resize: "vertical" }} />
                  <div style={{ textAlign: "right", color: "#64748b", fontSize: "12px", marginTop: "5px" }}>{form.body.length}/10000</div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label style={labelStyle()}>Publishing Image</label>
                  <div
                    tabIndex={0}
                    onPaste={(event) => {
                      const item = Array.from(event.clipboardData?.items || []).find((entry) => entry.type.startsWith("image/"));
                      if (item) { event.preventDefault(); processImage(item.getAsFile()); }
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => { event.preventDefault(); processImage(event.dataTransfer?.files?.[0]); }}
                    onClick={() => imageInputRef.current?.click()}
                    style={{ minHeight: form.image_url ? "220px" : "135px", borderRadius: "12px", border: "1px dashed rgba(212,175,55,0.5)", background: "rgba(212,175,55,0.04)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer" }}
                  >
                    {form.image_url ? (
                      <img src={form.image_url} alt="Publishing preview" style={{ width: "100%", maxHeight: "440px", objectFit: "contain" }} />
                    ) : (
                      <div style={{ textAlign: "center", color: "#94a3b8", padding: "22px" }}>
                        <ImagePlus size={30} style={{ marginBottom: "8px" }} />
                        <div style={{ color: "#f4d675", fontWeight: 900 }}>Paste, drop or select an image</div>
                        <div style={{ marginTop: "5px", fontSize: "12px" }}>Maximum 5 MB</div>
                      </div>
                    )}
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*" onChange={(event) => processImage(event.target.files?.[0])} style={{ display: "none" }} />
                  {form.image_url && (
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "10px", alignItems: "center" }}>
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>{form.image_name}</span>
                      <button type="button" onClick={() => setForm((current) => ({ ...current, image_url: "", image_name: "" }))} style={buttonStyle()}>Remove</button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label style={labelStyle()}>Schedule — optional</label>
                  <input type="datetime-local" value={form.scheduled_for} onChange={(event) => updateForm("scheduled_for", event.target.value)} style={inputStyle()} />
                </div>
              </section>

              <section style={{ display: "grid", gap: "20px", alignContent: "start" }}>
                <div style={cardStyle()}>
                  <div style={{ color: "#d4af37", fontWeight: 900 }}>DESTINATIONS</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "15px" }}>
                    {DESTINATIONS.map(([value, label, connected]) => {
                      const selected = form.destinations.includes(value);
                      return (
                        <button key={value} type="button" onClick={() => toggleDestination(value)} style={{ ...buttonStyle(selected), justifyContent: "space-between", textAlign: "left" }}>
                          <span>{label}</span>
                          <span style={{ fontSize: "10px", color: connected ? "#86efac" : "#94a3b8" }}>{connected ? "READY" : "PLANNED"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={cardStyle()}>
                  <div style={{ color: "#d4af37", fontWeight: 900 }}>PLATFORM PREVIEW</div>
                  {form.destinations.length === 0 ? (
                    <div style={{ color: "#64748b", marginTop: "15px" }}>Select a destination to preview.</div>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px" }}>
                        {selectedDestinationData.map(([value, label]) => (
                          <button key={value} type="button" onClick={() => setSelectedPreview(value)} style={buttonStyle(selectedPreview === value)}>{label}</button>
                        ))}
                      </div>

                      <div style={{ marginTop: "14px", borderRadius: "13px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(2,6,12,0.72)", overflow: "hidden" }}>
                        {form.image_url && <img src={form.image_url} alt="Platform preview" style={{ width: "100%", maxHeight: "250px", objectFit: "cover" }} />}
                        <div style={{ padding: "16px" }}>
                          <div style={{ color: "#f4d675", fontWeight: 950, fontSize: "18px" }}>{form.title || "Untitled TRQX Post"}</div>
                          {form.ticker && <div style={{ color: "#94a3b8", marginTop: "4px" }}>${form.ticker}</div>}
                          <div style={{ color: "#cbd5e1", marginTop: "12px", whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{previewBody}</div>
                          <div style={{ color: "#64748b", fontSize: "11px", marginTop: "14px" }}>Educational purposes only. Not financial advice.</div>
                        </div>
                      </div>

                      <div style={{ marginTop: "14px" }}>
                        <label style={labelStyle()}>{destinationLabel(selectedPreview)} Caption Override</label>
                        <textarea
                          value={form.platform_overrides[selectedPreview] || ""}
                          onChange={(event) => setPlatformOverride(selectedPreview, event.target.value)}
                          placeholder="Leave blank to use the master post."
                          rows={5}
                          style={{ ...inputStyle(), resize: "vertical" }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
              <button type="button" onClick={resetComposer} style={buttonStyle()}><RotateCcw size={17} /> Reset</button>
              <button type="button" onClick={saveDraft} style={buttonStyle()}><Save size={17} /> Save Draft</button>
              <button type="submit" disabled={working} style={{ ...buttonStyle(true), opacity: working ? 0.55 : 1 }}>
                {form.scheduled_for ? <CalendarClock size={17} /> : <Send size={17} />}
                {working ? "Processing..." : form.scheduled_for ? "Schedule Publish" : "Publish Now"}
              </button>
            </div>
          </form>
        ) : (
          <section style={{ ...cardStyle(), marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
              <div>
                <div style={{ color: "#d4af37", fontWeight: 900 }}>PUBLISHING HISTORY</div>
                <div style={{ color: "#94a3b8", marginTop: "4px" }}>Requests returned by the Operations API.</div>
              </div>
              <button type="button" onClick={loadHistory} style={buttonStyle()} disabled={loadingHistory}><RefreshCw size={17} /> Refresh</button>
            </div>

            {history.length === 0 ? (
              <div style={{ marginTop: "18px", padding: "28px", textAlign: "center", color: "#64748b", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px" }}>
                No publishing requests yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
                {history.map((item) => (
                  <article key={item.id} style={cardStyle()}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "15px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ color: "#f4d675", fontWeight: 950, fontSize: "18px" }}>{item.title}</div>
                        <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px", textTransform: "uppercase" }}>
                          {item.content_type?.replaceAll("_", " ")} {item.ticker ? `· $${item.ticker}` : ""}
                        </div>
                      </div>
                      <div style={{ color: statusColor(item.status), fontWeight: 900, textTransform: "uppercase" }}>{item.status}</div>
                    </div>

                    <div style={{ color: "#cbd5e1", whiteSpace: "pre-wrap", marginTop: "14px" }}>{item.body}</div>
                    <div style={{ color: "#64748b", fontSize: "12px", marginTop: "12px" }}>
                      Created {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
                      {item.scheduled_for ? ` · Scheduled ${new Date(item.scheduled_for).toLocaleString()}` : ""}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "14px" }}>
                      {(item.results || []).map((result) => (
                        <div key={`${item.id}-${result.destination}`} style={{ padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 900 }}>
                            {result.success ? <CheckCircle2 size={16} color="#86efac" /> : <XCircle size={16} color="#fca5a5" />}
                            {destinationLabel(result.destination)}
                          </div>
                          {result.error && <div style={{ color: "#fca5a5", fontSize: "12px", marginTop: "7px" }}>{result.error}</div>}
                          {result.external_id && <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "7px" }}>ID: {result.external_id}</div>}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}