import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Lock, Sparkles } from "lucide-react";
import { useAcademyChat } from "../hooks/useAcademyChat";

export default function AcademyChatWidget({ lesson }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, sending, error, hasAccess } = useAcademyChat(lesson);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, open]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    sendMessage(input);
    setInput("");
  }

  return (
    <div className="chatWidgetRoot">
      {open && (
        <div className="chatPanel">
          <div className="chatPanelHeader">
            <div className="chatPanelHeaderTitle">
              <Sparkles size={16} />
              <span>Academy Tutor</span>
            </div>
            <button className="chatPanelClose" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          {!hasAccess ? (
            <div className="chatLockedState">
              <Lock size={28} />
              <b>AI Tutor is a Starter+ feature</b>
              <p>Upgrade your plan to get instant help understanding any lesson, anytime you are stuck.</p>
              <a href="/pricing" className="goldBtn chatUpgradeBtn">
                View Plans
              </a>
            </div>
          ) : (
            <>
              <div className="chatMessages" ref={scrollRef}>
                {messages.length === 0 && (
                  <div className="chatEmptyState">
                    <Sparkles size={22} />
                    <p>
                      Ask me anything about <b>{(lesson && lesson.title) || "this lesson"}</b> - I am here to help it click.
                    </p>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} className={"chatBubble " + m.role}>
                    {m.text}
                  </div>
                ))}

                {sending && (
                  <div className="chatBubble assistant chatTyping">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}

                {error && <div className="chatErrorBubble">{error}</div>}
              </div>

              <form className="chatInputRow" onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this lesson..."
                  disabled={sending}
                />
                <button type="submit" disabled={!input.trim() || sending} aria-label="Send message">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        className="chatBubbleToggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close tutor chat" : "Open tutor chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
