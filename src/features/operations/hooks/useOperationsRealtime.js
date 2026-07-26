import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";

const FALLBACK_POLL_MS = 15000;

export default function useOperationsRealtime({
  tradingDayId,
  enabled,
  onTradingDayChange,
  onSessionDataChange,
}) {
  const callbacksRef = useRef({
    onTradingDayChange,
    onSessionDataChange,
  });
  const refreshInFlightRef = useRef(false);
  const [status, setStatus] = useState("connecting");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  useEffect(() => {
    callbacksRef.current = {
      onTradingDayChange,
      onSessionDataChange,
    };
  }, [onTradingDayChange, onSessionDataChange]);

  useEffect(() => {
    if (!enabled) {
      setStatus("paused");
      return undefined;
    }

    let disposed = false;
    let pollTimer = null;

    async function runRefresh(kind = "session") {
      if (disposed || refreshInFlightRef.current) return;

      refreshInFlightRef.current = true;

      try {
        if (kind === "trading-day") {
          await callbacksRef.current.onTradingDayChange?.();
        } else {
          await callbacksRef.current.onSessionDataChange?.();
        }

        if (!disposed) {
          setLastSyncedAt(new Date());
        }
      } finally {
        refreshInFlightRef.current = false;
      }
    }

    const channel = supabase
      .channel(`trqx-operations-${tradingDayId || "today"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trqx_trading_days",
        },
        () => runRefresh("trading-day"),
      );

    if (tradingDayId) {
      channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "trqx_trade_tickets",
            filter: `trading_day_id=eq.${tradingDayId}`,
          },
          () => runRefresh("session"),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "trqx_premarket_levels",
            filter: `trading_day_id=eq.${tradingDayId}`,
          },
          () => runRefresh("session"),
        );
    }

    channel.subscribe((subscriptionStatus) => {
      if (disposed) return;

      if (subscriptionStatus === "SUBSCRIBED") {
        setStatus("live");
      } else if (
        subscriptionStatus === "CHANNEL_ERROR" ||
        subscriptionStatus === "TIMED_OUT"
      ) {
        setStatus("polling");
      } else if (subscriptionStatus === "CLOSED") {
        setStatus("polling");
      }
    });

    const poll = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        runRefresh("session");
      }
    };

    pollTimer = window.setInterval(poll, FALLBACK_POLL_MS);

    const handleFocus = () => runRefresh("session");
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        runRefresh("session");
      }
    };
    const handleOnline = () => {
      setStatus((current) => (current === "live" ? current : "polling"));
      runRefresh("session");
    };
    const handleOffline = () => setStatus("offline");

    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disposed = true;
      if (pollTimer) window.clearInterval(pollTimer);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      supabase.removeChannel(channel);
    };
  }, [enabled, tradingDayId]);

  return {
    status,
    lastSyncedAt,
  };
}
