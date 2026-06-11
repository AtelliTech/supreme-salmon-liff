'use client';
import { faUserClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";

export default function Page() {
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
      api.checkUser(userId as string).json<{ data: { is_customer: string } }>(),
    enabled: !!userId,
  });

  useEffect(() => {
    if (status === "success" && userCheck?.data?.is_customer === "Y") {
      router.replace("/products");
    }
  }, [status, userCheck, router]);

  if (status !== "success") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">正在檢查會員資格...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pt-safe pb-safe text-gray-800 antialiased">
      <header className="sticky top-0 z-40 flex shrink-0 items-center justify-center bg-white px-4 py-3 shadow-sm">
        <h1 className="font-bold text-gray-800 text-lg">審核中</h1>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-salmon-50 opacity-75"></div>

          <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-salmon-100 shadow-inner">
            <FontAwesomeIcon
              icon={faUserClock}
              className="text-4xl text-salmon-500"
            />
          </div>
        </div>

        <h2 className="mb-3 font-bold text-2xl text-gray-800">資料審核中</h2>
        <p className="mx-auto mb-2 max-w-70 text-gray-500 text-sm leading-relaxed">
          您的會員註冊資料我們已經收到囉！
          <br />
          目前工作人員正在為您加速審核中。
          <br />
        </p>
        <p className="mx-auto max-w-70 text-gray-400 text-xs">
          審核完成後，我們將透過 LINE 官方帳號推播通知您，請耐心等候。
        </p>

        <div className="mt-8 flex w-full max-w-75 gap-3 rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm">
          <i className="fas fa-info-circle mt-0.5 text-salmon-500"></i>
          <div>
            <h4 className="mb-1 font-bold text-gray-700 text-sm">
              審核需多久時間？
            </h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              一般情況下，審核將於 1-2
              個工作天內完成。若遇假日則順延至下個工作日。
            </p>
          </div>
        </div>
      </main>

      <div className="z-40 w-full shrink-0 px-4 py-6">
        <button
          onClick={() => {
            window.close();
          }}
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3.5 font-bold text-base text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
        >
          <i className="fas fa-times text-sm opacity-80"></i> 關閉視窗
        </button>
        <div className="mt-4 text-center text-[11px] text-gray-400">
          有任何問題嗎？
          <a href="/#" className="font-bold text-salmon-500 underline">
            聯繫專人客服
          </a>
        </div>
      </div>
    </div>
  );
}
