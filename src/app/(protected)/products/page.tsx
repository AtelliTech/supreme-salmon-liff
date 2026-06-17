"use client";

import NiceModal from "@ebay/nice-modal-react";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { match, P } from "ts-pattern";
import { NavBottom } from "@/components/nav-bottom";
import { useCart } from "@/hooks/use-cart";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";
import { ProductCard } from "./_components/product-card";
import type { ProductsResponse } from "./_components/product-drawer";
import {
  type Customer,
  loadCustomer,
  StoreSelectDrawer,
} from "./_components/store-select-drawer";
import { SwitchStoreDialog } from "./_components/switch-store-dialog";

export default function Page() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const { clearCart, totalCount } = useCart();

  const { liff } = useLIFF();
  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return await liff.getProfile();
    },
  });

  const userId = profile?.userId;

  function handleCustomerChange(customer: Customer) {
    clearCart();
    setSelectedCustomer(customer);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: handleCustomerChange is defined in component scope
  useEffect(() => {
    if (!userId) return;

    async function runStoreSelection() {
      const saved = loadCustomer();

      if (!saved) {
        const customer = await NiceModal.show(StoreSelectDrawer, { userId });
        if (!customer) return;
        handleCustomerChange(customer as Customer);
        return;
      }

      const wantsSwitch = await NiceModal.show(SwitchStoreDialog, {
        customer: saved,
      });

      if (wantsSwitch) {
        const customer = await NiceModal.show(StoreSelectDrawer, { userId });
        if (!customer) return;
        handleCustomerChange(customer as Customer);
      } else {
        setSelectedCustomer(saved);
      }
    }

    runStoreSelection();
  }, [userId]);

  const { data: productsRes, status } = useQuery({
    queryKey: [userId, "products", selectedCustomer],
    queryFn: async () => {
      if (!userId || !selectedCustomer) throw new Error("Not ready");
      return api
        .getProducts(userId, {
          customer_id: selectedCustomer.customer_id,
          division_id: selectedCustomer.division_id,
        })
        .json<ProductsResponse>();
    },
    enabled: !!userId && !!selectedCustomer,
  });

  const products = productsRes?.data ?? [];

  const productList = match({ status, products })
    .with({ status: "pending" }, () => (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={i}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="animate-pulse bg-gray-100 pb-[100%]" />
            <div className="space-y-2 p-2.5">
              <div className="h-3 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </>
    ))
    .with(
      { status: "success", products: P.when((p) => p.length === 0) },
      () => (
        <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
          <p className="font-medium text-gray-500 text-sm">目前沒有商品</p>
          <p className="mt-1 text-gray-400 text-xs">請稍後再試</p>
        </div>
      ),
    )
    .with({ status: "success" }, ({ products }) => (
      <>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </>
    ))
    .with({ status: "error" }, () => (
      <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
        <p className="font-medium text-gray-500 text-sm">載入失敗</p>
        <p className="mt-1 text-gray-400 text-xs">請重新整理頁面</p>
      </div>
    ))
    .exhaustive();

  return (
    <div className="no-scrollbar bg-gray-50 pb-20 text-gray-800 antialiased">
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

      {selectedCustomer && (
        <div className="flex items-center justify-between bg-salmon-50 px-4 py-3">
          <span className="text-salmon-700 text-xs">
            {selectedCustomer.customer_name} · {selectedCustomer.division_name}
          </span>
        </div>
      )}

      <div className="category-container no-scrollbar mb-2 overflow-x-auto whitespace-nowrap bg-white px-3 py-3 shadow-sm">
        <button
          type="button"
          className="category-item mr-2 inline-block rounded-full bg-salmon-500 px-4 py-1.5 font-medium text-sm text-white"
        >
          全部商品
        </button>
      </div>

      <main className="product-container grid grid-cols-2 gap-3 p-3">
        {productList}
      </main>

      <NavBottom />
    </div>
  );
}
