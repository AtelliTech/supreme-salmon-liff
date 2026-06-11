# Create Order Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement end-to-end order creation: product selection via localStorage cart → badge count → create order form → API submission.

**Architecture:** A `useCart` hook manages cart state in `localStorage` (`mowi_cart`), syncing across component instances via a custom DOM event. `ProductCard` captures `ProductDrawer` resolution and calls `addItem`. `products/page.tsx` reads `totalCount` for the badge and calls `clearCart` on customer switch. `orders/create/page.tsx` reads cart items, loads customers from `checkUser`, and submits via `createOrder` API.

**Tech Stack:** React 19, Next.js 16 App Router, TanStack Query v5, ky, NiceModal, sonner, localStorage

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/hooks/use-cart.ts` | Cart CRUD + localStorage sync via custom event |
| Modify | `src/app/(protected)/products/_components/product-card.tsx` | Capture ProductDrawer resolve → addItem |
| Modify | `src/app/(protected)/products/page.tsx` | Badge count, clear cart on customer switch |
| Modify | `src/components/providers.tsx` | Add `<Toaster />` |
| Modify | `src/app/(protected)/orders/create/page.tsx` | Real implementation: cart display, address select, createOrder submit |

---

### Task 1: Create `useCart` hook

**Files:**
- Create: `src/hooks/use-cart.ts`

- [ ] **Step 1: Create the file**

`src/hooks/use-cart.ts`:

```ts
import { useEffect, useState } from "react";

const CART_KEY = "mowi_cart";
const CART_EVENT = "mowi-cart-updated";

export type CartItem = {
  product_id: string;
  product_img_url: string;
  product_name: string;
  product_desc: string;
  box_net_weight: number;
  unit_price: number;
  remark: string;
  qty: number;
};

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return readCart();
  });

  useEffect(() => {
    const handler = () => setItems(readCart());
    window.addEventListener(CART_EVENT, handler);
    return () => window.removeEventListener(CART_EVENT, handler);
  }, []);

  function addItem(
    product: {
      id: string;
      img_url: string;
      name: string;
      description: string;
      box_net_weight: number;
      unit_price: number;
      remark: string;
    },
    qty: number,
  ) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      const next = existing
        ? prev.map((i) =>
            i.product_id === product.id ? { ...i, qty: i.qty + qty } : i,
          )
        : [
            ...prev,
            {
              product_id: product.id,
              product_img_url: product.img_url,
              product_name: product.name,
              product_desc: product.description,
              box_net_weight: product.box_net_weight,
              unit_price: product.unit_price,
              remark: product.remark,
              qty,
            },
          ];
      writeCart(next);
      return next;
    });
  }

  function updateQty(productId: string, qty: number) {
    setItems((prev) => {
      const next =
        qty <= 0
          ? prev.filter((i) => i.product_id !== productId)
          : prev.map((i) =>
              i.product_id === productId ? { ...i, qty } : i,
            );
      writeCart(next);
      return next;
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.product_id !== productId);
      writeCart(next);
      return next;
    });
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event(CART_EVENT));
    setItems([]);
  }

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, totalCount, addItem, updateQty, removeItem, clearCart };
}
```

- [ ] **Step 2: Run lint and format**

```bash
yarn lint && yarn format
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-cart.ts
git commit -m "feat: add useCart hook with localStorage persistence"
```

---

### Task 2: Update `product-card.tsx` to add to cart on confirm

**Files:**
- Modify: `src/app/(protected)/products/_components/product-card.tsx`

Only change: import `useCart`, call `addItem` after `ProductDrawer` resolves with the confirmed product and qty. The `+` button now triggers the drawer and handles the resolve.

- [ ] **Step 1: Replace the file content**

`src/app/(protected)/products/_components/product-card.tsx`:

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import numeral from "numeral";
import { useCart } from "@/hooks/use-cart";
import { type Product, ProductDrawer } from "./product-drawer";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="product-item flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="relative pb-[100%]">
        {product.img_url ? (
          <img
            src={product.img_url || "/placeholder.jpg"}
            alt={product.name}
            className="absolute top-0 left-0 h-full w-full object-contain"
          />
        ) : (
          <div className="absolute top-0 left-0 h-full w-full animate-pulse bg-gray-100" />
        )}
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
            onClick={() => {
              NiceModal.show(ProductDrawer, { product }).then((result) => {
                if (!result) return;
                const { product: p, qty } = result as {
                  product: Product;
                  qty: number;
                };
                addItem(p, qty);
              });
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-salmon-500 text-white shadow-sm transition-transform hover:bg-salmon-600 active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run lint and format**

```bash
yarn lint && yarn format
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(protected)/products/_components/product-card.tsx
git commit -m "feat: add product to cart when ProductDrawer confirms"
```

---

### Task 3: Update `products/page.tsx` — cart badge and customer switch clear

**Files:**
- Modify: `src/app/(protected)/products/page.tsx`

Changes:
1. Import `useCart`, destructure `totalCount` and `clearCart`
2. Extract `handleCustomerChange(customer)` that calls `clearCart()` then `setSelectedCustomer(customer)` — used when a new customer is selected (replaces raw `setSelectedCustomer` calls for new selections)
3. When user keeps the existing customer (the `else` branch in `runStoreSelection`), do NOT clear cart — keep `setSelectedCustomer(saved)` as is
4. Replace hardcoded badge `2` with `{totalCount}`, hide the `<span>` when `totalCount === 0`

- [ ] **Step 1: Replace the file content**

`src/app/(protected)/products/page.tsx`:

```tsx
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

  async function handleSwitchStore() {
    if (!userId || !selectedCustomer) return;
    const wantsSwitch = await NiceModal.show(SwitchStoreDialog, {
      customer: selectedCustomer,
    });
    if (wantsSwitch) {
      const customer = await NiceModal.show(StoreSelectDrawer, { userId });
      if (!customer) return;
      handleCustomerChange(customer as Customer);
    }
  }

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
            {selectedCustomer.customer_name} ·{" "}
            {selectedCustomer.division_name}
          </span>
        </div>
      )}

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
```

- [ ] **Step 2: Run lint and format**

```bash
yarn lint && yarn format
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(protected)/products/page.tsx
git commit -m "feat: show cart badge count and clear cart on customer switch"
```

---

### Task 4: Add Toaster and rewrite `orders/create/page.tsx`

**Files:**
- Modify: `src/components/providers.tsx`
- Modify: `src/app/(protected)/orders/create/page.tsx`

- [ ] **Step 1: Add `<Toaster />` to providers**

`src/components/providers.tsx`:

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
import { Toaster } from "@/components/ui/sonner";
import { useLIFF } from "@/providers/liff-providers";
import { ReactQueryProvider } from "@/providers/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const { liff } = useLIFF();

  if (!liff) {
    return null;
  }

  return (
    <ReactQueryProvider>
      <NiceModal.Provider>
        {children}
        <Toaster />
      </NiceModal.Provider>
    </ReactQueryProvider>
  );
}
```

- [ ] **Step 2: Replace `orders/create/page.tsx` with real implementation**

`src/app/(protected)/orders/create/page.tsx`:

```tsx
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
import { useMutation, useQuery } from "@tanstack/react-query";
import numeral from "numeral";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";
import { loadCustomer } from "@/app/(protected)/products/_components/store-select-drawer";

type CheckUserResponse = {
  status: string;
  code: number;
  data: {
    customers: Array<{
      customer_id: string;
      customer_name: string;
      division_id: string;
      division_name: string;
    }>;
  };
};

export default function Page() {
  const router = useRouter();
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [address, setAddress] = useState("");
  const [remark, setRemark] = useState("");

  const [selectedCustomer] = useState(() => {
    if (typeof window === "undefined") return null;
    return loadCustomer();
  });

  const { liff } = useLIFF();
  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return liff.getProfile();
    },
  });
  const userId = profile?.userId;

  const { items, updateQty, removeItem, clearCart, totalCount } = useCart();

  const { data: checkData } = useQuery({
    queryKey: ["/api/user_check", userId],
    queryFn: () => api.checkUser(userId!).json<CheckUserResponse>(),
    enabled: !!userId,
  });
  const customers = checkData?.data?.customers ?? [];

  useEffect(() => {
    if (!selectedCustomer) {
      router.replace("/products");
    }
  }, [selectedCustomer, router]);

  const mutation = useMutation({
    mutationFn: (payload: object) => api.createOrder(userId!, payload).json(),
    onSuccess: () => {
      clearCart();
      router.replace("/orders");
    },
    onError: () => {
      toast.error("送出訂單失敗，請稍後再試");
    },
  });

  if (!selectedCustomer) return null;

  function handleSubmit() {
    if (!userId || !selectedCustomer || items.length === 0) return;
    const payload = {
      deliver_date: "",
      address_id: "",
      customer_id: selectedCustomer.customer_id,
      division_id: selectedCustomer.division_id,
      remark,
      items: items.map((item) => ({
        product_id: item.product_id,
        product_img_url: item.product_img_url,
        product_name: item.product_name,
        product_desc: item.product_desc,
        box_net_weight: String(item.box_net_weight),
        unit: "",
        quantity: String(item.qty),
        price: String(item.unit_price),
        weight: "",
        sub_total: String(item.unit_price * item.qty),
        final_total: String(item.unit_price * item.qty),
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
        <h1 className="font-bold text-gray-800 text-lg">訂單明細</h1>
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
          </div>

          <div className="space-y-4 p-4">
            {items.length === 0 ? (
              <div className="rounded-xl border border-gray-200 border-dashed bg-gray-50/80 py-8 text-center">
                <p className="text-gray-500 text-sm">目前尚未加入商品</p>
                <p className="mt-1 text-gray-400 text-xs">
                  請返回商品頁面選購
                </p>
              </div>
            ) : (
              items.map((item) => (
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
                        NT$ {numeral(item.unit_price).format("0,0")}
                      </span>

                      <div className="inline-flex overflow-hidden rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(item.product_id, item.qty - 1)
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
                          value={item.qty}
                          onChange={(e) =>
                            updateQty(
                              item.product_id,
                              Math.max(0, Math.floor(Number(e.target.value))),
                            )
                          }
                          className="w-14 bg-white text-center font-semibold text-gray-800 focus:outline-none"
                          aria-label="輸入數量"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateQty(item.product_id, item.qty + 1)
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
                htmlFor="store"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                選擇地址 <span className="text-red-500">*</span>
              </label>
              <select
                id="store"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 text-sm focus:border-salmon-500 focus:bg-white focus:outline-none"
              >
                <option value="">選擇地址</option>
                {customers.map((c) => (
                  <option
                    key={`${c.customer_id}-${c.division_id}`}
                    value={`${c.customer_id}-${c.division_id}`}
                  >
                    {c.customer_name} · {c.division_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-1 block font-medium text-gray-600 text-xs"
              >
                收件地址
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
            disabled={items.length === 0 || mutation.isPending}
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

- [ ] **Step 3: Run lint and format**

```bash
yarn lint && yarn format
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/providers.tsx src/app/(protected)/orders/create/page.tsx
git commit -m "feat: implement create order page with cart, address select, and API submission"
```
