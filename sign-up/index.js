import liff from "@line/liff";

import { resolveUserRoute } from "/utils/index.js";

const signupForm = document.getElementById("signup-form");
const displayNameInput = signupForm?.querySelector(
  'input[name="display_name"]',
);

let currentProfile = null;

async function handleSignupSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const formValues = Object.fromEntries(formData.entries());
  const lineUserId = currentProfile?.userId || liff.getContext()?.userId;

  if (!lineUserId) {
    console.error("找不到 LINE userId，無法送出註冊資料");
    return;
  }

  const payload = {
    ...formValues,
    line_user_id: lineUserId,
  };

  console.log("所有欄位輸入內容:", payload);

  try {
    const result = await api.createLineUser(payload);
    console.log("註冊 API 回應:", result);
  } catch (error) {
    console.error("註冊 API 失敗:", error);
  }
}

signupForm?.addEventListener("submit", handleSignupSubmit);

main();

async function main() {
  const { profile } = await resolveUserRoute({
    onPending: ({ profile }) => {
      console.log("使用者狀態: PENDING", profile);
    },
  });

  if (displayNameInput) {
    displayNameInput.value = profile.displayName || "";
    displayNameInput.placeholder = "";
  }
}
