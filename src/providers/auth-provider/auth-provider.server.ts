import { cookies } from "next/headers";

export const authProviderServer = {
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
      redirectTo: `/login`,
    };
  },
  onError: async (error: any) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
};
