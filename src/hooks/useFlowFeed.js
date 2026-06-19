import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./useAuth";

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:3001";
const MAX_ROWS = 500;

export function useFlowFeed() {
  const { getToken, tier } = useAuth();
  const [rows, setRows]       = useState([]);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused]   = useState(false);
  const wsRef  = useRef(null);
  const pausedRef = useRef(false);
  const bufRef = useRef([]);         // buffer rows while paused

  pausedRef.current = paused;

  const connect = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}/ws?token=${token}`);
    wsRef.current = ws;

    ws.onopen  = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, 4000);    // auto-reconnect
    };
    ws.onerror = () => ws.close();

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);

      if (msg.type === "history") {
        setRows(msg.rows ?? []);
        return;
      }

      if (msg.type === "flow") {
        const row = msg.row;
        if (pausedRef.current) {
          bufRef.current.unshift(row);
          if (bufRef.current.length > 200) bufRef.current.pop();
        } else {
          setRows(prev => {
            const next = [row, ...prev];
            if (next.length > MAX_ROWS) next.pop();
            return next;
          });
        }
      }
    };
  }, [getToken]);

  // Flush buffer when unpausing
  const togglePause = useCallback(() => {
    setPaused(p => {
      const next = !p;
      if (!next && bufRef.current.length) {
        setRows(prev => {
          const combined = [...bufRef.current, ...prev];
          bufRef.current = [];
          return combined.slice(0, MAX_ROWS);
        });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  // Derived stats from rows
  const stats = useCallback(() => {
    const calls   = rows.filter(r => r.type === "C");
    const puts    = rows.filter(r => r.type === "P");
    const callPrem = calls.reduce((a, r) => a + r.premium, 0);
    const putPrem  = puts.reduce((a, r) => a + r.premium, 0);
    const unusual  = rows.filter(r => r.tag === "unusual" || r.isGolden).length;
    return {
      total:    rows.length,
      callPrem,
      putPrem,
      ratio:    puts.length ? (calls.length / puts.length).toFixed(2) : "—",
      unusual,
    };
  }, [rows]);

  return { rows, connected, paused, togglePause, stats };
}
