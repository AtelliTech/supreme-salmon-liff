import liff from "@line/liff";
import { createLiffApi } from "/api/index.js";

const LIFF_ID = "2009395054-rgDD7RPZ";

function normalizePath(path) {
  return (path || "/").replace(/\/+$/, "") || "/";
}

export function safeRedirect(path) {
  const current = normalizePath(window.location.pathname);
  const target = normalizePath(path);

  if (current === target) return false;
  window.location.href = target;
  return true;
}

export async function resolveUserState({
  api = createLiffApi(),
  liffId = LIFF_ID,
} = {}) {
  await liff.init({ liffId });

  if (!liff.isLoggedIn()) {
    return { state: "NOT_LOGGED_IN" };
  }

  const profile = await liff.getProfile();
  const { userId } = profile;

  try {
    const response = await api.checkUser(userId);
    const isCustomer = response?.data?.is_customer;

    if (isCustomer === "N") {
      return { state: "PENDING", userId, profile, response };
    }

    if (isCustomer === "Y") {
      return { state: "CUSTOMER", userId, profile, response };
    }

    return { state: "UNKNOWN_CUSTOMER_FLAG", userId, profile, response };
  } catch (error) {
    const status = error?.status ?? error?.response?.status;

    if (status === 404) {
      return { state: "NOT_FOUND", userId, profile, error, status };
    }

    return { state: "ERROR", userId, profile, error, status };
  }
}

export function routeByUserState({
  result,
  onNotLoggedIn = () => liff.login(),
  onPending = ({ userId, profile, response }) => safeRedirect("/pending"),
  onCustomer = ({ userId, profile, response }) => safeRedirect("/products"),
  onNotFound = ({ userId, profile, error, status }) => safeRedirect("/sign-up"),
  onError = ({ userId, profile, error, status }) => {
    console.error("Error checking user:", status, error);
  },
} = {}) {
  if (!result?.state) return result;

  switch (result.state) {
    case "NOT_LOGGED_IN":
      onNotLoggedIn({ result });
      break;
    case "PENDING":
      onPending(result);
      break;
    case "CUSTOMER":
      onCustomer(result);
      break;
    case "NOT_FOUND":
      onNotFound(result);
      break;
    case "ERROR":
      onError(result);
      break;
    default:
      break;
  }

  return result;
}

export async function resolveUserRoute(options = {}) {
  const { api = createLiffApi(), liffId = LIFF_ID } = options;
  const result = await resolveUserState({ api, liffId });
  routeByUserState({ result, ...options });
  return result;
}
