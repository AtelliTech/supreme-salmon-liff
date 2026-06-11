# Edit Order — Add Product Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "+ 新增商品" button to the order edit page that opens a bottom-sheet drawer listing all available products; tapping a product opens the existing `ProductDrawer` to choose quantity, then adds it to the cart.

**Architecture:** Create a new `AddProductDrawer` NiceModal component that fetches products and renders a scrollable list. Tapping a product delegates to the existing `ProductDrawer` for qty selection + cart update. The edit page's product card header gets a trigger button that calls `NiceModal.show(AddProductDrawer, ...)`.

**Tech Stack:** Next.js App Router, React 19, NiceModal (nice-modal-react), TanStack Query v5, ky, shadcn Drawer (vaul), Tailwind CSS v4, FontAwesome icons.

---

### Task 1: Create `AddProductDrawer` component

**Files:**
- Create: `src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx`

- [ ] **Step 1: Create the `_components` directory and the component file**

```bash
mkdir -p src/app/\(protected\)/orders/\[id\]/edit/_components
```

- [ ] **Step 2: Write the component**

Create `src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx` with:

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
} from "@/app/(protected)/products/_components/product-drawer";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useCart } from "@/hooks/use-cart";
import { api } from "@/services/client";
import type { Customer } from "@/app/(protected)/products/_components/store-select-drawer";
import type { ProductsResponse } from "@/app/(protected)/products/_components/product-drawer";

export const AddProductDrawer = NiceModal.create<{
  userId: string;
  selectedCustomer: Customer;
}>(({ userId, selectedCustomer }) => {
  const modal = useModal();
  const { addItem } = useCart();

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

  function handleProductTap(product: Product) {
    NiceModal.show(ProductDrawer, { product }).then((result) => {
      if (!result) return;
      const { product: selected, qty } = result as ProductDrawerResult;
      addItem(selected, qty);
      NiceModal.hide(ProductDrawer);
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
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                  key={i}
                  className="flex gap-3"
                >
                  <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-gray-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm">載入失敗，請關閉後重試</p>
            </div>
          )}

          {status === "success" && products.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm">目前沒有可選商品</p>
            </div>
          )}

          {status === "success" && products.length > 0 && (
            <div className="divide-y divide-gray-100">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductTap(product)}
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
                    <p className="line-clamp-2 font-medium text-gray-800 text-sm leading-snug">
                      {product.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-gray-400 text-xs">
                      {product.description}
                    </p>
                    <p className="mt-1 font-bold text-red-500 text-sm">
                      NT$ {numeral(product.unit_price).format("0,0")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
});
```

- [ ] **Step 3: Verify lint passes**

```bash
yarn lint
```

Expected: no errors related to the new file.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/orders/\[id\]/edit/_components/add-product-drawer.tsx
git commit -m "feat(edit-order): add AddProductDrawer component"
```

---

### Task 2: Wire the drawer into the edit page

**Files:**
- Modify: `src/app/(protected)/orders/[id]/edit/page.tsx`

- [ ] **Step 1: Add the import for `AddProductDrawer` and `NiceModal`**

In `page.tsx`, NiceModal is not yet imported. Add these two imports alongside the existing imports:

```tsx
import NiceModal from "@ebay/nice-modal-react";
import { AddProductDrawer } from "./_components/add-product-drawer";
```

- [ ] **Step 2: Add the "+ 新增商品" button in the card header**

Find the existing 商品清單 card header block (around line 177):

```tsx
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
```

Replace it with:

```tsx
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
  {userId && selectedCustomer && (
    <button
      type="button"
      onClick={() =>
        NiceModal.show(AddProductDrawer, { userId, selectedCustomer })
      }
      className="flex items-center gap-1 rounded-lg bg-salmon-50 px-2.5 py-1.5 font-medium text-salmon-600 text-xs transition-colors hover:bg-salmon-100"
    >
      <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
      新增商品
    </button>
  )}
</div>
```

Note: `faPlus` is already imported at the top of the file.

- [ ] **Step 3: Verify lint and format**

```bash
yarn lint && yarn format
```

Expected: no errors, formatting applied.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/orders/\[id\]/edit/page.tsx
git commit -m "feat(edit-order): wire AddProductDrawer trigger to product list header"
```
