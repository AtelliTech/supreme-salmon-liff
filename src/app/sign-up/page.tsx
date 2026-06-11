"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";

export default function Page() {
  const { liff } = useLIFF();
  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return await liff.getProfile();
    },
  });

  const userId = profile?.userId


  const displayName = profile?.displayName;

  return (
    <div className="bg-gray-50 pb-32 text-gray-800 antialiased">
      <header className="sticky top-0 z-40 flex items-center justify-center bg-white px-4 py-3 shadow-sm">
        <h1 className="font-bold text-gray-800 text-lg">會員註冊</h1>
      </header>

      <main className="flex flex-col gap-4 p-4">
        <div className="py-4 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-salmon-100 shadow-inner">
            {/* <i className="fas fa-user-circle text-4xl text-salmon-500"></i> */}
            <FontAwesomeIcon
              icon="user-circle"
              className="text-4xl text-salmon-500"
            />
          </div>
          <h2 className="font-bold text-gray-800 text-xl">
            歡迎加入 MOWI Taiwan !
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            請完善您的會員資料，以享受專屬優惠與服務。
          </p>
        </div>

        <form id="signup-form" className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center border-gray-100 border-b bg-gray-50/50 px-4 py-3">
              <i className="fas fa-id-card mr-2 text-salmon-500"></i>
              <h3 className="font-bold text-gray-700 text-sm">基本資料</h3>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <label
                  htmlFor="display_name"
                  className="mb-1 block font-medium text-gray-600 text-xs"
                >
                  顯示名稱 (LINE 暱稱)
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={["fab", "line"]}
                    className="-translate-y-1/2 absolute top-1/2 left-3 z-10 text-green-500 text-lg"
                  />
                  <input
                    id="display_name"
                    type="text"
                    name="display_name"
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 py-2.5 pr-3 pl-10 text-gray-500 text-sm focus:outline-none"
                    placeholder="讀取中..."
                    value={displayName}
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block font-medium text-gray-600 text-xs"
                >
                  真實姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:border-salmon-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-salmon-500"
                  placeholder="請填寫真實姓名，以利後續核對"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block font-medium text-gray-600 text-xs"
                >
                  聯絡電話 <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:border-salmon-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-salmon-500"
                  placeholder="09XX-XXX-XXX"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block font-medium text-gray-600 text-xs"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:border-salmon-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-salmon-500"
                  placeholder="example@mail.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center border-gray-100 border-b bg-gray-50/50 px-4 py-3">
              <i className="fas fa-building mr-2 text-salmon-500"></i>
              <h3 className="font-bold text-gray-700 text-sm">
                公司資訊 (若為企業客戶請填寫)
              </h3>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <label
                  htmlFor="company_name"
                  className="mb-1 block font-medium text-gray-600 text-xs"
                >
                  公司名稱
                </label>
                <input
                  id="company_name"
                  type="text"
                  name="company_name"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:border-salmon-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-salmon-500"
                  placeholder="請填寫公司行號名稱"
                />
              </div>

              <div>
                <label
                  htmlFor="vat_id"
                  className="mb-1 block font-medium text-gray-600 text-xs"
                >
                  統一編號
                </label>
                <input
                  id="vat_id"
                  type="text"
                  name="vat_id"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:border-salmon-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-salmon-500"
                  placeholder="8碼數字"
                  pattern="\d{8}"
                  maxLength={8}
                />
              </div>
            </div>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 z-40 w-full border-gray-100 border-t bg-white pb-safe shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="p-4">
          <button
            type="submit"
            form="signup-form"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-salmon-500 py-3.5 font-bold text-base text-white shadow-md transition-all hover:bg-salmon-600 active:scale-[0.98]"
          >
            <i className="fas fa-check-circle text-sm opacity-90"></i>{" "}
            註冊並送出
          </button>
          <div className="mt-3 pb-1 text-center text-[10px] text-gray-400">
            點擊送出即表示您同意我們的
            <a href="/#" className="mx-1 text-gray-500 underline">
              會員服務條款
            </a>
            與
            <a href="/#" className="mx-1 text-gray-500 underline">
              隱私政策
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
