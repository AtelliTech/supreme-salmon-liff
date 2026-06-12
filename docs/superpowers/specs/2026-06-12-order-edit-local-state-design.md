# Order Edit Page — Local State & Mutation Refactor

## Goal

Wire up the order edit page (`src/app/(protected)/orders/[id]/edit/page.tsx`) so that:
1. Product list is editable (add / remove / change qty) using local state sourced from the fetched `order`
2. Submission calls `api.updateOrder` instead of `api.createOrder`
3. `AddProductDrawer` no longer touches localStorage (`mowi_cart`)

## Non-goals

- Loading address options into the select dropdown
- Modifying `use-cart.ts` or any localStorage key (`mowi_cart`, `mowi_selected_customer`)
- Any change outside the two files in scope

---

## Architecture

### Local state in `page.tsx`

Replace direct usage of `order?.items` with a local copy:

| State var | Type | Initialized from |
|---|---|---|
| `localItems` | `OrderDetailItem[]` | `order.items` |
| `deliverDate` | `string` | `order.deliver_date` |
| `selectedAddressId` | `string` | `order.address.id` |
| `initialized` | `boolean` | flag, prevents re-init on refetch |

Initialization is done once in a `useEffect` when `order` first becomes defined. The existing `remark` state is wired the same way.

### Item operations

Three functions operate on `setLocalItems`:

- **`removeItem(productId)`** — filters out the item
- **`updateQty(productId, qty)`** — if `qty <= 0`, removes; otherwise updates in place
- **`onAddItem(product, qty)`** — merges into existing item (cumulative qty) or appends a new `OrderDetailItem` with defaults (`weight: 0`, `unit: ""`, etc.)

### Mutation

```ts
api.updateOrder(userId, orderNumber, payload)
```

Payload items sourced from `localItems`.

---

## Component: `AddProductDrawer`

**Change:** Remove `useCart` dependency. Add `onAddItem: (product: Product, qty: number) => void` to props.

The drawer's `handleProductClick` calls `onAddItem(selected, qty)` after the `ProductDrawer` resolves, then hides itself.

The parent page passes `onAddItem` when showing the drawer:
```ts
NiceModal.show(AddProductDrawer, { userId, selectedCustomer, onAddItem })
```

---

## Data flow

```
order (useQuery) ──[once]──► localItems (useState)
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
     removeItem            updateQty              onAddItem
          │                      │                      │
          └──────────────────────┴──────────────────────┘
                                 │
                           handleSubmit
                                 │
                      api.updateOrder(userId, orderNumber, payload)
```

---

## Files changed

| File | Change |
|---|---|
| `src/app/(protected)/orders/[id]/edit/page.tsx` | Local state, handlers, mutation fix |
| `src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx` | Remove `useCart`, add `onAddItem` callback prop |
