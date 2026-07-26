const DEFAULT_API_PREFIX = "/api";

function trimTrailingSlash(value = "") {
  return String(value).replace(/\/+$/, "");
}

function normalizeBaseUrl(explicitBaseUrl) {
  const configured =
    explicitBaseUrl ||
    import.meta.env.VITE_OPERATIONS_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "";

  return trimTrailingSlash(configured);
}

function buildUrl(baseUrl, path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl) {
    return normalizedPath;
  }

  const baseEndsWithApi = /\/api$/i.test(baseUrl);
  const pathStartsWithApi = /^\/api(?:\/|$)/i.test(normalizedPath);

  if (baseEndsWithApi && pathStartsWithApi) {
    return `${baseUrl}${normalizedPath.slice(4)}`;
  }

  return `${baseUrl}${normalizedPath}`;
}

async function readResponseBody(response) {
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

function extractErrorMessage(payload, fallback) {
  if (!payload) return fallback;

  if (typeof payload === "string") return payload;

  if (typeof payload.detail === "string") return payload.detail;

  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => item?.msg || item?.message || JSON.stringify(item))
      .join("; ");
  }

  if (typeof payload.message === "string") return payload.message;

  if (typeof payload.error === "string") return payload.error;

  return fallback;
}

export class PublishingApiError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = "PublishingApiError";
    this.status = options.status ?? null;
    this.payload = options.payload ?? null;
    this.endpoint = options.endpoint ?? null;
  }
}

export function createPublishingService(getToken, options = {}) {
  if (typeof getToken !== "function") {
    throw new TypeError(
      "createPublishingService requires the Supabase getToken function."
    );
  }

  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const apiPrefix = trimTrailingSlash(
    options.apiPrefix || DEFAULT_API_PREFIX
  );

  async function request(path, requestOptions = {}) {
    const endpoint = buildUrl(baseUrl, `${apiPrefix}${path}`);

    const token = await getToken();

    const headers = new Headers(requestOptions.headers || {});

    headers.set("Accept", "application/json");

    const hasBody = requestOptions.body !== undefined;

    const isFormData =
      typeof FormData !== "undefined" &&
      requestOptions.body instanceof FormData;

    if (hasBody && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let response;

    try {
      response = await fetch(endpoint, {
        ...requestOptions,
        headers,
      });
    } catch (error) {
      throw new PublishingApiError(
        error?.message || "Unable to reach the TRQX Operations API.",
        {
          endpoint,
        }
      );
    }

    const payload = await readResponseBody(response);

    if (!response.ok) {
      throw new PublishingApiError(
        extractErrorMessage(
          payload,
          `Publishing API request failed with HTTP ${response.status}.`
        ),
        {
          status: response.status,
          payload,
          endpoint,
        }
      );
    }

    return payload;
  }

  function getPublishingHistory() {
    return request("/publishing", {
      method: "GET",
    });
  }

  function getPublishingRequest(id) {
    if (!id) {
      throw new TypeError("A publishing request ID is required.");
    }

    return request(`/publishing/${encodeURIComponent(id)}`, {
      method: "GET",
    });
  }

  function getSupportedDestinations() {
    return request("/publishing/destinations", {
      method: "GET",
    });
  }

  function rewritePublishingContent(payload) {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("A rewrite payload is required.");
    }

    return request("/publishing/rewrite", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  function createPublishingRequest(payload) {
    if (!payload || typeof payload !== "object") {
      throw new TypeError("A publishing payload is required.");
    }

    return request("/publishing", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /*
   * Future OAuth / Social API Methods
   */

  function getSocialConnections() {
    return request("/social/connections", {
      method: "GET",
    });
  }

  function connectPlatform(platform) {
    return request(`/social/connect/${platform}`, {
      method: "POST",
    });
  }

  function disconnectPlatform(platform) {
    return request(`/social/disconnect/${platform}`, {
      method: "DELETE",
    });
  }

  function getPublishingAnalytics() {
    return request("/publishing/analytics", {
      method: "GET",
    });
  }

  function getPublishingCalendar() {
    return request("/publishing/calendar", {
      method: "GET",
    });
  }

  return {
    getPublishingHistory,
    getPublishingRequest,
    getSupportedDestinations,
    rewritePublishingContent,
    createPublishingRequest,

    // Phase 2+
    getSocialConnections,
    connectPlatform,
    disconnectPlatform,
    getPublishingAnalytics,
    getPublishingCalendar,
  };
}

export default createPublishingService;