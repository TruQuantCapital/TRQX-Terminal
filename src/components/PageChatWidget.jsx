import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

export default function PageChatWidget({ context, placeholder }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setSending(true);
    try {
      const prompt = `You are TRQX AI, a professional trading assistant for TRQX Capital. ${context || ""}

User question: ${userMsg}

Answer concisely and professionally. Focus on trading, markets, and finance. Keep responses under 150 words.`;

      const res = await fetch(`${API}/api/market-intelligence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = res.ok ? await res.json() : {};
      setMessages(m => [...m, { role: "ai", text: data.reply || "Sorry, I couldn't process that. Please try again." }]);
    } catch {
      setMessages(m => [...m, { role: "ai", text: "Connection error. Please try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 1000,
          width: "56px", height: "56px", borderRadius: "50%",
          background: "linear-gradient(135deg, #d4af37, #f8bf31)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(212,175,55,0.4)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {open ? <X size={22} color="#000" /> : <MessageCircle size={22} color="#000" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: "92px", right: "24px", zIndex: 999,
          width: "360px", height: "480px",
          background: "#0b1420", border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: "16px", display: "flex", flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "10px", background: "rgba(212,175,55,0.08)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #d4af37, #f8bf31)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={16} color="#000" />
            </div>
            <div>
              <div style={{ color: "#d4af37", fontSize: "13px", fontWeight: "800" }}>TRQX AI</div>
              <div style={{ color: "#9ca3af", fontSize: "11px" }}>Ask me anything</div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.length === 0 && (
              <div style={{ color: "#9ca3af", fontSize: "13px", textAlign: "center", marginTop: "20px", lineHeight: "1.6" }}>
                {placeholder || "Ask me about what you're seeing on this page — I'm here to help you understand the data."}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "85%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: m.role === "user" ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${m.role === "user" ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: "#f5f1e8", fontSize: "13px", lineHeight: "1.5",
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af", fontSize: "13px" }}>
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "8px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "#f5f1e8", fontSize: "13px", outline: "none" }}
            />
            <button type="submit" disabled={!input.trim() || sending} style={{ background: input.trim() && !sending ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${input.trim() && !sending ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "8px", padding: "10px 14px", cursor: input.trim() && !sending ? "pointer" : "not-allowed", color: input.trim() && !sending ? "#d4af37" : "#6b7280" }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
