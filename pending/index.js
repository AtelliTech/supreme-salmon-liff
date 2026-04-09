import { createLiffApi } from "/api/index.js";
import { resolveUserState, routeByUserState } from "/utils/index.js";

async function main() {
  const api = createLiffApi();
  const result = await resolveUserState({ api });

  if (result.state !== "NOT_FOUND") {
    routeByUserState({ result });
    return;
  }
}

main();
