"use client";

import { faCopy } from "@fortawesome/free-regular-svg-icons";
import {
  faBoxOpen,
  faChevronLeft,
  faCircleExclamation,
  faEdit,
  faFileInvoice,
  faShoppingBag,
  faTruck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { use, useRef } from "react";
import { match, P } from "ts-pattern";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";
import { getOrderStatus } from "../_components/order-card";

type OrderDetailItem = {
  product_id: string;
  product_img_url: string;
  product_name: string;
  product_desc: string;
  unit: string;
  quantity: number;
  price: number;
  remark: string;
};

type OrderDetail = {
  id: number;
  order_date: string;
  number: string;
  deliver_date: string;
  address: { id: string; name: string; address: string };
  customer: { id: string; name: string; vat_id: string };
  remark: string;
  amount: number;
  final_amount: number;
  state: number;
  ship_status: number;
  items: OrderDetailItem[];
};

type OrderDetailResponse = {
  status: string;
  code: number;
  data: OrderDetail;
};

const STATUS_DISPLAY: Record<
  ReturnType<typeof getOrderStatus>,
  { title: string; desc: string }
> = {
  processing: { title: "商家處理中", desc: "預計於 1-2 個工作天內出貨及配發單號" },
  established: { title: "訂單已成立", desc: "商家已確認訂單" },
  pending: { title: "待收貨", desc: "商品已出貨，請注意配送狀態" },
  completed: { title: "訂單已完成", desc: "感謝您的訂購" },
  cancelled: { title: "訂單已取消", desc: "如有問題請聯繫客服" },
};

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = use(searchParams);
  const orderNumber = typeof id === "string" ? id : undefined;
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { liff } = useLIFF();
  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return await liff.getProfile();
    },
  });

  const userId = profile?.userId;

  const { data: orderRes, status } = useQuery({
    queryKey: [userId, "orders", orderNumber],
    queryFn: () => {
      if (!userId || !orderNumber) throw new Error("Missing userId or orderNumber");
      return api.getOrderDetail(userId, orderNumber).json<OrderDetailResponse>();
    },
    enabled: !!userId && !!orderNumber,
  });

  const order = orderRes?.data;
  const orderStatus = order ? getOrderStatus(order.state) : "processing";
  const statusDisplay = STATUS_DISPLAY[orderStatus];

  return (
    <div className="bg-gray-50 pb-24 text-gray-800 antialiased">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <a
          href="/orders"
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </a>
        <h1 className="font-bold text-gray-800 text-lg">訂單詳情</h1>
        <div className="w-8" />
      </header>

      <main className="flex flex-col gap-3 p-3">
        {match({ status, order })
          .with({ status: "pending" }, () => (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 h-14 w-14 animate-pulse rounded-full bg-gray-100" />
                <div className="mx-auto mb-1 h-6 w-32 animate-pulse rounded bg-gray-100" />
                <div className="mx-auto h-4 w-48 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="h-10 animate-pulse bg-gray-50" />
                <div className="space-y-3 p-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                    <div key={i} className="flex gap-3">
                      <div className="h-20 w-20 animate-pulse rounded-lg bg-gray-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ))
          .with({ status: "error" }, () => (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-medium text-gray-500 text-sm">載入失敗</p>
              <p className="mt-1 text-gray-400 text-xs">請重新整理頁面</p>
            </div>
          ))
          .with(
            { status: "success", order: P.not(P.nullish) },
            ({ order: o }) => (
              <>
                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
                  <div className="relative z-10 mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full border border-salmon-200 bg-salmon-100 text-salmon-500 shadow-sm">
                    <FontAwesomeIcon icon={faBoxOpen} className="text-2xl" />
                  </div>
                  <h2 className="relative z-10 mb-1 font-bold text-gray-800 text-xl">
                    {statusDisplay.title}
                  </h2>
                  <p className="relative z-10 text-gray-500 text-sm">
                    {statusDisplay.desc}
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center border-gray-100 border-b bg-gray-50/50 px-4 py-3">
                    <FontAwesomeIcon
                      icon={faShoppingBag}
                      className="mr-2 text-salmon-500"
                    />
                    <h3 className="font-bold text-gray-700 text-sm">商品明細</h3>
                  </div>
                  <div className="flex flex-col gap-4 p-4">
                    {o.items.map((item) => (
                      <div key={item.product_id} className="flex gap-3">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                          {item.product_img_url ? (
                            <img
                              src={item.product_img_url}
                              alt={item.product_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-100" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <h4 className="line-clamp-2 font-medium text-gray-800 text-sm leading-snug">
                            {item.product_name}
                          </h4>
                          <p className="mt-1 text-[11px] text-gray-500">
                            {item.product_desc}
                          </p>
                          <div className="mt-auto flex items-end justify-between">
                            <span className="font-bold text-red-500 text-sm">
                              NT$ {item.price.toLocaleString()}
                            </span>
                            <span className="font-medium text-gray-500 text-xs">
                              x {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-b-xl border-gray-100 border-t bg-gray-50/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-gray-500 text-sm">商品小計</span>
                      <span className="font-medium text-gray-800 text-sm">
                        NT$ {o.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="my-2 h-px w-full bg-gray-200" />
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-gray-800 text-sm">
                        結帳總額
                      </span>
                      <span className="font-bold text-lg text-red-500">
                        NT$ {(o.final_amount || o.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center border-gray-100 border-b bg-gray-50/50 px-4 py-3">
                    <FontAwesomeIcon
                      icon={faFileInvoice}
                      className="mr-2 text-gray-400"
                    />
                    <h3 className="font-bold text-gray-700 text-sm">訂單資訊</h3>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <span className="w-20 shrink-0 font-medium text-gray-500 text-xs">
                        訂單編號
                      </span>
                      <div className="flex items-center gap-2 font-medium text-gray-800 text-sm">
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(o.number)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-salmon-50 text-salmon-500 transition-colors hover:text-salmon-600 focus:outline-none"
                        >
                          <FontAwesomeIcon
                            icon={faCopy}
                            className="text-[10px]"
                          />
                        </button>
                        <span>#{o.number}</span>
                      </div>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="mt-0.5 w-20 shrink-0 font-medium text-gray-500 text-xs">
                        訂購時間
                      </span>
                      <span className="text-right font-medium text-gray-800 text-sm">
                        {dayjs(o.order_date).format("YYYY/MM/DD HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center border-gray-100 border-b bg-gray-50/50 px-4 py-3">
                    <FontAwesomeIcon
                      icon={faTruck}
                      className="mr-2 text-gray-400"
                    />
                    <h3 className="font-bold text-gray-700 text-sm">配送資訊</h3>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <span className="mt-0.5 w-20 shrink-0 font-medium text-gray-500 text-xs">
                        收件人
                      </span>
                      <span className="text-right font-medium text-gray-800 text-sm">
                        {o.customer.name}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="mt-0.5 w-20 shrink-0 font-medium text-gray-500 text-xs">
                        店別
                      </span>
                      <span className="text-right font-medium text-gray-800 text-sm">
                        {o.address.name}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="mt-0.5 w-20 shrink-0 font-medium text-gray-500 text-xs">
                        收件地址
                      </span>
                      <span className="text-right font-medium text-gray-800 text-sm leading-relaxed">
                        {o.address.address}
                      </span>
                    </div>
                    {o.remark && (
                      <div className="flex items-start justify-between">
                        <span className="mt-0.5 w-20 shrink-0 font-medium text-gray-500 text-xs">
                          訂單備註
                        </span>
                        <span className="text-right font-medium text-gray-800 text-sm">
                          {o.remark}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ),
          )
          .otherwise(() => null)}
      </main>

      <div className="fixed bottom-0 left-0 z-40 flex w-full gap-2.5 border-gray-200 border-t bg-white/95 px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-sm">
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          aria-label="開啟取消訂單確認視窗"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white py-2.5 font-bold text-gray-700 text-sm shadow-sm transition-colors hover:bg-gray-50 active:scale-95"
        >
          取消訂單
        </button>
        <a
          href="./create"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-salmon-500 py-2.5 text-center font-bold text-sm text-white shadow-sm transition-colors hover:bg-salmon-600 active:scale-95"
        >
          <FontAwesomeIcon icon={faEdit} /> 修改訂單
        </a>
      </div>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 m-0 h-full w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent"
        aria-labelledby="cancel-order-modal-title"
        aria-describedby="cancel-order-modal-content"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") dialogRef.current?.close();
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
                  id="cancel-order-modal-title"
                  className="font-bold text-base text-gray-800"
                >
                  取消訂單
                </h2>
                <p
                  id="cancel-order-modal-content"
                  className="mt-1 text-gray-500 text-sm leading-6"
                >
                  取消後將停止目前訂單流程。請再次確認是否要繼續。
                </p>
              </div>
              <button
                type="button"
                className="h-8 w-8 rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="關閉確認視窗"
                onClick={() => dialogRef.current?.close()}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="bg-gray-50/80 px-5 py-4 text-gray-500 text-xs leading-5">
              若仍需保留內容，請先返回檢查後再決定是否取消。
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              <button
                type="button"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-600 text-sm transition-colors hover:bg-gray-50"
                onClick={() => dialogRef.current?.close()}
              >
                先保留訂單
              </button>
              <button
                type="button"
                id="confirm-cancel-order"
                className="w-full rounded-xl bg-salmon-500 px-4 py-3 font-semibold text-sm text-white shadow-md transition-colors hover:bg-salmon-600"
              >
                取消訂單
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
