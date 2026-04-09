import liff from "@line/liff";
import { createLiffApi } from "/api/index.js";

const LIFF_ID = "2009395054-rgDD7RPZ";

export async function resolveUserRoute({
  api = createLiffApi(),
  liffId = LIFF_ID,
  onNotLoggedIn = () => liff.login(),
  onPending = () => (window.location.href = "/pending"),
  onCustomer = () => (window.location.href = "/products"),
  onNotFound = () => (window.location.href = "/sign-up"),
  onError = ({ error, status }) => {
    console.error("Error checking user:", status, error);
  },
} = {}) {
  await liff.init({ liffId });

  if (!liff.isLoggedIn()) {
    onNotLoggedIn();
    return { state: "NOT_LOGGED_IN" };
  }

  const profile = await liff.getProfile();
  const { userId } = profile;

  try {
    const response = await api.checkUser(userId);
    const isCustomer = response?.data?.is_customer;

    if (isCustomer === "N") {
      onPending({ userId, profile, response });
      return { state: "PENDING", userId, profile, response };
    }

    if (isCustomer === "Y") {
      onCustomer({ userId, profile, response });
      return { state: "CUSTOMER", userId, profile, response };
    }

    return { state: "UNKNOWN_CUSTOMER_FLAG", userId, profile, response };
  } catch (error) {
    const status = error?.status ?? error?.response?.status;

    if (status === 404) {
      onNotFound({ userId, profile, error, status });
      return { state: "NOT_FOUND", userId, profile, error, status };
    }

    onError({ userId, profile, error, status });
    return { state: "ERROR", userId, profile, error, status };
  }
}
