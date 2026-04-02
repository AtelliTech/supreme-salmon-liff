import liff from "@line/liff";
import { createLiffApi } from "./api";

main();

async function main() {
  await liff.init({ liffId: "2009395054-rgDD7RPZ" });
  if (!liff.isLoggedIn()) {
    liff.login();
  } else {
    const api = createLiffApi();
    const profile = await liff.getProfile();

    const { userId } = profile;

    api
      .checkUser(userId)
      .then((response) => {
        console.log("User check response:", response);

        if (error.status !== 404) {
          window.location.href = "/products";
        }
      })
      .catch((error) => {
        console.error("Error checking user:", error.status);

        if (error.status === 404) {
          // redirect to sign-up page if user is not found
          window.location.href = "/sign-up";
        }
      });
  }
}
