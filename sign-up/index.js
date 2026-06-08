import { createApi } from "/api/index.js";
import { resolveUserState, routeByUserState } from "/utils/index.js";

main();

async function main() {
  const api = createApi();
  const result = await resolveUserState({ api });

  if (result.state !== "NOT_FOUND") {
    routeByUserState({ result });
    return;
  }

  setupSignupForm({ api, profile: result.profile });
}

function setupSignupForm({ api, profile }) {
  const form = document.getElementById("signup-form");
  if (!form) return;

  const displayNameInput = form.querySelector('input[name="display_name"]');

  if (displayNameInput) {
    displayNameInput.value = profile?.displayName || "";
    displayNameInput.placeholder = "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = buildSignupPayload({
      formElement: event.currentTarget,
      lineUserId: profile?.userId,
    });

    if (!payload) {
      console.error("找不到 LINE userId，無法送出註冊資料");
      return;
    }

    console.log("所有欄位輸入內容:", payload);

    try {
      const result = await api.createLineUser(payload);
      console.log("註冊 API 回應:", result);
      if (result?.data?.success) {
        routeByUserState({ result: { state: "PENDING", profile, response: result } });
      }
    } catch (error) {
      console.error("註冊 API 失敗:", error);
    }
  });
}

function buildSignupPayload({ formElement, lineUserId }) {
  if (!lineUserId) return null;

  const formData = new FormData(formElement);
  const formValues = Object.fromEntries(formData.entries());

  return {
    ...formValues,
    line_user_id: lineUserId,
  };
}
