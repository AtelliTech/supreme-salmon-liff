"use client";

import { faChevronLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { use, useRef } from "react";
import { match, P } from "ts-pattern";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";
import { CancelOrderDialog } from "./_components/cancel-order-dialog";
import { OrderDeliveryCard } from "./_components/order-delivery-card";
import { OrderDetailSkeleton } from "./_components/order-detail-skeleton";
import { OrderInfoCard } from "./_components/order-info-card";
import { OrderItemsCard } from "./_components/order-items-card";
import { OrderStatusCard } from "./_components/order-status-card";
import type { OrderDetailResponse } from "./_components/types";

export default function Page({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = use(params);
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
      if (!userId || !orderNumber)
        throw new Error("Missing userId or orderNumber");
      return api
        .getOrderDetail(userId, orderNumber)
        .json<OrderDetailResponse>();
    },
    enabled: !!userId && !!orderNumber,
  });

  const order = orderRes?.data;

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
          .with({ status: "pending" }, () => <OrderDetailSkeleton />)
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
                <OrderStatusCard state={o.state} />
                <OrderItemsCard
                  items={o.items}
                  amount={o.amount}
                  final_amount={o.final_amount}
                />
                <OrderInfoCard number={o.number} order_date={o.order_date} />
                <OrderDeliveryCard
                  customer={o.customer}
                  address={o.address}
                  remark={o.remark}
                />
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

      <CancelOrderDialog ref={dialogRef} />
    </div>
  );
}
