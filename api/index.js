const DEFAULT_BASE_URL = "/api";

class LiffApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "LiffApiError";
    this.code = options.code;
    this.status = options.status;
    this.method = options.method;
    this.url = options.url;
    this.payload = options.payload;
    this.cause = options.cause;
  }
}

function normalizeBaseUrl(baseUrl = DEFAULT_BASE_URL) {
  const normalized = String(baseUrl || DEFAULT_BASE_URL).trim();

  if (!normalized) {
    return DEFAULT_BASE_URL;
  }

  return normalized.replace(/\/+$/, "");
}

function joinUrl(baseUrl, path) {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${normalizeBaseUrl(baseUrl)}${normalizedPath}`;
}

function appendQueryParams(url, query) {
  if (!query) {
    return url;
  }

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

function requireValue(name, value) {
  if (value === undefined || value === null || value === "") {
    throw new TypeError(`${name} is required`);
  }

  return value;
}

function isApiFailure(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (
    typeof payload.status === "string" &&
    payload.status.toLowerCase() === "faile"
  ) {
    return true;
  }

  if (typeof payload.code === "number" && payload.code >= 400) {
    return true;
  }

  return false;
}

async function parseJsonResponse(response, requestMeta) {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new LiffApiError("Failed to parse API response as JSON", {
      ...requestMeta,
      status: response.status,
      cause: error,
    });
  }
}

async function requestJson(config, options = {}) {
  const {
    baseUrl = DEFAULT_BASE_URL,
    fetchImpl = fetch,
    defaultHeaders = {},
  } = config;
  const { path, method = "GET", query, body, headers, signal } = options;

  const url = appendQueryParams(
    joinUrl(baseUrl, requireValue("path", path)),
    query,
  );
  const requestMeta = { method, url };
  const requestHeaders = {
    ...defaultHeaders,
    ...headers,
  };
  const fetchOptions = {
    method,
    headers: requestHeaders,
    signal,
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);

    if (
      !Object.keys(requestHeaders).some(
        (key) => key.toLowerCase() === "content-type",
      )
    ) {
      requestHeaders["Content-Type"] = "application/json";
    }
  }

  let response;

  try {
    response = await fetchImpl(url, fetchOptions);
  } catch (error) {
    throw new LiffApiError("Network request failed", {
      ...requestMeta,
      cause: error,
    });
  }

  const payload = await parseJsonResponse(response, requestMeta);

  if (!response.ok) {
    throw new LiffApiError(
      payload?.error_message || `Request failed with status ${response.status}`,
      {
        ...requestMeta,
        code: payload?.code ?? response.status,
        status: response.status,
        payload,
      },
    );
  }

  if (isApiFailure(payload)) {
    throw new LiffApiError(
      payload.error_message || "API returned a failure response",
      {
        ...requestMeta,
        code: payload.code,
        status: response.status,
        payload,
      },
    );
  }

  return payload;
}

export function createLiffApi(options = {}) {
  const config = {
    baseUrl: options.baseUrl,
    fetchImpl: options.fetchImpl,
    defaultHeaders: options.defaultHeaders,
  };

  return {
    checkUser(lineUserId, requestOptions = {}) {
      return requestJson(config, {
        ...requestOptions,
        method: "GET",
        path: `/liff/user_check/${encodeURIComponent(requireValue("lineUserId", lineUserId))}`,
      });
    },

    createLineUser(payload, requestOptions = {}) {
      requireValue("payload", payload);

      return requestJson(config, {
        ...requestOptions,
        method: "POST",
        path: "/liff/line_users",
        body: payload,
      });
    },

    getProducts(lineUserId, params = {}, requestOptions = {}) {
      const { customerId, divisionId, categoryId, page, pageSize } = params;

      requireValue("customerId", customerId);
      requireValue("divisionId", divisionId);

      return requestJson(config, {
        ...requestOptions,
        method: "GET",
        path: `/liff/${encodeURIComponent(requireValue("lineUserId", lineUserId))}/products`,
        query: {
          customer_id: customerId,
          division_id: divisionId,
          category_id: categoryId,
          page,
          pageSize,
        },
      });
    },

    createOrder(lineUserId, payload, requestOptions = {}) {
      requireValue("payload", payload);

      return requestJson(config, {
        ...requestOptions,
        method: "POST",
        path: `/liff/${encodeURIComponent(requireValue("lineUserId", lineUserId))}/orders`,
        body: payload,
      });
    },

    updateOrder(lineUserId, number, payload, requestOptions = {}) {
      requireValue("number", number);
      requireValue("payload", payload);

      return requestJson(config, {
        ...requestOptions,
        method: "PATCH",
        path: `/liff/${encodeURIComponent(requireValue("lineUserId", lineUserId))}/orders/${encodeURIComponent(number)}`,
        body: payload,
      });
    },

    listOrders(lineUserId, params = {}, requestOptions = {}) {
      const { page, pageSize } = params;

      return requestJson(config, {
        ...requestOptions,
        method: "GET",
        path: `/liff/${encodeURIComponent(requireValue("lineUserId", lineUserId))}/orders`,
        query: {
          page,
          pageSize,
        },
      });
    },

    getOrderDetail(lineUserId, number, requestOptions = {}) {
      requireValue("number", number);

      return requestJson(config, {
        ...requestOptions,
        method: "GET",
        path: `/liff/${encodeURIComponent(requireValue("lineUserId", lineUserId))}/orders/${encodeURIComponent(number)}`,
      });
    },
  };
}

export { LiffApiError };

export const liffApi = createLiffApi();

export const checkUser = (...args) => liffApi.checkUser(...args);
export const createLineUser = (...args) => liffApi.createLineUser(...args);
export const getProducts = (...args) => liffApi.getProducts(...args);
export const createOrder = (...args) => liffApi.createOrder(...args);
export const updateOrder = (...args) => liffApi.updateOrder(...args);
export const listOrders = (...args) => liffApi.listOrders(...args);
export const getOrderDetail = (...args) => liffApi.getOrderDetail(...args);

export default liffApi;
