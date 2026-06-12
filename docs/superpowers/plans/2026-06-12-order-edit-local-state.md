# Order Edit Local State Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the order edit page manage its item list via local React state (sourced from the fetched order), wire all item operations (add/remove/qty), and call `api.updateOrder` on submit — with zero localStorage side-effects.

**Architecture:** Local state is initialized from `order` once (via `useEffect` + initialized flag), so user edits are independent from the TanStack Query cache. `AddProductDrawer` receives an `onAddItem` callback instead of calling `useCart`, keeping localStorage untouched.

**Tech Stack:** Next.js 16 App Router, React 19, TanStack Query v5, NiceModal, TypeScript, Biome (lint/format)

---

## File Map

| File | Change |
|---|---|
| `src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx` | Remove `useCart`; add `onAddItem` callback prop |
| `src/app/(protected)/orders/[id]/edit/page.tsx` | Local state, handlers, mutation fix, UI wiring |

---

### Task 1: Refactor `AddProductDrawer` — remove `useCart`, accept `onAddItem` callback

**Files:**
- Modify: `src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx`

- [ ] **Step 1: Replace the file content**

Replace the entire file with the following. The only behavioral changes are:
- `useCart` import and `addItem` call removed
- `onAddItem: (product: Product, qty: number) => void` added to props
- After `ProductDrawer` resolves, call `onAddItem` + hide both modals

```tsx
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
import { api } from "@/services/client";

export const AddProductDrawer = NiceModal.create<{
  userId: string;
  selectedCustomer: Record<"customer_id" | "division_id", string>;
  onAddItem: (product: Product, qty: number) => void;
}>(({ userId, selectedCustomer, onAddItem }) => {
  const modal = useModal();

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
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100">
                      <img
                        src={product.img_url || "/placeholder.jpg"}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-medium text-gray-800 text-sm">
                        {product.name}
                      </p>
                      <p className="line-clamp-1 text-gray-400 text-xs">
                        {product.description}
                      </p>
                      <p className="font-bold text-red-500 text-sm">
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
```

- [ ] **Step 2: Verify lint passes**

```bash
yarn lint
```

Expected: no errors in `add-product-drawer.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/app/\(protected\)/orders/\[id\]/edit/_components/add-product-drawer.tsx
git commit -m "refactor(order-edit): remove useCart from AddProductDrawer, add onAddItem callback"
```

---

### Task 2: Refactor `page.tsx` — local state, handlers, mutation fix, UI wiring

**Files:**
- Modify: `src/app/(protected)/orders/[id]/edit/page.tsx`

- [ ] **Step 1: Replace the file content**

Replace the entire file with the following. Key changes from the original:
- Added `useEffect` to React imports
- Added `import type { Product }` from product-drawer
- Removed orphaned `selectedAddress`/`setSelectedAddress` state (made orphan by wiring `selectedAddressId` to the select)
- Added `localItems`, `deliverDate`, `selectedAddressId`, `initialized` state
- `useEffect` initializes all four from `order` exactly once
- `totalCount` now uses `localItems`
- `removeItem`, `updateQty`, `onAddItem` functions implemented
- `mutation` now calls `api.updateOrder(userId, orderNumber, payload)`
- `handleSubmit` uses `localItems` and local state for payload
- All empty `onClick`/`onChange` handlers wired
- `NiceModal.show(AddProductDrawer, ...)` passes `onAddItem`
- Deliver date input and address select wired to local state
- `console.log` removed

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import numeral from "numeral";
import { use, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { Product } from "@/app/(protected)/products/_components/product-drawer";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";
import type { OrderDetailItem, OrderDetailResponse } from "../_components/types";
import { AddProductDrawer } from "./_components/add-product-drawer";

type UpdateOrderPayload = {
  deliver_date: string;
  address_id: string;
  customer_id: string;
  division_id: string;
  remark: string;
  items: Array<{
    product_id: string;
    product_img_url: string;
    product_name: string;
    product_desc: string;
    box_net_weight: string;
    unit: string;
    quantity: string;
    price: string;
    weight: string;
    sub_total: string;
    final_quantity: string;
    final_weight: string;
    final_total: string;
    remark: string;
  }>;
};

export default function Page({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = use(params);
  const orderNumber = typeof id === "string" ? id : undefined;

  const router = useRouter();
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const [address, setAddress] = useState("");
  const [remark, setRemark] = useState("");
  const [localItems, setLocalItems] = useState<OrderDetailItem[]>([]);
  const [deliverDate, setDeliverDate] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { liff } = useLIFF();
  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return liff.getProfile();
    },
  });
  const userId = profile?.userId;

  const { data: orderRes } = useQuery({
    queryKey: [userId, "orders", orderNumber],
    queryFn: () => {
      if (!userId || !orderNumber)
        throw new Error("Missing userId or orderNumber");
      return api
        .getOrderDetail(userId, orderNumber)
        .json<OrderDetailResponse>();
    },
    enabled: !!userId && !!orderNumber,
  });

  const order = orderRes?.data;

  useEffect(() => {
    if (order && !initialized) {
      setLocalItems(order.items);
      setDeliverDate(order.deliver_date);
      setSelectedAddressId(order.address.id);
      setRemark(order.remark);
      setInitialized(true);
    }
  }, [order, initialized]);

  const totalCount = localItems.reduce((sum, item) => sum + item.quantity, 0);

  function removeItem(productId: string) {
    setLocalItems((prev) => prev.filter((i) => i.product_id !== productId));
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setLocalItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? { ...i, quantity: qty } : i,
      ),
    );
  }

  function onAddItem(product: Product, qty: number) {
    setLocalItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_img_url: product.img_url,
          product_name: product.name,
          product_desc: product.description,
          unit: "",
          quantity: qty,
          weight: 0,
          box_net_weight: product.box_net_weight,
          price: product.unit_price,
          deal_price: product.unit_price,
          sub_total: product.unit_price * qty,
          final_quantity: qty,
          final_weight: 0,
          final_total: product.unit_price * qty,
          remark: product.remark,
        },
      ];
    });
  }

  const mutation = useMutation({
    mutationFn: (payload: UpdateOrderPayload) =>
      api.updateOrder(userId as string, orderNumber as string, payload).json(),
    onSuccess: () => {
      router.replace("/orders");
    },
    onError: () => {
      toast.error("更新訂單失敗，請稍後再試");
    },
  });

  function handleSubmit() {
    if (!userId || localItems.length === 0) return;
    const payload: UpdateOrderPayload = {
      deliver_date: deliverDate,
      address_id: selectedAddressId,
      customer_id: order?.customer?.id ?? "",
      division_id: order?.division?.id ?? "",
      remark,
      items: localItems.map((item) => ({
        product_id: item.product_id,
        product_img_url: item.product_img_url,
        product_name: item.product_name,
        product_desc: item.product_desc,
        box_net_weight: String(item.box_net_weight),
        unit: item.unit,
        quantity: String(item.quantity),
        price: String(item.price),
        weight: String(item.weight),
        sub_total: String(item.sub_total),
        final_quantity: String(item.final_quantity),
        final_weight: String(item.final_weight),
        final_total: String(item.final_total),
        remark: item.remark,
      })),
    };
    mutation.mutate(payload);
    confirmDialogRef.current?.close();
  }

  return (
    <div className="bg-gray-50 pb-48 text-gray-800 antialiased">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <a
          href="/products"
          className="-left-2 relative flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </a>
        <h1 className="font-bold text-gray-800 text-lg">編輯訂單</h1>
        <div className="w-8" />
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
                商品清單 ({totalCount})
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                NiceModal.show(AddProductDrawer, {
                  userId: userId ?? "",
                  selectedCustomer: {
                    customer_id: order?.customer?.id ?? "",
                    division_id: order?.division?.id ?? "",
                  },
                  onAddItem,
                })
              }
              className="flex items-center gap-1 rounded-lg bg-salmon-50 px-2.5 py-1.5 font-medium text-salmon-600 text-xs transition-colors hover:bg-salmon-100"
            >
              <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
              新增商品
            </button>
          </div>

          <div className="space-y-4 p-4">
            {localItems.length === 0 ? (
              <div className="rounded-xl border border-gray-200 border-dashed bg-gray-50/80 py-8 text-center">
                <p className="text-gray-500 text-sm">目前尚未加入商品</p>
                <p className="mt-1 text-gray-400 text-xs">請返回商品頁面選購</p>
              </div>
            ) : (
              localItems.map((item) => (
                <div key={item.product_id} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100">
                    <img
                      src={item.product_img_url || "/placeholder.jpg"}
                      alt={item.product_name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-1 font-medium text-gray-800 text-sm">
                        {item.product_name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id)}
                        className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-500"
                        aria-label={`刪除 ${item.product_name}`}
                      >
                        刪除
                      </button>
                    </div>

                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {item.product_desc}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-bold text-salmon-600 text-sm">
                        NT$ {numeral(item.price).format("0,0")}
                      </span>

                      <div className="inline-flex overflow-hidden rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(item.product_id, item.quantity - 1)
                          }
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
                          value={item.quantity}
                          onChange={(e) =>
                            updateQty(
                              item.product_id,
                              Number(e.target.value),
                            )
                          }
                          className="w-14 bg-white text-center font-semibold text-gray-800 focus:outline-none"
                          aria-label="輸入數量"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(item.product_id, item.quantity + 1)
                          }
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
                htmlFor="deliver-date"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                配送日期 <span className="text-red-500">*</span>
              </label>
              <input
                id="deliver-date"
                type="date"
                value={deliverDate}
                onChange={(e) => setDeliverDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 text-sm focus:border-salmon-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="store"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                選擇地址 <span className="text-red-500">*</span>
              </label>
              <select
                id="store"
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 text-sm focus:border-salmon-500 focus:bg-white focus:outline-none"
              >
                <option value="">選擇地址</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="address-detail"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                地址詳情
              </label>
              <input
                id="address-detail"
                type="text"
                value={address}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:outline-none"
                placeholder="選擇地址後自動帶入"
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
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="h-20 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-shadow focus:border-salmon-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-salmon-500"
                placeholder="有沒有什麼要告訴我們的？例如：請交由管理室代收..."
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Submission Bar */}
      <div className="fixed bottom-0 left-0 z-40 w-full border-gray-100 border-t bg-white pb-safe shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="p-3">
          <button
            type="button"
            disabled={localItems.length === 0 || mutation.isPending}
            onClick={() => confirmDialogRef.current?.showModal()}
            aria-label="開啟送出訂單確認視窗"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-salmon-500 py-3.5 font-bold text-sm text-white shadow-md transition-all hover:bg-salmon-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 lg:text-base"
          >
            <FontAwesomeIcon icon={faLock} className="text-sm opacity-80" />
            {mutation.isPending ? "送出中..." : "送出"}
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
                onClick={handleSubmit}
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
```

- [ ] **Step 2: Verify lint passes**

```bash
yarn lint
```

Expected: no errors in `page.tsx`

- [ ] **Step 3: Format**

```bash
yarn format
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/orders/\[id\]/edit/page.tsx
git commit -m "feat(order-edit): wire local state, item ops, and updateOrder mutation"
```
