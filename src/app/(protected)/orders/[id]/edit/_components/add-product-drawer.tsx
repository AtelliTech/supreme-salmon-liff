"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import numeral from "numeral";
import {
  type Product,
  ProductDrawer,
  type ProductDrawerResult,
  type ProductsResponse,
} from "@/app/(protected)/products/_components/product-drawer";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/providers/user-settings-provider";
import { api } from "@/services/client";

export const AddProductDrawer = NiceModal.create<{
  userId: string;
  selectedCustomer: Record<"customer_id" | "division_id", string>;
  onAddItem: (product: Product, qty: number) => void;
}>(({ userId, selectedCustomer, onAddItem }) => {
  const modal = useModal();
  const { displayPrice } = useUserSettings();

  const { data, status } = useQuery({
    queryKey: [userId, "products", selectedCustomer, "add-product-drawer"],
    queryFn: () =>
      api
        .getProducts(userId, {
          customer_id: selectedCustomer.customer_id,
          division_id: selectedCustomer.division_id,
        })
        .json<ProductsResponse>(),
  });

  const products = data?.data ?? [];

  function handleProductClick(product: Product) {
    NiceModal.show(ProductDrawer, { product }).then((result) => {
      if (!result) return;
      const { product: selected, qty } = result as ProductDrawerResult;
      onAddItem(selected, qty);
      NiceModal.hide(ProductDrawer);
      modal.hide();
    });
  }

  return (
    <Drawer open={modal.visible} onOpenChange={() => modal.hide()}>
      <DrawerContent className="max-h-[86vh] rounded-t-3xl pb-safe">
        <DrawerTitle className="hidden" />
        <DrawerDescription className="hidden" />

        <div className="flex items-center justify-between border-gray-100 border-b px-4 py-3">
          <h2 className="font-bold text-base text-gray-800">選擇商品</h2>
          <DrawerClose asChild>
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
              aria-label="關閉"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </DrawerClose>
        </div>

        <div className="overflow-y-auto">
          {status === "pending" && (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                  key={i}
                  className="flex gap-3 px-4 py-3"
                >
                  <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-500 text-sm">載入失敗，請關閉後重試</p>
            </div>
          )}

          {status === "success" && products.length === 0 && (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-500 text-sm">目前沒有可選商品</p>
            </div>
          )}

          {status === "success" && products.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {products.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleProductClick(product)}
                    className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100">
                      {product.img_url ? (
                        <img
                          src={product.img_url}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="absolute top-0 left-0 h-full w-full animate-pulse bg-gray-100" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-medium text-gray-800 text-sm">
                        {product.name}
                      </p>
                      <p className="line-clamp-1 text-gray-400 text-xs">
                        {product.description}
                      </p>

                      <p
                        className={cn(
                          "font-bold text-red-500 text-sm",
                          !displayPrice && "invisible",
                        )}
                      >
                        NT$ {numeral(product.unit_price).format("0,0")}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
});
