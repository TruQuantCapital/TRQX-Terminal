import React, { useState } from "react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

const GOLD = "#d4af37";
const GREEN = "#22c55e";
const RED = "#ef4444";
const MUTED = "#9ca3af";
const TEXT = "#f5f1e8";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.08)";

export default function AssignmentGrader({ lesson }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!answer.trim() || answer.trim().length < 20) {
      setError("Please write a more complete answer before submitting.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const prompt = `You are a trading educator at TRQX Capital grading a student assignment.

Lesson: "${lesson.title}"
Lesson Objective: ${lesson.objective || "Understand the key concepts of this lesson."}

Student's Answer:
"${answer.trim()}"

Grade this assignment and respond in this exact format:

SCORE: [number 1-10]
VERDICT: [Pass or Needs Review]
WHAT YOU GOT RIGHT: [2-3 specific things the student demonstrated understanding of]
WHAT TO IMPROVE: [1-2 specific areas to study more]
FEEDBACK: [2-3 sentences of encouraging, specific feedback referencing their actual answer]

Be fair but honest. A score of 7+ is a Pass. Be encouraging but accurate.`;

    try {
      const res = await fetch(`${API}/api/market-intelligence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed to grade assignment");
      const data = await res.json();
      const text = data.reply || "";
      
      // Parse the response
      const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
      const verdictMatch = text.match(/VERDICT:\s*(Pass|Needs Review)/i);
      const rightMatch = text.match(/WHAT YOU GOT RIGHT:\s*([^\n]+(?:\n(?!WHAT TO|FEEDBACK)[^\n]+)*)/i);
      const improveMatch = text.match(/WHAT TO IMPROVE:\s*([^\n]+(?:\n(?!FEEDBACK)[^\n]+)*)/i);
      const feedbackMatch = text.match(/FEEDBACK:\s*([^\n]+(?:\n[^\n]+)*)/i);

      setResult({
        score: scoreMatch ? parseInt(scoreMatch[1]) : null,
        verdict: verdictMatch ? verdictMatch[1] : null,
        right: rightMatch ? rightMatch[1].trim() : null,
        improve: improveMatch ? improveMatch[1].trim() : null,
        feedback: feedbackMatch ? feedbackMatch[1].trim() : text,
      });
    } catch (e) {
      setError("Failed to grade assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const verdictColor = result?.verdict === "Pass" ? GREEN : RED;
  const scoreColor = result?.score >= 7 ? GREEN : result?.score >= 5 ? GOLD : RED;

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "24px", margin: "20px 0" }}>
      <div style={{ color: GOLD, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>
        Submit Your Assignment
      </div>

      {!result ? (
        <>
          <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
            Write your answer below based on what you learned in this lesson. Your response will be graded by the TRQX AI with detailed feedback.
          </p>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder={`Demonstrate your understanding of "${lesson.title}" — explain the key concepts, give examples, and show how you would apply this in trading...`}
            rows={6}
            style={{
              width: "100%", background: "rgba(255,255,255,0.05)",
              border: `1px solid ${answer.length > 50 ? GOLD : BORDER}`,
              borderRadius: "10px", padding: "14px 16px",
              color: TEXT, fontSize: "14px", lineHeight: "1.6",
              resize: "vertical", outline: "none", fontFamily: "inherit",
              boxSizing: "border-box", marginBottom: "12px",
              transition: "border-color 0.2s",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: MUTED, fontSize: "12px" }}>
              {answer.length < 20 ? "Write at least a few sentences" : `${answer.length} characters`}
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || answer.trim().length < 20}
              style={{
                background: loading || answer.trim().length < 20 ? "rgba(255,255,255,0.05)" : `rgba(212,175,55,0.15)`,
                border: `1px solid ${loading || answer.trim().length < 20 ? BORDER : "rgba(212,175,55,0.4)"}`,
                borderRadius: "10px", padding: "12px 28px",
                color: loading || answer.trim().length < 20 ? MUTED : GOLD,
                fontSize: "14px", fontWeight: "800", cursor: loading || answer.trim().length < 20 ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Grading..." : "Submit for AI Grading"}
            </button>
          </div>
          {error && <p style={{ color: RED, fontSize: "13px", marginTop: "10px" }}>{error}</p>}
        </>
      ) : (
        <div>
          {/* Score + Verdict */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px", padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: `1px solid ${verdictColor}40` }}>
            <div style={{ textAlign: "center", minWidth: "80px" }}>
              <div style={{ color: scoreColor, fontSize: "48px", fontWeight: "900", lineHeight: 1 }}>{result.score}</div>
              <div style={{ color: MUTED, fontSize: "12px", fontWeight: "700" }}>/10</div>
            </div>
            <div>
              <div style={{ color: verdictColor, fontSize: "22px", fontWeight: "900", marginBottom: "4px" }}>
                {result.verdict === "Pass" ? "✓ PASSED" : "↻ NEEDS REVIEW"}
              </div>
              <div style={{ color: MUTED, fontSize: "13px" }}>
                {result.verdict === "Pass" ? "Great work! You demonstrated solid understanding." : "Review the lesson and try again to strengthen your understanding."}
              </div>
            </div>
          </div>

          {/* Feedback sections */}
          {result.right && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ color: GREEN, fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>What You Got Right</div>
              <p style={{ color: TEXT, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{result.right}</p>
            </div>
          )}
          {result.improve && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ color: GOLD, fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>What To Improve</div>
              <p style={{ color: TEXT, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{result.improve}</p>
            </div>
          )}
          {result.feedback && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ color: MUTED, fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Instructor Feedback</div>
              <p style={{ color: TEXT, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{result.feedback}</p>
            </div>
          )}

          {/* Try again */}
          <button
            onClick={() => { setResult(null); setAnswer(""); }}
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "10px 20px", color: MUTED, fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
