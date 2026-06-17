"use client";

import { faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/providers/user-settings-provider";
import type { OrderDetailItem } from "./types";

type Props = {
  items: OrderDetailItem[];
  amount: number;
  final_amount: number;
};

export function OrderItemsCard({ items, amount, final_amount }: Props) {
  const { displayPrice } = useUserSettings();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center border-gray-100 border-b bg-gray-50/50 px-4 py-3">
        <FontAwesomeIcon
          icon={faShoppingBag}
          className="mr-2 text-salmon-500"
        />
        <h3 className="font-bold text-gray-700 text-sm">商品明細</h3>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {items.map((item) => (
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
                <span
                  className={cn(
                    "font-bold text-red-500 text-sm",
                    !displayPrice && "invisible",
                  )}
                >
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
      <div className={cn("rounded-b-xl border-gray-100 border-t bg-gray-50/50 p-4", !displayPrice && "hidden")}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-gray-500 text-sm">商品小計</span>
          <span
            className={cn(
              "font-medium text-gray-800 text-sm",
              !displayPrice && "invisible",
            )}
          >
            NT$ {amount.toLocaleString()}
          </span>
        </div>
        <div className="my-2 h-px w-full bg-gray-200" />
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-gray-800 text-sm">結帳總額</span>
          <span
            className={cn(
              "font-bold text-lg text-red-500",
              !displayPrice && "invisible",
            )}
          >
            NT$ {(final_amount || amount).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
