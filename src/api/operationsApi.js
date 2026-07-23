const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export const OPERATIONS_API_BASE_URL = (
  import.meta.env.VITE_TRQX_OPERATIONS_API_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

const STATUS_MESSAGES = {
  400: "The request was invalid.",
  401: "Your session has expired. Sign in again.",
  403: "You are not authorized to use TRQX Operations.",
  404: "The requested Operations record was not found.",
  409: "The record conflicts with an existing Operations record.",
  422: "The submitted data did not pass validation.",
  429: "Too many requests were sent. Wait briefly and try again.",
  500: "The Operations API encountered an internal error.",
  502: "The Operations API is temporarily unavailable.",
  503: "The Operations API is temporarily unavailable.",
};

export class OperationsApiError extends Error {
  constructor(message, { status = 0, detail = null, data = null } = {}) {
    super(message);
    this.name = "OperationsApiError";
    this.status = status;
    this.detail = detail;
    this.data = data;
  }
}

function formatValidationDetail(detail) {
  if (!Array.isArray(detail)) return null;

  return detail
    .map((item) => {
      const location = Array.isArray(item?.loc)
        ? item.loc.filter((part) => part !== "body").join(".")
        : "";

      const message = item?.msg || "Invalid value";
      return location ? `${location}: ${message}` : message;
    })
    .filter(Boolean)
    .join(" | ");
}

function extractErrorMessage(status, data) {
  const detail = data && typeof data === "object" ? data.detail : null;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  const validationMessage = formatValidationDetail(detail);
  if (validationMessage) {
    return validationMessage;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return STATUS_MESSAGES[status] || `Request failed with HTTP ${status}.`;
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildUrl(path, query) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${OPERATIONS_API_BASE_URL}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export function createOperationsApi(getToken) {
  if (typeof getToken !== "function") {
    throw new TypeError("createOperationsApi requires a getToken function.");
  }

  async function request(
    path,
    {
      method = "GET",
      body,
      query,
      headers = {},
      signal,
      requireAuth = true,
    } = {},
  ) {
    let accessToken = null;

    if (requireAuth) {
      accessToken = await getToken();

      if (!accessToken) {
        throw new OperationsApiError(
          "No active Supabase session was found. Sign in again.",
          { status: 401 },
        );
      }
    }

    const requestHeaders = {
      Accept: "application/json",
      ...headers,
    };

    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }

    let requestBody = body;

    if (
      body !== undefined &&
      body !== null &&
      !(body instanceof FormData) &&
      typeof body !== "string"
    ) {
      requestHeaders["Content-Type"] =
        requestHeaders["Content-Type"] || "application/json";
      requestBody = JSON.stringify(body);
    } else if (typeof body === "string") {
      requestHeaders["Content-Type"] =
        requestHeaders["Content-Type"] || "application/json";
    }

    let response;

    try {
      response = await fetch(buildUrl(path, query), {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal,
      });
    } catch (error) {
      if (error?.name === "AbortError") throw error;

      throw new OperationsApiError(
        "Unable to reach the TRQX Operations API.",
        { detail: error?.message || null },
      );
    }

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new OperationsApiError(
        extractErrorMessage(response.status, data),
        {
          status: response.status,
          detail:
            data && typeof data === "object" ? data.detail ?? null : null,
          data,
        },
      );
    }

    return data;
  }

  return {
    request,

    getHealth: () =>
      request("/health", {
        requireAuth: false,
      }),

    getTradingDays: () => request("/trading-days"),

    getTradingDay: (tradingDayId) =>
      request(`/trading-days/${encodeURIComponent(tradingDayId)}`),

    createTradingDay: (payload) =>
      request("/trading-days", {
        method: "POST",
        body: payload,
      }),

    getPremarketLevels: (tradingDayId) =>
      request("/premarket-levels", {
        query: { trading_day_id: tradingDayId },
      }),

    getPremarketLevel: (levelId) =>
      request(`/premarket-levels/${encodeURIComponent(levelId)}`),

    createPremarketLevel: (payload) =>
      request("/premarket-levels", {
        method: "POST",
        body: payload,
      }),

    getTradeTickets: (tradingDayId) =>
      request("/trade-tickets", {
        query: { trading_day_id: tradingDayId },
      }),

    getTradeTicket: (ticketId) =>
      request(`/trade-tickets/${encodeURIComponent(ticketId)}`),

    createTradeTicket: (payload) =>
      request("/trade-tickets", {
        method: "POST",
        body: payload,
      }),

    getPublishingHistory: () => request("/api/publishing"),

    createPublishingRequest: (payload) =>
      request("/api/publishing", {
        method: "POST",
        body: payload,
      }),
  };
}
