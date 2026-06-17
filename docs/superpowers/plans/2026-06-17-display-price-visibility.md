# Display Price Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When `checkUser` returns `display_price: "N"`, all price elements across the app are visually hidden (`visibility: hidden`) without removing data or breaking layout.

**Architecture:** A new `UserSettingsProvider` reads `display_price` from the existing `checkUser` query in `(protected)/layout.tsx` and exposes it via React context. All price-displaying components consume `useUserSettings()` and apply `invisible` Tailwind class conditionally.

**Tech Stack:** React context, TanStack Query (existing), Tailwind CSS (`invisible` utility), `clsx`/`tailwind-merge` via `cn()`

---

## File Map

| Action | File |
|--------|------|
| Create | `src/providers/user-settings-provider.tsx` |
| Modify | `src/app/(protected)/layout.tsx` |
| Modify | `src/app/(protected)/products/_components/product-card.tsx` |
| Modify | `src/app/(protected)/products/_components/product-drawer.tsx` |
| Modify | `src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx` |
| Modify | `src/app/(protected)/orders/create/page.tsx` |
| Modify | `src/app/(protected)/orders/[id]/_components/order-items-card.tsx` |

---

### Task 1: Create UserSettingsProvider

**Files:**
- Create: `src/providers/user-settings-provider.tsx`

- [ ] **Step 1: Create the provider file**

```tsx
"use client";

import { createContext, useContext } from "react";

type UserSettings = {
  displayPrice: boolean;
};

const UserSettingsContext = createContext<UserSettings>({ displayPrice: true });

export function UserSettingsProvider({
  children,
  displayPrice,
}: React.PropsWithChildren<{ displayPrice: boolean }>) {
  return (
    <UserSettingsContext.Provider value={{ displayPrice }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings(): UserSettings {
  return useContext(UserSettingsContext);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors related to the new file.

- [ ] **Step 3: Commit**

```bash
git add src/providers/user-settings-provider.tsx
git commit -m "feat: add UserSettingsProvider for display_price context"
```

---

### Task 2: Wire UserSettingsProvider into the protected layout

**Files:**
- Modify: `src/app/(protected)/layout.tsx`

- [ ] **Step 1: Update the layout**

Replace the full file content with:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLIFF } from "@/providers/liff-providers";
import { UserSettingsProvider } from "@/providers/user-settings-provider";
import { api } from "@/services/client";

type UserCheckResponse = {
  data: {
    is_customer: string;
    display_price: "Y" | "N";
    code: number;
  };
};

export default function Layout({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const { liff } = useLIFF();

  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return await liff.getProfile();
    },
    enabled: !!liff,
  });

  const userId = profile?.userId;

  const { data: userCheck, status } = useQuery({
    queryKey: ["/api/liff/user_check", userId],
    queryFn: () =>
      api
        .checkUser(userId as string)
        .json<UserCheckResponse>(),
    enabled: !!userId,
  });

  const isNotCustomer =
    status === "success" && userCheck?.data?.is_customer !== "Y";

  useEffect(() => {
    if (isNotCustomer) {
      router.replace("/pending");
      return;
    }
  }, [isNotCustomer, router]);

  if (status !== "success" || isNotCustomer) {
    return null;
  }

  const displayPrice = userCheck?.data?.display_price !== "N";

  return (
    <UserSettingsProvider displayPrice={displayPrice}>
      {children}
    </UserSettingsProvider>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(protected)/layout.tsx"
git commit -m "feat: wire UserSettingsProvider into protected layout"
```

---

### Task 3: Hide price in ProductCard

**Files:**
- Modify: `src/app/(protected)/products/_components/product-card.tsx`

- [ ] **Step 1: Add `cn` import and `useUserSettings`, apply `invisible` class**

Replace the full file content with:

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import numeral from "numeral";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/providers/user-settings-provider";
import { useCart } from "@/hooks/use-cart";
import {
  type Product,
  ProductDrawer,
  type ProductDrawerResult,
} from "./product-drawer";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { displayPrice } = useUserSettings();

  function handleAddToCart() {
    NiceModal.show(ProductDrawer, { product }).then((result) => {
      if (!result) return;
      const { product: selectedProduct, qty } = result as ProductDrawerResult;

      addItem(selectedProduct, qty);

      NiceModal.hide(ProductDrawer);
    });
  }

  return (
    <div className="product-item flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="relative pb-[100%]">
        {product.img_url ? (
          <img
            src={product.img_url}
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
          <p className={cn("font-bold text-base text-red-500 leading-none", !displayPrice && "invisible")}>
            NT$ {numeral(product.unit_price).format("0,0")}
          </p>
          <button
            type="button"
            onClick={handleAddToCart}
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(protected)/products/_components/product-card.tsx"
git commit -m "feat: hide price in ProductCard when display_price is N"
```

---

### Task 4: Hide price in ProductDrawer

**Files:**
- Modify: `src/app/(protected)/products/_components/product-drawer.tsx`

- [ ] **Step 1: Add `cn` import and `useUserSettings`, apply `invisible` class**

Replace the full file content with:

```tsx
"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { faMinus, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import numeral from "numeral";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/providers/user-settings-provider";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";

export type Product = {
  id: string;
  img_url: string;
  name: string;
  description: string;
  box_net_weight: number;
  unit_price: number;
  remark: string;
  category: { id: number; name: string };
};

export type ProductDrawerResult = { product: Product; qty: number };

export type ProductsResponse = {
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

export const ProductDrawer = NiceModal.create<{ product: Product }>(
  ({ product }) => {
    const modal = useModal();
    const [qty, setQty] = useState(1);
    const { displayPrice } = useUserSettings();

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
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100">
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
                <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                  {product.name}
                </h3>
                <p className="mt-1 text-gray-500 text-xs">
                  {product.description}
                </p>
                <p className={cn("mt-2 font-bold text-lg text-red-500", !displayPrice && "invisible")}>
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
  },
);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(protected)/products/_components/product-drawer.tsx"
git commit -m "feat: hide price in ProductDrawer when display_price is N"
```

---

### Task 5: Hide price in AddProductDrawer

**Files:**
- Modify: `src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx`

- [ ] **Step 1: Add `cn` import and `useUserSettings`, apply `invisible` class to the price `<p>`**

Add imports at the top (after existing imports):
```tsx
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/providers/user-settings-provider";
```

Inside the component (after `const modal = useModal();`), add:
```tsx
const { displayPrice } = useUserSettings();
```

Find this price element (line ~133):
```tsx
<p className="font-bold text-red-500 text-sm">
  NT$ {numeral(product.unit_price).format("0,0")}
</p>
```

Replace with:
```tsx
<p className={cn("font-bold text-red-500 text-sm", !displayPrice && "invisible")}>
  NT$ {numeral(product.unit_price).format("0,0")}
</p>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx"
git commit -m "feat: hide price in AddProductDrawer when display_price is N"
```

---

### Task 6: Hide price in Create Order page

**Files:**
- Modify: `src/app/(protected)/orders/create/page.tsx`

- [ ] **Step 1: Add `cn` import and `useUserSettings`, apply `invisible` class to the unit price span**

Add imports (after existing imports):
```tsx
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/providers/user-settings-provider";
```

Inside `Page()` component (after existing `const { items, updateQty, removeItem, clearCart, totalCount } = useCart();`), add:
```tsx
const { displayPrice } = useUserSettings();
```

Find this price element (~line 221):
```tsx
<span className="font-bold text-salmon-600 text-sm">
  NT$ {numeral(item.unit_price).format("0,0")}
</span>
```

Replace with:
```tsx
<span className={cn("font-bold text-salmon-600 text-sm", !displayPrice && "invisible")}>
  NT$ {numeral(item.unit_price).format("0,0")}
</span>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(protected)/orders/create/page.tsx"
git commit -m "feat: hide price in create order page when display_price is N"
```

---

### Task 7: Hide prices in OrderItemsCard

**Files:**
- Modify: `src/app/(protected)/orders/[id]/_components/order-items-card.tsx`

- [ ] **Step 1: Add `"use client"`, imports, and apply `invisible` to 3 price elements**

Replace the full file content with:

```tsx
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
                <span className={cn("font-bold text-red-500 text-sm", !displayPrice && "invisible")}>
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
      <div className="rounded-b-xl border-gray-100 border-t bg-gray-50/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-gray-500 text-sm">商品小計</span>
          <span className={cn("font-medium text-gray-800 text-sm", !displayPrice && "invisible")}>
            NT$ {amount.toLocaleString()}
          </span>
        </div>
        <div className="my-2 h-px w-full bg-gray-200" />
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-gray-800 text-sm">結帳總額</span>
          <span className={cn("font-bold text-lg text-red-500", !displayPrice && "invisible")}>
            NT$ {(final_amount || amount).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run lint and format**

```bash
yarn lint && yarn format
```

Expected: no errors or formatting changes.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(protected)/orders/[id]/_components/order-items-card.tsx"
git commit -m "feat: hide prices in OrderItemsCard when display_price is N"
```
