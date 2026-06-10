"use client";

import {
  faMinus,
  faPlus,
  faShoppingCart,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

export default function Page() {
  const [open, setOpen] = useState(false);

  const { liff } = useLIFF();
  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return await liff.getProfile();
    },
  });

  const userId = profile?.userId;

  const { data: productsRes } = useQuery({
    queryKey: [userId, "products"],
    queryFn: async () => {
      return api
        .get(`api/liff/${userId}/products`, {
          searchParams: {
            customer_id: 208682,
            division_id: 240,
            page: 1,
            pageSize: 20,
          },
        })
        .json();
    },
    enabled: !!userId,
  });

  const products = productsRes?.data || [];
  const meta = productsRes?.meta || {};

  console.log({ products, meta });

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
        <div className="product-item flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="relative pb-[100%]">
            <img
              src="/placeholder.jpg"
              alt="鮭魚"
              className="absolute top-0 left-0 h-full w-full object-contain"
            />
            <div className="absolute top-2 left-2 rounded bg-red-500 px-2 py-0.5 font-bold text-[10px] text-white shadow">
              熱銷
            </div>
          </div>
          <div className="flex flex-1 flex-col p-2.5">
            <h3 className="mb-1 line-clamp-2 font-medium text-gray-800 text-sm leading-snug">
              頂級挪威鮮切鮭魚菲力 (300g)
            </h3>
            <p className="product-description mb-0.5 text-gray-400 text-xs">
              嚴選大西洋鮭魚，定重切割、貼體包裝
            </p>
            <div className="mt-auto flex items-end justify-between pt-2">
              <div>
                <p className="font-bold text-base text-red-500 leading-none">
                  NT$ 380
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-salmon-500 text-white shadow-sm transition-transform hover:bg-salmon-600 active:scale-95"
              >
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <NavBottom />

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[86vh] rounded-t-3xl pb-safe">
          <DrawerTitle className="hidden"></DrawerTitle>
          <DrawerDescription className="hidden"></DrawerDescription>
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
                  src="/placeholder.jpg"
                  alt="商品圖片"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                  商品名稱
                </h3>
                <p className="mt-1 text-gray-500 text-xs">商品描述</p>
                <p className="mt-2 font-bold text-lg text-red-500">NT$ 0</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-800 text-sm">
                商品規格
              </h4>
              <div className="grid grid-cols-2 gap-2"></div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-800 text-sm">
                購買數量
              </h4>
              <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  className="h-10 w-10 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                  aria-label="減少數量"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <input
                  type="number"
                  min="0"
                  step="1"
                  defaultValue="1"
                  className="w-16 bg-white text-center font-semibold text-gray-800 focus:outline-none"
                  aria-label="輸入數量"
                />
                <button
                  type="button"
                  className="h-10 w-10 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                  aria-label="增加數量"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-salmon-500 py-3.5 font-semibold text-sm text-white shadow-md transition-all hover:bg-salmon-600 active:scale-[0.98]"
            >
              確定
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
