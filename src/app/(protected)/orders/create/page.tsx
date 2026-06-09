"use client";

import {
  faChevronLeft,
  faCircleExclamation,
  faLock,
  faMinus,
  faPlus,
  faShoppingCart,
  faTruck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";

type Product = {
  id: string;
  name: string;
  spec: string;
  price: number;
  image: string;
  alt: string;
};

type OrderItem = Product & { qty: number };

const availableProducts: Product[] = [
  {
    id: "salmon-fillet-300g",
    name: "頂級挪威鮮切鮭魚菲力",
    spec: "300g (厚切)",
    price: 380,
    image: "/placeholder.jpg",
    alt: "鮭魚",
  },
  {
    id: "salmon-steak-500g",
    name: "智利厚切鮭魚排 家庭號",
    spec: "500g",
    price: 520,
    image: "/placeholder.jpg",
    alt: "鮭魚排",
  },
  {
    id: "salmon-belly-250g",
    name: "炙燒級鮭魚腹排",
    spec: "250g",
    price: 320,
    image: "/placeholder.jpg",
    alt: "鮭魚腹排",
  },
  {
    id: "salmon-cube-600g",
    name: "鮭魚丁料理包",
    spec: "600g",
    price: 460,
    image: "/placeholder.jpg",
    alt: "鮭魚丁",
  },
];

const normalizeQty = (value: string | number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

export default function Page() {
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: "salmon-fillet-300g",
      name: "頂級挪威鮮切鮭魚菲力",
      spec: "300g (厚切)",
      price: 380,
      qty: 2,
      image: "/placeholder.jpg",
      alt: "鮭魚",
    },
    {
      id: "salmon-steak-500g",
      name: "智利厚切鮭魚排 家庭號",
      spec: "500g",
      price: 520,
      qty: 1,
      image: "/placeholder.jpg",
      alt: "鮭魚排",
    },
  ]);

  const updateQty = (id: string, nextQty: string | number) => {
    const safeQty = normalizeQty(nextQty);
    setOrderItems((items) =>
      items.map((item) => (item.id === id ? { ...item, qty: safeQty } : item)),
    );
  };

  const removeItem = (id: string) => {
    setOrderItems((items) => items.filter((item) => item.id !== id));
  };

  const addProduct = (id: string) => {
    const product = availableProducts.find((p) => p.id === id);
    if (!product) return;

    const existing = orderItems.find((item) => item.id === id);
    if (existing) {
      updateQty(id, existing.qty + 1);
    } else {
      setOrderItems((items) => [...items, { ...product, qty: 1 }]);
    }
    setAddProductOpen(false);
  };

  return (
    <div className="bg-gray-50 pb-48 text-gray-800 antialiased">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <a
          href="/products"
          className="-left-2 relative flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </a>
        <h1 className="font-bold text-gray-800 text-lg">訂單明細</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex flex-col gap-3 p-3">
        {/* Product Summary */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-4 py-3">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="mr-2 text-gray-400"
              />
              <h3 className="font-bold text-gray-700 text-sm">
                商品清單 ({orderItems.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setAddProductOpen(true)}
              className="rounded bg-salmon-50 px-2 py-1 font-medium text-[10px] text-salmon-600"
            >
              新增
            </button>
          </div>

          <div className="space-y-4 p-4">
            {orderItems.length === 0 ? (
              <div className="rounded-xl border border-gray-200 border-dashed bg-gray-50/80 py-8 text-center">
                <p className="text-gray-500 text-sm">目前尚未加入商品</p>
                <p className="mt-1 text-gray-400 text-xs">
                  請點擊上方「新增」開始選購
                </p>
              </div>
            ) : (
              orderItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-1 font-medium text-gray-800 text-sm">
                        {item.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-500"
                        aria-label={`刪除 ${item.name}`}
                      >
                        刪除
                      </button>
                    </div>

                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {item.spec}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-bold text-salmon-600 text-sm">
                        NT$ {item.price}
                      </span>

                      <div className="inline-flex overflow-hidden rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="h-9 w-9 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                          aria-label="減少數量"
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-xs" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={item.qty}
                          onChange={(e) => updateQty(item.id, e.target.value)}
                          className="w-14 bg-white text-center font-semibold text-gray-800 focus:outline-none"
                          aria-label="輸入數量"
                        />
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="h-9 w-9 bg-gray-50 text-gray-600 transition-transform hover:bg-gray-100 active:scale-95"
                          aria-label="增加數量"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shipping Form */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center border-gray-100 border-b bg-gray-50/50 px-4 py-3">
            <FontAwesomeIcon icon={faTruck} className="mr-2 text-gray-400" />
            <h3 className="font-bold text-gray-700 text-sm">收件與配送資訊</h3>
          </div>

          <div className="space-y-4 p-4">
            <div>
              <label
                htmlFor="store"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                店別 <span className="text-red-500">*</span>
              </label>
              <select
                id="store"
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 text-sm focus:border-salmon-500 focus:bg-white focus:outline-none"
              >
                <option value="">選擇店別</option>
                <option value="TPE">饗食天堂 - 台北市</option>
                <option value="NWT">饗食天堂 - 新北市</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                收件地址 <span className="text-red-500">*</span>
              </label>
              <input
                id="address"
                type="text"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:border-salmon-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-salmon-500"
                placeholder="詳細地址、樓層"
              />
            </div>

            <div>
              <label
                htmlFor="note"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                訂單備註 (選填)
              </label>
              <textarea
                id="note"
                className="h-20 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:border-salmon-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-salmon-500"
                placeholder="有沒有什麼要告訴我們的？例如：請交由管理室代收..."
              ></textarea>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Submission Bar */}
      <div className="fixed bottom-0 left-0 z-40 w-full border-gray-100 border-t bg-white pb-safe shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="p-3">
          <button
            type="button"
            onClick={() => confirmDialogRef.current?.showModal()}
            aria-label="開啟送出訂單確認視窗"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-salmon-500 py-3.5 font-bold text-sm text-white shadow-md transition-all hover:bg-salmon-600 active:scale-[0.98] lg:text-base"
          >
            <FontAwesomeIcon icon={faLock} className="text-sm opacity-80" />
            送出
          </button>
          <div className="mt-2 text-center text-[10px] text-gray-400">
            點擊按鈕即表示您同意我們的
            <a href="/terms" className="mx-1 text-gray-500 underline">
              服務條款
            </a>
            與
            <a href="/privacy" className="mx-1 text-gray-500 underline">
              隱私政策
            </a>
          </div>
        </div>
      </div>

      {/* Add Product Drawer */}
      <Drawer open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DrawerContent className="max-h-[82vh] rounded-t-3xl pb-safe">
          <DrawerTitle className="hidden"></DrawerTitle>
          <DrawerDescription className="hidden"></DrawerDescription>
          <div className="flex items-center justify-between border-gray-100 border-b px-4 py-3">
            <h2 className="font-bold text-base text-gray-800">新增商品</h2>
            <DrawerClose asChild>
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
                aria-label="關閉新增商品視窗"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </DrawerClose>
          </div>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
            {availableProducts.map((product) => {
              const isInOrder = orderItems.some(
                (item) => item.id === product.id,
              );
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-100 px-3 py-3 text-left transition-colors hover:border-salmon-300"
                  aria-label={`加入 ${product.name}`}
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100">
                    <img
                      src={product.image}
                      alt={product.alt}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-gray-800 text-sm">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {product.spec}
                    </p>
                    <p className="mt-1 font-bold text-salmon-600 text-sm">
                      NT$ {product.price}
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-2 py-1 text-[10px] ${
                      isInOrder
                        ? "bg-gray-100 text-gray-500"
                        : "bg-salmon-50 text-salmon-600"
                    }`}
                  >
                    {isInOrder ? "已在清單" : "新增"}
                  </div>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Confirm Order Dialog */}
      <dialog
        ref={confirmDialogRef}
        className="fixed inset-0 z-50 m-0 h-full w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent"
        aria-labelledby="confirm-order-modal-title"
        aria-describedby="confirm-order-modal-content"
        onClick={(e) => {
          if (e.target === confirmDialogRef.current)
            confirmDialogRef.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") confirmDialogRef.current?.close();
        }}
      >
        <div className="flex h-full items-center justify-center bg-gray-900/45 px-4 py-6">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-gray-100 border-b px-5 pt-5 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-salmon-50 text-salmon-500">
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  className="text-base"
                />
              </div>
              <div className="flex-1">
                <h2
                  id="confirm-order-modal-title"
                  className="font-bold text-base text-gray-800"
                >
                  送出訂單
                </h2>
                <p
                  id="confirm-order-modal-content"
                  className="mt-1 text-gray-500 text-sm leading-6"
                >
                  訂單送出後將進入處理流程。請再次確認商品、配送資訊與備註內容是否正確。
                </p>
              </div>
              <button
                type="button"
                className="h-8 w-8 rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="關閉確認視窗"
                onClick={() => confirmDialogRef.current?.close()}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="bg-gray-50/80 px-5 py-4 text-gray-500 text-xs leading-5">
              送出後若需修改內容，請聯繫客服協助處理。
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              <button
                type="button"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-600 text-sm transition-colors hover:bg-gray-50"
                onClick={() => confirmDialogRef.current?.close()}
              >
                再檢查一下
              </button>
              <button
                type="button"
                onClick={() => confirmDialogRef.current?.close()}
                className="w-full rounded-xl bg-salmon-500 px-4 py-3 font-semibold text-sm text-white shadow-md transition-colors hover:bg-salmon-600"
              >
                送出訂單
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
