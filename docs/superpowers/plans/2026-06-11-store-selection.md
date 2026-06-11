# Store Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user visits `/products`, force them to select a store from their assigned customer list; persist the choice in localStorage and display it in a banner below the header.

**Architecture:** Three independent changes — (1) a bottom drawer for first-time store selection, (2) a dialog for subsequent visits asking whether to switch, (3) modifications to `products/page.tsx` that wire both together and replace the hardcoded customer/division IDs with the live selection.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, shadcn/ui (`Drawer`, `AlertDialog`), NiceModal (`@ebay/nice-modal-react`), TanStack Query v5, ky, Tailwind CSS v4, Biome (lint/format)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/(protected)/products/_components/store-select-drawer.tsx` | Create | Forced bottom drawer; fetches customer list; resolves with selected `Customer` |
| `src/app/(protected)/products/_components/switch-store-dialog.tsx` | Create | Alert dialog asking "switch?" — resolves `true`/`false` |
| `src/app/(protected)/products/page.tsx` | Modify | Mount-time selection flow, store banner, dynamic `getProducts` payload |

---

## Shared Type

Both new components and the page share this type. It is defined once in `store-select-drawer.tsx` and imported by the other files.

```ts
export type Customer = {
  customer_id: string;
  customer_name: string;
  division_id: string;
  division_name: string;
};
```

localStorage helper (also defined in `store-select-drawer.tsx` and imported elsewhere):

```ts
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
```

---

## Task 1: Create `StoreSelectDrawer`

**Files:**
- Create: `src/app/(protected)/products/_components/store-select-drawer.tsx`

This is a NiceModal-wrapped shadcn `Drawer`. It receives the LINE `userId` as a prop, calls `api.checkUser` via `useQuery`, lists each customer as `{customer_name} · {division_name}`, and resolves the modal with the selected `Customer`. The drawer **cannot be closed** — `onOpenChange` is a no-op and there is no close button.

- [ ] **Step 1: Create the file with the full implementation**

```tsx
"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/client";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";

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
      queryFn: () =>
        api.checkUser(userId).json<UserCheckResponse>(),
    });

    const customers = data?.data?.customers ?? [];

    function handleSelect(customer: Customer) {
      saveCustomer(customer);
      modal.resolve(customer);
      modal.hide();
    }

    return (
      <Drawer open={modal.visible} onOpenChange={() => {}}>
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
                  onClick={() => refetch()}
                  className="rounded-xl bg-salmon-500 px-5 py-2 font-semibold text-sm text-white"
                >
                  重試
                </button>
              </div>
            )}

            {status === "success" && (
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
```

- [ ] **Step 2: Lint and format**

```bash
yarn lint && yarn format
```

Expected: no errors (fix any Biome warnings before continuing).

- [ ] **Step 3: Commit**

```bash
git add src/app/\(protected\)/products/_components/store-select-drawer.tsx
git commit -m "feat(products): add StoreSelectDrawer component"
```

---

## Task 2: Create `SwitchStoreDialog`

**Files:**
- Create: `src/app/(protected)/products/_components/switch-store-dialog.tsx`

A NiceModal-wrapped `AlertDialog`. Receives the currently saved `Customer` as a prop. Resolves `true` if the user wants to switch, `false` if they want to keep the current selection.

- [ ] **Step 1: Create the file with the full implementation**

```tsx
"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Customer } from "./store-select-drawer";

export const SwitchStoreDialog = NiceModal.create<{ customer: Customer }>(
  ({ customer }) => {
    const modal = useModal();

    function handleKeep() {
      modal.resolve(false);
      modal.hide();
    }

    function handleSwitch() {
      modal.resolve(true);
      modal.hide();
    }

    return (
      <AlertDialog open={modal.visible} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>切換店家？</AlertDialogTitle>
            <AlertDialogDescription>
              目前選擇：{customer.customer_name} · {customer.division_name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleKeep}>否</AlertDialogCancel>
            <AlertDialogAction onClick={handleSwitch}>是</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
```

- [ ] **Step 2: Lint and format**

```bash
yarn lint && yarn format
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(protected\)/products/_components/switch-store-dialog.tsx
git commit -m "feat(products): add SwitchStoreDialog component"
```

---

## Task 3: Wire Everything in `products/page.tsx`

**Files:**
- Modify: `src/app/(protected)/products/page.tsx`

Changes:
1. Import `StoreSelectDrawer`, `SwitchStoreDialog`, `loadCustomer`, `Customer` from the new files
2. Add `selectedCustomer` state
3. Add a `useEffect` that runs the store-selection flow once on mount (after `userId` is available)
4. Add a store banner below `<header>` with a "切換" button
5. Replace hardcoded `customer_id`/`division_id` in the `getProducts` payload with `selectedCustomer` values
6. Gate `getProducts` query on `selectedCustomer` being set

- [ ] **Step 1: Replace the full contents of `products/page.tsx`**

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { match, P } from "ts-pattern";
import { NavBottom } from "@/components/nav-bottom";
import { useLIFF } from "@/providers/liff-providers";
import { api } from "@/services/client";
import { ProductCard } from "./_components/product-card";
import type { ProductsResponse } from "./_components/product-drawer";
import {
  type Customer,
  StoreSelectDrawer,
  loadCustomer,
} from "./_components/store-select-drawer";
import { SwitchStoreDialog } from "./_components/switch-store-dialog";

export default function Page() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const { liff } = useLIFF();
  const { data: profile } = useQuery({
    queryKey: ["liff.profile"],
    queryFn: async () => {
      if (!liff) throw new Error("LIFF not initialized");
      return await liff.getProfile();
    },
  });

  const userId = profile?.userId;

  useEffect(() => {
    if (!userId) return;

    async function runStoreSelection() {
      const saved = loadCustomer();

      if (!saved) {
        const customer = await NiceModal.show(StoreSelectDrawer, { userId });
        setSelectedCustomer(customer as Customer);
        return;
      }

      const wantsSwitch = await NiceModal.show(SwitchStoreDialog, {
        customer: saved,
      });

      if (wantsSwitch) {
        const customer = await NiceModal.show(StoreSelectDrawer, { userId });
        setSelectedCustomer(customer as Customer);
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
    if (!userId) return;
    const wantsSwitch = await NiceModal.show(SwitchStoreDialog, {
      customer: selectedCustomer!,
    });
    if (wantsSwitch) {
      const customer = await NiceModal.show(StoreSelectDrawer, { userId });
      setSelectedCustomer(customer as Customer);
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
            <span className="-top-1.5 -right-1.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white">
              2
            </span>
          </a>
        </div>
      </header>

      {selectedCustomer && (
        <div className="flex items-center justify-between bg-salmon-50 px-4 py-2">
          <span className="text-salmon-700 text-xs">
            目前店家：{selectedCustomer.customer_name} ·{" "}
            {selectedCustomer.division_name}
          </span>
          <button
            type="button"
            onClick={handleSwitchStore}
            className="rounded-full bg-salmon-100 px-3 py-1 font-medium text-salmon-700 text-xs transition-colors hover:bg-salmon-200"
          >
            切換
          </button>
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

- [ ] **Step 2: Lint and format**

```bash
yarn lint && yarn format
```

Expected: no errors.

- [ ] **Step 3: Verify visually**

Start the dev server and visit `/products`:

```bash
yarn dev
```

Check these scenarios:

| Scenario | Expected |
|----------|----------|
| First visit (no localStorage) | Bottom drawer appears immediately, no close button visible |
| Select a store | Drawer closes, banner appears below header: "目前店家：X · Y" |
| Navigate away and back to `/products` | SwitchStoreDialog appears with "切換店家？" and current store name |
| Click "否" | Dialog closes, original store banner is shown |
| Click "是" | StoreSelectDrawer appears again; selecting new store updates the banner |
| Click "切換" button in banner | Same flow as clicking "是" in the dialog |
| API error in drawer | Error message shown with 重試 button |

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/products/page.tsx
git commit -m "feat(products): wire store selection flow with banner and dynamic payload"
```
