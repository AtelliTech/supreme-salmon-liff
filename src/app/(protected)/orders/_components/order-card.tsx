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
import { useUserSettings } from "@/providers/user-settings-provider";

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
  deliverDate: string;
  grayscale?: boolean;
  address?: { id: string; name: string; address: string };
  number: string;
};

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
    ...order,
    id: order.number,
    status,
    ...STATUS_CONFIG[status],
    title: order.customer.name,
    itemCount: order.item_count,
    total: order.amount,
    timestamp: dayjs(order.order_date).format("YYYY/MM/DD HH:mm"),
    deliverDate: dayjs(order.deliver_date).format("YYYY/MM/DD HH:mm"),
  };
}

export function OrderCard({ order }: { order: Order }) {
  const { displayPrice } = useUserSettings();

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
        <div className={`flex-1`}>
          <h3 className="line-clamp-1 font-medium text-gray-800 text-sm">
            {order.title}
          </h3>
          <p className="mb-2 text-gray-500 text-xs">
            共 {order.itemCount} 件商品
          </p>
          <p className={cn("font-bold text-gray-800 text-sm")}>
            到貨時間:{" "}
            <span className="font-normal text-gray-500">
              {order.deliverDate} (預計)
            </span>
          </p>
          <p className={cn("font-bold text-gray-800 text-sm")}>
            到貨地址:{" "}
            <span className="font-normal text-gray-500">
              {order.address?.address}
            </span>
          </p>
          <p
            className={cn(
              "mt-2 font-bold text-gray-800 text-sm",
              !displayPrice && "hidden",
            )}
          >
            總計:{" "}
            <span className="text-red-500">
              NT$ {order.total.toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-gray-100 border-t bg-white px-4 py-3">
        <p className="text-gray-400 text-xs">{order.timestamp} 建立</p>
        <Link
          href={`/orders/${order.number}`}
          className="rounded-full border border-gray-200 px-3 py-1.5 font-medium text-gray-600 text-xs transition-colors hover:bg-gray-50"
        >
          查看詳情
        </Link>
      </div>
    </div>
  );
}
