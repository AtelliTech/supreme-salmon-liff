"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLIFF } from "@/providers/liff-providers";
import { UserSettingsProvider } from "@/providers/user-settings-provider";
import { api } from "@/services/client";

type UserCheckResponse = {
  data: {
    is_customer: string;
    display_price: "Y" | "N";
    code: number;
  };
};

export default function Layout({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const { liff } = useLIFF();

  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return await liff.getProfile();
    },
    enabled: !!liff,
  });

  const userId = profile?.userId;

  const { data: userCheck, status } = useQuery({
    queryKey: ["/api/liff/user_check", userId],
    queryFn: () =>
      api
        .checkUser(userId as string)
        .json<UserCheckResponse>(),
    enabled: !!userId,
  });

  const isNotCustomer =
    status === "success" && userCheck?.data?.is_customer !== "Y";

  useEffect(() => {
    if (isNotCustomer) {
      router.replace("/pending");
      return;
    }
  }, [isNotCustomer, router]);

  if (status !== "success" || isNotCustomer) {
    return null;
  }

  const displayPrice = userCheck?.data?.display_price !== "N";

  return (
    <UserSettingsProvider displayPrice={displayPrice}>
      {children}
    </UserSettingsProvider>
  );
}
