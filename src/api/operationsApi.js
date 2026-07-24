const DEFAULT_API_ORIGIN =
  "https://web-production-7fb554.up.railway.app";

const API_ORIGIN = (
  import.meta.env.VITE_TRQX_OPERATIONS_API_URL ||
  DEFAULT_API_ORIGIN
).replace(/\/+$/, "");

const STATUS_MESSAGES = {
  400: "The request was invalid.",
  401: "Your session is invalid or has expired. Sign in again.",
  403: "You are not authorized to access TRQX Operations.",
  404: "The requested TRQX Operations resource was not found.",
  409: "The requested record conflicts with an existing record.",
  422: "The submitted information could not be validated.",
  500: "The TRQX Operations API encountered an internal error.",
  502: "The TRQX Operations API is temporarily unavailable.",
  503: "The TRQX Operations API is temporarily unavailable.",
};

function buildUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
}

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function getErrorMessage(status, responseData) {
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    typeof responseData.detail === "string"
  ) {
    return responseData.detail;
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    typeof responseData.message === "string"
  ) {
    return responseData.message;
  }

  return (
    STATUS_MESSAGES[status] ||
    `Request failed with HTTP ${status}.`
  );
}

export function createOperationsApi(getToken) {
  async function apiRequest(
    path,
    {
      method = "GET",
      body,
      authenticated = true,
      headers = {},
    } = {},
  ) {
    const requestHeaders = {
      Accept: "application/json",
      ...headers,
    };

    if (body !== undefined && body !== null) {
      requestHeaders["Content-Type"] = "application/json";
    }

    if (authenticated) {
      const token = await getToken();

      if (!token) {
        throw new Error(
          "No active Supabase session was found. Sign in again.",
        );
      }

      requestHeaders.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
      response = await fetch(buildUrl(path), {
        method,
        headers: requestHeaders,
        body:
          body === undefined || body === null
            ? undefined
            : JSON.stringify(body),
      });
    } catch {
      throw new Error("Unable to reach the TRQX Operations API.");
    }

    const responseData = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(response.status, responseData),
      );
    }

    return responseData;
  }

  return {
    getHealth() {
      return apiRequest("/health", {
        authenticated: false,
      });
    },

    getTradingDays() {
      return apiRequest("/api/trading-days");
    },

    createTradingDay(payload) {
      return apiRequest("/api/trading-days", {
        method: "POST",
        body: payload,
      });
    },

    getTradeTickets(tradingDayId) {
      const query = new URLSearchParams();

      if (tradingDayId) {
        query.set("trading_day_id", tradingDayId);
      }

      const suffix = query.toString()
        ? `?${query.toString()}`
        : "";

      return apiRequest(`/api/trade-tickets${suffix}`);
    },

    createTradeTicket(payload) {
      return apiRequest("/api/trade-tickets", {
        method: "POST",
        body: payload,
      });
    },

    getPremarketLevels(tradingDayId) {
      const query = new URLSearchParams();

      if (tradingDayId) {
        query.set("trading_day_id", tradingDayId);
      }

      const suffix = query.toString()
        ? `?${query.toString()}`
        : "";

      return apiRequest(`/api/premarket-levels${suffix}`);
    },

    createPremarketLevel(payload) {
      return apiRequest("/api/premarket-levels", {
        method: "POST",
        body: payload,
      });
    },

    getPublishingHistory() {
      return apiRequest("/api/publishing");
    },

    createPublishingRequest(payload) {
      return apiRequest("/api/publishing", {
        method: "POST",
        body: payload,
      });
    },
  };
}