"use client";

import {
  faChevronLeft,
  faCircleExclamation,
  faLock,
  faMinus,
  faPlus,
  faShoppingCart,
  faTruck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import numeral from "numeral";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { loadCustomer } from "@/app/(protected)/products/_components/store-select-drawer";
import { useCart } from "@/hooks/use-cart";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";

type CheckUserResponse = {
  status: string;
  code: number;
  data: {
    customers: Array<{
      customer_id: string;
      customer_name: string;
      division_id: string;
      division_name: string;
    }>;
  };
};

type CreateOrderPayload = {
  deliver_date: string;
  address_id: string;
  customer_id: string;
  division_id: string;
  remark: string;
  items: Array<{
    product_id: string;
    product_img_url: string;
    product_name: string;
    product_desc: string;
    box_net_weight: string;
    unit: string;
    quantity: string;
    price: string;
    weight: string;
    sub_total: string;
    final_total: string;
    remark: string;
  }>;
};

export default function Page() {
  const router = useRouter();
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [address, setAddress] = useState("");
  const [remark, setRemark] = useState("");

  const [selectedCustomer] = useState(() => {
    if (typeof window === "undefined") return null;
    return loadCustomer();
  });

  const { liff } = useLIFF();
  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return liff.getProfile();
    },
  });
  const userId = profile?.userId;

  const { items, updateQty, removeItem, clearCart, totalCount } = useCart();

  const { data: checkData } = useQuery({
    queryKey: ["/api/user_check", userId],
    queryFn: () => api.checkUser(userId as string).json<CheckUserResponse>(),
    enabled: !!userId,
  });
  const customers = checkData?.data?.customers ?? [];

  useEffect(() => {
    if (!selectedCustomer) {
      router.replace("/products");
    }
  }, [selectedCustomer, router]);

  const mutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      api.createOrder(userId as string, payload).json(),
    onSuccess: () => {
      clearCart();
      router.replace("/orders");
    },
    onError: () => {
      toast.error("送出訂單失敗，請稍後再試");
    },
  });

  if (!selectedCustomer) return null;

  function handleSubmit() {
    if (!userId || !selectedCustomer || items.length === 0) return;
    const payload: CreateOrderPayload = {
      deliver_date: "",
      address_id: "",
      customer_id: selectedCustomer.customer_id,
      division_id: selectedCustomer.division_id,
      remark,
      items: items.map((item) => ({
        product_id: item.product_id,
        product_img_url: item.product_img_url,
        product_name: item.product_name,
        product_desc: item.product_desc,
        box_net_weight: String(item.box_net_weight),
        unit: "",
        quantity: String(item.qty),
        price: String(item.unit_price),
        weight: "",
        sub_total: String(item.unit_price * item.qty),
        final_total: String(item.unit_price * item.qty),
        remark: item.remark,
      })),
    };
    mutation.mutate(payload);
    confirmDialogRef.current?.close();
  }

  return (
    <div className="bg-gray-50 pb-48 text-gray-800 antialiased">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <a
          href="/products"
          className="-left-2 relative flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </a>
        <h1 className="font-bold text-gray-800 text-lg">建立訂單</h1>
        <div className="w-8" />
      </header>

      <main className="flex flex-col gap-3 p-3">
        {/* Product Summary */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-4 py-3">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="mr-2 text-gray-400"
              />
              <h3 className="font-bold text-gray-700 text-sm">
                商品清單 ({totalCount})
              </h3>
            </div>
          </div>

          <div className="space-y-4 p-4">
            {items.length === 0 ? (
              <div className="rounded-xl border border-gray-200 border-dashed bg-gray-50/80 py-8 text-center">
                <p className="text-gray-500 text-sm">目前尚未加入商品</p>
                <p className="mt-1 text-gray-400 text-xs">請返回商品頁面選購</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product_id} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100">
                    <img
                      src={item.product_img_url || "/placeholder.jpg"}
                      alt={item.product_name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-1 font-medium text-gray-800 text-sm">
                        {item.product_name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id)}
                        className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-500"
                        aria-label={`刪除 ${item.product_name}`}
                      >
                        刪除
                      </button>
                    </div>

                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {item.product_desc}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-bold text-salmon-600 text-sm">
                        NT$ {numeral(item.unit_price).format("0,0")}
                      </span>

                      <div className="inline-flex overflow-hidden rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(item.product_id, item.qty - 1)
                          }
                          className="h-9 w-9 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                          aria-label="減少數量"
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-xs" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={item.qty}
                          onChange={(e) =>
                            updateQty(
                              item.product_id,
                              Math.max(0, Math.floor(Number(e.target.value))),
                            )
                          }
                          className="w-14 bg-white text-center font-semibold text-gray-800 focus:outline-none"
                          aria-label="輸入數量"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(item.product_id, item.qty + 1)
                          }
                          className="h-9 w-9 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                          aria-label="增加數量"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shipping Form */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center border-gray-100 border-b bg-gray-50/50 px-4 py-3">
            <FontAwesomeIcon icon={faTruck} className="mr-2 text-gray-400" />
            <h3 className="font-bold text-gray-700 text-sm">收件與配送資訊</h3>
          </div>

          <div className="space-y-4 p-4">
            <div>
              <label
                htmlFor="store"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                選擇地址 <span className="text-red-500">*</span>
              </label>
              <select
                id="store"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 text-sm focus:border-salmon-500 focus:bg-white focus:outline-none"
              >
                <option value="">選擇地址</option>
                {customers.map((c) => (
                  <option
                    key={`${c.customer_id}-${c.division_id}`}
                    value={`${c.customer_id}-${c.division_id}`}
                  >
                    {c.customer_name} · {c.division_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                收件地址
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:border-salmon-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-salmon-500"
                placeholder="詳細地址、樓層"
              />
            </div>

            <div>
              <label
                htmlFor="note"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                訂單備註 (選填)
              </label>
              <textarea
                id="note"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="h-20 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:border-salmon-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-salmon-500"
                placeholder="有沒有什麼要告訴我們的？例如：請交由管理室代收..."
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Submission Bar */}
      <div className="fixed bottom-0 left-0 z-40 w-full border-gray-100 border-t bg-white pb-safe shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="p-3">
          <button
            type="button"
            disabled={items.length === 0 || mutation.isPending}
            onClick={() => confirmDialogRef.current?.showModal()}
            aria-label="開啟送出訂單確認視窗"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-salmon-500 py-3.5 font-bold text-sm text-white shadow-md transition-all hover:bg-salmon-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 lg:text-base"
          >
            <FontAwesomeIcon icon={faLock} className="text-sm opacity-80" />
            {mutation.isPending ? "送出中..." : "送出"}
          </button>
          <div className="mt-2 text-center text-[10px] text-gray-400">
            點擊按鈕即表示您同意我們的
            <a href="/terms" className="mx-1 text-gray-500 underline">
              服務條款
            </a>
            與
            <a href="/privacy" className="mx-1 text-gray-500 underline">
              隱私政策
            </a>
          </div>
        </div>
      </div>

      {/* Confirm Order Dialog */}
      <dialog
        ref={confirmDialogRef}
        className="fixed inset-0 z-50 m-0 h-full w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent"
        aria-labelledby="confirm-order-modal-title"
        aria-describedby="confirm-order-modal-content"
        onClick={(e) => {
          if (e.target === confirmDialogRef.current)
            confirmDialogRef.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") confirmDialogRef.current?.close();
        }}
      >
        <div className="flex h-full items-center justify-center bg-gray-900/45 px-4 py-6">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-gray-100 border-b px-5 pt-5 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-salmon-50 text-salmon-500">
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  className="text-base"
                />
              </div>
              <div className="flex-1">
                <h2
                  id="confirm-order-modal-title"
                  className="font-bold text-base text-gray-800"
                >
                  送出訂單
                </h2>
                <p
                  id="confirm-order-modal-content"
                  className="mt-1 text-gray-500 text-sm leading-6"
                >
                  訂單送出後將進入處理流程。請再次確認商品、配送資訊與備註內容是否正確。
                </p>
              </div>
              <button
                type="button"
                className="h-8 w-8 rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="關閉確認視窗"
                onClick={() => confirmDialogRef.current?.close()}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="bg-gray-50/80 px-5 py-4 text-gray-500 text-xs leading-5">
              送出後若需修改內容，請聯繫客服協助處理。
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              <button
                type="button"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-600 text-sm transition-colors hover:bg-gray-50"
                onClick={() => confirmDialogRef.current?.close()}
              >
                再檢查一下
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-xl bg-salmon-500 px-4 py-3 font-semibold text-sm text-white shadow-md transition-colors hover:bg-salmon-600"
              >
                送出訂單
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
