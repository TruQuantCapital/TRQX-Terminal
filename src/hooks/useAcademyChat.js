import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";

const API_BASE = "https://trqx-flow-scanner-production.up.railway.app";

export function useAcademyChat(lesson) {
  const { tier, getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const hasAccess = tier && tier !== "free";

  const sendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim()) return;

      setError(null);
      setMessages((prev) => [...prev, { role: "user", text }]);
      setSending(true);

      try {
        const token = await getToken();
        const res = await fetch(API_BASE + "/api/academy/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          body: JSON.stringify({
            message: text,
            lessonTitle: lesson && lesson.title,
            lessonObjective: lesson && lesson.objective,
            lessonSummary: lesson && lesson.content && lesson.content.find((b) => b.type === "p") ? lesson.content.find((b) => b.type === "p").text : null,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong. Try again.");
          setSending(false);
          return;
        }

        setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      } catch (e) {
        setError("Could not reach the tutor right now. Check your connection and try again.");
      } finally {
        setSending(false);
      }
    },
    [lesson, getToken]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, sendMessage, sending, error, hasAccess, clearChat };
}
