"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useQuery } from "@tanstack/react-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { api } from "@/services/client";

export type Customer = {
  customer_id: string;
  customer_name: string;
  division_id: string;
  division_name: string;
};

type UserCheckResponse = {
  status: string;
  code: number;
  error_message?: string;
  data: {
    customers: Customer[];
  };
};

const STORAGE_KEY = "mowi_selected_customer";

export function saveCustomer(c: Customer) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

export function loadCustomer(): Customer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Customer) : null;
  } catch {
    return null;
  }
}

export const StoreSelectDrawer = NiceModal.create<{ userId: string }>(
  ({ userId }) => {
    const modal = useModal();

    const { data, status, refetch } = useQuery({
      queryKey: ["/api/user_check", userId],
      queryFn: () => api.checkUser(userId).json<UserCheckResponse>(),
      select: (data) => {
        // FIXME: temporary mock until backend is ready
        const mockCustomers = [
          { customer_id: 208682, customer_name: "測試店家", division_id: 240, division_name: "大安店" },
          { customer_id: 208683, customer_name: "測試店家 2", division_id: 241, division_name: "信義店" },
        ]

       return { ...data, data: { ...data.data, customers: mockCustomers } }
      },
    });

    const customers = data?.data?.customers ?? [];

    function handleSelect(customer: Customer) {
      saveCustomer(customer);
      modal.resolve(customer);
      modal.hide();
    }

    return (
      <Drawer open={modal.visible} onOpenChange={() => {}} dismissible={false}>
        <DrawerContent className="max-h-[70vh] rounded-t-3xl pb-safe">
          <DrawerTitle className="border-gray-100 border-b px-4 py-3 font-bold text-base text-gray-800">
            請選擇店家
          </DrawerTitle>
          <DrawerDescription className="hidden" />

          <div className="overflow-y-auto">
            {status === "pending" && (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                    key={i}
                    className="h-14 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-gray-500 text-sm">載入失敗，請重試</p>
                <button
                  type="button"
                  onClick={refetch}
                  className="rounded-xl bg-salmon-500 px-5 py-2 font-semibold text-sm text-white"
                >
                  重試
                </button>
              </div>
            )}

            {status === "success" && customers.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <p className="text-gray-500 text-sm">目前沒有可選店家</p>
                <p className="text-gray-400 text-xs">請聯絡客服</p>
              </div>
            )}

            {status === "success" && customers.length > 0 && (
              <ul className="divide-y divide-gray-100 p-2">
                {customers.map((c) => (
                  <li key={`${c.customer_id}-${c.division_id}`}>
                    <button
                      type="button"
                      onClick={() => handleSelect(c)}
                      className="w-full rounded-xl px-4 py-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                    >
                      <span className="font-medium text-gray-800 text-sm">
                        {c.customer_name} · {c.division_name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    );
  },
);
