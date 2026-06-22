"use client";

import NiceModal from "@ebay/nice-modal-react";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { NavBottom } from "@/components/nav-bottom";
import { useCart } from "@/hooks/use-cart";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";
import {
  type Customer,
  loadCustomer,
  StoreSelectDrawer,
  saveCustomer,
} from "../products/_components/store-select-drawer";

type UserCheckData = {
  line_uid: string;
  display_name: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  vat_id: string;
  is_customer: "Y" | "N";
  display_price: "Y" | "N";
  customers: Customer[];
};

type UserCheckResponse = {
  data: UserCheckData;
};

export default function Page() {
  const { liff } = useLIFF();
  const { totalCount, clearCart } = useCart();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return await liff.getProfile();
    },
    enabled: !!liff,
  });

  const userId = profile?.userId;

  const { data: userCheckRes, status } = useQuery({
    queryKey: ["/api/liff/user_check", userId],
    queryFn: () => api.checkUser(userId!).json<UserCheckResponse>(),
    enabled: !!userId,
  });

  const user = userCheckRes?.data;

  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(
    loadCustomer,
  );

  function applyCustomer(customer: Customer) {
    saveCustomer(customer);
    setActiveCustomer(customer);
    queryClient.invalidateQueries({ queryKey: [userId, "products"] });
  }

  async function handleSwitchStore() {
    if (!userId) return;
    const customer = await NiceModal.show(StoreSelectDrawer, { userId });
    if (!customer) return;

    if (activeCustomer && activeCustomer?.customer_id !== customer?.customer_id) {
      window.confirm(
        "切換店家將會清空目前購物車內的商品，確定要切換嗎？",
      ) && clearCart();
    }

    applyCustomer(customer as Customer);
  }

  function handleSelectCustomer(customer: Customer) {
    applyCustomer(customer);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-800 antialiased">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <div className="font-bold text-lg text-salmon-600">MOWI Taiwan</div>
        <div className="relative">
          <a href="/orders/create">
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="text-gray-600 text-xl"
            />
            {totalCount > 0 && (
              <span className="-top-1.5 -right-1.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white">
                {totalCount}
              </span>
            )}
          </a>
        </div>
      </header>

      <div className="px-4 pt-2">
        <span className="text-gray-500 text-sm">會員資訊</span>
      </div>

      <div className="space-y-3 p-3">
        {status === "pending" && <AccountSkeleton />}
        {status === "success" && user && (
          <>
            <ProfileCard user={user} />
            <ActiveStoreCard
              activeCustomer={activeCustomer}
              onSwitch={handleSwitchStore}
            />
            <BasicInfoCard user={user} />
            <CustomerListCard
              customers={user.customers}
              activeCustomer={activeCustomer}
              onSelect={handleSelectCustomer}
            />
          </>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-medium text-gray-500 text-sm">載入失敗</p>
            <p className="mt-1 text-gray-400 text-xs">請重新整理頁面</p>
          </div>
        )}
      </div>

      <NavBottom />
    </div>
  );
}

function ProfileCard({ user }: { user: UserCheckData }) {
  const initial = user.display_name.charAt(0).toUpperCase();
  const lineUid = user?.line_uid;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-800 font-bold text-lg text-white">
          {initial}
        </div>
        <div>
          <p className="font-bold text-base text-gray-800">
            {user.display_name}
          </p>
          <p className="text-gray-400 text-xs">LINE 帳號已綁定：{lineUid}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {user.is_customer === "Y" && (
          <span className="rounded-full border border-green-200 bg-green-50 px-3 py-0.5 font-medium text-green-600 text-xs">
            已認證客戶
          </span>
        )}
        {user.display_price === "Y" && (
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-0.5 font-medium text-teal-600 text-xs">
            可查看價格
          </span>
        )}
      </div>
    </div>
  );
}

function ActiveStoreCard({
  activeCustomer,
  onSwitch,
}: {
  activeCustomer: Customer | null;
  onSwitch: () => void;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="mb-1 text-gray-500 text-sm">目前下單店家</p>
      {activeCustomer ? (
        <>
          <p className="font-bold text-gray-800 text-lg">
            {activeCustomer.customer_name}
          </p>
          <p className="mb-4 text-gray-500 text-sm">
            {activeCustomer.division_name}
          </p>
        </>
      ) : (
        <p className="mb-4 text-gray-400 text-sm">尚未選擇店家</p>
      )}
      <button
        type="button"
        onClick={onSwitch}
        className="w-full rounded-full bg-gray-800 py-3 font-semibold text-sm text-white transition-opacity active:opacity-80"
      >
        切換店家
      </button>
    </div>
  );
}

const INFO_ROWS: Array<{ label: string; key: keyof UserCheckData }> = [
  { label: "姓名", key: "name" },
  { label: "Email", key: "email" },
  { label: "電話", key: "phone" },
  { label: "公司名稱", key: "company_name" },
  { label: "統一編號", key: "vat_id" },
];

function BasicInfoCard({ user }: { user: UserCheckData }) {
  return (
    <div className="rounded-xl bg-white shadow-sm">
      <p className="border-gray-100 border-b px-4 py-3 text-gray-500 text-sm">
        基本資料
      </p>
      {INFO_ROWS.map(({ label, key }) => (
        <div
          key={key}
          className="flex items-center justify-between border-gray-100 border-b px-4 py-3 last:border-0"
        >
          <span className="text-gray-500 text-sm">{label}</span>
          <span className="text-gray-800 text-sm">
            {String(user[key] ?? "-")}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomerListCard({
  customers,
  activeCustomer,
  onSelect,
}: {
  customers: Customer[];
  activeCustomer: Customer | null;
  onSelect: (c: Customer) => void;
}) {
  function isActive(c: Customer) {
    return (
      activeCustomer?.customer_id === c.customer_id &&
      activeCustomer?.division_id === c.division_id
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <p className="border-gray-100 border-b px-4 py-3 text-gray-500 text-sm">
        可用客戶 / 分店
      </p>
      {customers.map((c) => (
        <div
          key={`${c.customer_id}-${c.division_id}`}
          className="flex items-center justify-between border-gray-100 border-b px-4 py-3 last:border-0"
        >
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {c.customer_name}
            </p>
            <p className="text-gray-400 text-xs">{c.division_name}</p>
          </div>
          {isActive(c) ? (
            <span className="font-semibold text-green-500 text-sm">
              目前使用中
            </span>
          ) : (
            null
            // <button
            //   type="button"
            //   onClick={() => onSelect(c)}
            //   className="font-semibold text-gray-800 text-sm"
            // >
            //   切換
            // </button>
          )}
        </div>
      ))}
    </div>
  );
}

function AccountSkeleton() {
  return (
    <>
      <div className="h-28 animate-pulse rounded-xl bg-white shadow-sm" />
      <div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />
      <div className="h-44 animate-pulse rounded-xl bg-white shadow-sm" />
      <div className="h-32 animate-pulse rounded-xl bg-white shadow-sm" />
    </>
  );
}
