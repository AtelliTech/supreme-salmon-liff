"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { match, P } from "ts-pattern";
import { NavBottom } from "@/components/nav-bottom";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";
import {
  BADGE_STATUSES,
  type FilterKey,
  mapApiOrder,
  OrderCard,
  type OrdersResponse,
  TABS,
} from "./_components/order-card";

export default function Page() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const { liff } = useLIFF();
  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return await liff.getProfile();
    },
  });

  const userId = profile?.userId;

  const { data: ordersRes, status } = useQuery({
    queryKey: [userId, "orders"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      return api.getOrders(userId).json<OrdersResponse>();
    },
    enabled: !!userId,
  });

  const allOrders = (ordersRes?.data ?? []).map(mapApiOrder);
  const filtered =
    filter === "all" ? allOrders : allOrders.filter((o) => o.status === filter);

  const orderList = match({ status, orders: filtered })
    .with({ status: "pending" }, () => (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={i}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-4 py-3">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-14 animate-pulse rounded-md bg-gray-100" />
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </>
    ))
    .with({ status: "success", orders: P.when((o) => o.length === 0) }, () => (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-medium text-gray-500 text-sm">目前沒有訂單</p>
        <p className="mt-1 text-gray-400 text-xs">請稍後再試</p>
      </div>
    ))
    .with({ status: "success" }, ({ orders }) => (
      <>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </>
    ))
    .with({ status: "error" }, () => (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-medium text-gray-500 text-sm">載入失敗</p>
        <p className="mt-1 text-gray-400 text-xs">請重新整理頁面</p>
      </div>
    ))
    .exhaustive();

  return (
    <div className="no-scrollbar bg-gray-50 pb-20 text-gray-800 antialiased">
      <header className="sticky top-0 z-40 flex items-center justify-center bg-white px-4 py-3 shadow-sm">
        <h1 className="font-bold text-gray-800 text-lg">我的訂單</h1>
      </header>

      <div className="no-scrollbar mb-2 overflow-x-auto whitespace-nowrap border-gray-100 border-t bg-white px-3 py-3 shadow-sm">
        {TABS.map(({ key, label }) => {
          const isActive = filter === key;
          const hasBadge = BADGE_STATUSES.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`relative mr-2 inline-block rounded-full px-4 py-1.5 font-medium text-sm transition-colors ${
                isActive
                  ? "bg-salmon-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
              {hasBadge && !isActive && (
                <span className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white">
                  1
                </span>
              )}
            </button>
          );
        })}
      </div>

      <main className="flex flex-col gap-3 p-3">{orderList}</main>

      <NavBottom />
    </div>
  );
}
