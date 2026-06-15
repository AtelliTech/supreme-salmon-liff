import { cookies } from "next/headers";

export const authProviderClient = {
  check: async () => {
    const cookieStore = await cookies();
    const auth = cookieStore.get("sid");

    if (auth) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },
};
