"use client";

import {
  faBox,
  faCheck,
  faCheckCircle,
  faTimesCircle,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import Link from "next/link";
import { match } from "ts-pattern";
import { cn } from "@/lib/utils";

export type OrderStatus =
  | "processing"
  | "established"
  | "pending"
  | "completed"
  | "cancelled";
export type FilterKey = "all" | OrderStatus;

export type ApiOrder = {
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

export type OrdersResponse = {
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

export type Order = {
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

export const STATUS_CONFIG: Record<
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

export const TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "processing", label: "處理中" },
  { key: "established", label: "已成立" },
  { key: "pending", label: "待收貨" },
  { key: "completed", label: "已完成" },
  { key: "cancelled", label: "已取消" },
];

export const BADGE_STATUSES: FilterKey[] = [
  "processing",
  "established",
  "pending",
];

export function getOrderStatus(state: number): OrderStatus {
  return match(state)
    .with(0, () => "processing" as const)
    .with(1, () => "established" as const)
    .with(2, () => "pending" as const)
    .with(3, () => "completed" as const)
    .otherwise(() => "cancelled" as const);
}

export function mapApiOrder(order: ApiOrder): Order {
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
    image: "",
  };
}

export function OrderCard({ order }: { order: Order }) {
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
                {img ? (<img
                  src={img}
                  alt={order.title}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />) : (
                  <div className="h-full w-full animate-pulse bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100">
            {order.image ? (<img
              src={order.image}
              alt={order.title}
              width={64}
              height={64}
              className={cn(
                "h-full w-full object-contain",
                order.grayscale ? "grayscale" : "",
              )}
            />) : (
              <div className="h-full w-full animate-pulse bg-gray-100" />
            )}
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
