"use client";

import {
  faBox,
  faCheck,
  faCheckCircle,
  faTimesCircle,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { match, P } from "ts-pattern";
import { NavBottom } from "@/components/nav-bottom";
import { cn } from "@/lib/utils";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";

type OrderStatus =
  | "processing"
  | "established"
  | "pending"
  | "completed"
  | "cancelled";
type FilterKey = "all" | OrderStatus;

type ApiOrder = {
  id: number;
  order_date: string;
  number: string;
  deliver_date: string;
  address: { id: string; name: string; address: string };
  customer: { id: string; name: string; vat_id: string };
  division: { id: string; name: string };
  remark: string;
  item_count: number;
  amount: number;
  final_amount: number;
  state: number;
  ship_status: number;
};

type OrdersResponse = {
  status: string;
  code: number;
  data: ApiOrder[];
  meta: {
    page: number;
    page_size: number;
    total_count: number;
    page_count: number;
  };
};

type Order = {
  id: string;
  status: OrderStatus;
  icon: typeof faBox;
  iconColor: string;
  statusLabel: string;
  statusBg: string;
  statusColor: string;
  title: string;
  itemCount: number;
  total: number;
  timestamp: string;
  grayscale?: boolean;
} & (
  | { singleImage: true; image: string; multiImage?: never; images?: never }
  | { multiImage: true; images: string[]; singleImage?: never; image?: never }
);

const STATUS_CONFIG: Record<
  OrderStatus,
  Pick<
    Order,
    | "icon"
    | "iconColor"
    | "statusLabel"
    | "statusBg"
    | "statusColor"
    | "grayscale"
  >
> = {
  processing: {
    icon: faBox,
    iconColor: "text-salmon-500",
    statusLabel: "處理中",
    statusBg: "bg-salmon-50",
    statusColor: "text-salmon-600",
  },
  established: {
    icon: faCheck,
    iconColor: "text-blue-500",
    statusLabel: "已成立",
    statusBg: "bg-blue-50",
    statusColor: "text-blue-600",
  },
  pending: {
    icon: faWallet,
    iconColor: "text-orange-400",
    statusLabel: "待收貨",
    statusBg: "bg-orange-50",
    statusColor: "text-orange-600",
  },
  completed: {
    icon: faCheckCircle,
    iconColor: "text-gray-400",
    statusLabel: "已完成",
    statusBg: "bg-gray-100",
    statusColor: "text-gray-500",
    grayscale: true,
  },
  cancelled: {
    icon: faTimesCircle,
    iconColor: "text-red-400",
    statusLabel: "已取消",
    statusBg: "bg-red-50",
    statusColor: "text-red-600",
  },
};

function getOrderStatus(state: number): OrderStatus {
  return match(state)
    .with(0, () => "processing" as const)
    .with(1, () => "established" as const)
    .with(2, () => "pending" as const)
    .with(3, () => "completed" as const)
    .otherwise(() => "cancelled" as const);
}

function mapApiOrder(order: ApiOrder): Order {
  const status = getOrderStatus(order.state);
  return {
    id: order.number,
    status,
    ...STATUS_CONFIG[status],
    title: order.customer.name,
    itemCount: order.item_count,
    total: order.amount,
    timestamp: dayjs(order.order_date).format("YYYY/MM/DD HH:mm"),
    singleImage: true,
    image: "/placeholder.jpg",
  };
}

const TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "processing", label: "處理中" },
  { key: "established", label: "已成立" },
  { key: "pending", label: "待收貨" },
  { key: "completed", label: "已完成" },
  { key: "cancelled", label: "已取消" },
];

const BADGE_STATUSES: FilterKey[] = ["processing", "established", "pending"];

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={order.icon} className={order.iconColor} />
          <span className="font-bold text-gray-700 text-sm">#{order.id}</span>
        </div>
        <span
          className={`rounded-md px-2 py-1 text-xs ${order.statusColor} ${order.statusBg} ${order.status === "processing" ? "font-bold" : "font-medium"}`}
        >
          {order.statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-3 p-4">
        {order.multiImage ? (
          <div className="-space-x-3 flex shrink-0">
            {order.images.map((img, idx) => (
              <div
                key={`${order.id}-img-${idx}`}
                className={`h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm ${idx === 0 ? "z-20 bg-white" : "z-10 bg-gray-100"}`}
              >
                <Image
                  src={img}
                  alt={order.title}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100">
            <Image
              src={order.image}
              alt={order.title}
              width={64}
              height={64}
              className={cn(
                "h-full w-full object-contain",
                order.grayscale ? "grayscale" : "",
              )}
            />
          </div>
        )}

        <div className={`flex-1 ${order.multiImage ? "ml-2" : ""}`}>
          <h3 className="mb-1 line-clamp-1 font-medium text-gray-800 text-sm">
            {order.title}
          </h3>
          <p className="mb-1 text-gray-500 text-xs">
            共 {order.itemCount} 件商品
          </p>
          <p className="font-bold text-gray-800 text-sm">
            總計:{" "}
            <span className="text-red-500">
              NT$ {order.total.toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-gray-100 border-t bg-white px-4 py-3">
        <p className="text-gray-400 text-xs">{order.timestamp}</p>
        <Link
          href={`/orders/detail?id=${order.id}`}
          className="rounded-full border border-gray-200 px-3 py-1.5 font-medium text-gray-600 text-xs transition-colors hover:bg-gray-50"
        >
          查看詳情
        </Link>
      </div>
    </div>
  );
}

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
