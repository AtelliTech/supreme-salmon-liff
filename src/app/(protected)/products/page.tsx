"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  faMinus,
  faPlus,
  faShoppingCart,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import numeral from "numeral";
import { useState } from "react";
import { match, P } from "ts-pattern";
import { NavBottom } from "@/components/nav-bottom";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";

type Product = {
  id: string;
  img_url: string;
  name: string;
  description: string;
  box_net_weight: number;
  unit_price: number;
  remark: string;
  category: { id: number; name: string };
};

type ProductsResponse = {
  status: string;
  code: number;
  data: Product[];
  meta: {
    page: number;
    page_size: number;
    total_count: number;
    page_count: number;
  };
};

const ProductDrawer = NiceModal.create<{ product: Product }>(({ product }) => {
  const modal = useModal();
  const [qty, setQty] = useState(1);

  return (
    <Drawer open={modal.visible} onOpenChange={() => modal.hide()}>
      <DrawerContent className="max-h-[86vh] rounded-t-3xl pb-safe">
        <DrawerTitle className="hidden" />
        <DrawerDescription className="hidden" />
        <div className="flex items-center justify-between border-gray-100 border-b px-4 py-3">
          <h2 className="font-bold text-base text-gray-800">商品選購</h2>
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

        <div className="space-y-4 overflow-y-auto p-4">
          <div className="flex gap-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100">
              <img
                src={product.img_url || "/placeholder.jpg"}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                {product.name}
              </h3>
              <p className="mt-1 text-gray-500 text-xs">
                {product.description}
              </p>
              <p className="mt-2 font-bold text-lg text-red-500">
                NT$ {numeral(product.unit_price).format("0,0")}
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-semibold text-gray-800 text-sm">
              購買數量
            </h4>
            <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-10 w-10 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                aria-label="減少數量"
              >
                <FontAwesomeIcon icon={faMinus} className="text-xs" />
              </button>
              <span className="w-16 bg-white text-center font-semibold text-gray-800">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="h-10 w-10 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                aria-label="增加數量"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => modal.resolve({ product, qty })}
            className="w-full rounded-xl bg-salmon-500 py-3.5 font-semibold text-sm text-white shadow-md transition-all hover:bg-salmon-600 active:scale-[0.98]"
          >
            確定
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
});

export default function Page() {
  const [payload] = useState({
    customer_id: 208682,
    division_id: 240,
  });

  const { liff } = useLIFF();
  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return await liff.getProfile();
    },
  });

  const userId = profile?.userId;

  const { data: productsRes, status } = useQuery({
    queryKey: [userId, "products", payload],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      return api.getProducts(userId, payload).json<ProductsResponse>();
    },
    enabled: !!userId,
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
          <div
            key={product.id}
            className="product-item flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="relative pb-[100%]">
              <img
                src={product.img_url || "/placeholder.jpg"}
                alt={product.name}
                className="absolute top-0 left-0 h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col p-2.5">
              <h3 className="mb-1 line-clamp-2 font-medium text-gray-800 text-sm leading-snug">
                {product.name}
              </h3>
              <p className="product-description mb-0.5 text-gray-400 text-xs">
                {product.description}
              </p>
              <div className="mt-auto flex items-end justify-between pt-2">
                <p className="font-bold text-base text-red-500 leading-none">
                  NT$ {numeral(product.unit_price).format("0,0")}
                </p>
                <button
                  type="button"
                  onClick={() => NiceModal.show(ProductDrawer, { product })}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-salmon-500 text-white shadow-sm transition-transform hover:bg-salmon-600 active:scale-95"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-sm" />
                </button>
              </div>
            </div>
          </div>
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
            <span className="-top-1.5 -right-1.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white">
              2
            </span>
          </a>
        </div>
      </header>

      <div className="category-container no-scrollbar mb-2 overflow-x-auto whitespace-nowrap bg-white px-3 py-3 shadow-sm">
        <a
          href="/#"
          className="category-item mr-2 inline-block rounded-full bg-salmon-500 px-4 py-1.5 font-medium text-sm text-white"
        >
          全部商品
        </a>
      </div>

      <main className="product-container grid grid-cols-2 gap-3 p-3">
        {productList}
      </main>

      <NavBottom />
    </div>
  );
}
