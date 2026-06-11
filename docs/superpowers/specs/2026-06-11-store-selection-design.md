# Store Selection Feature — Design Spec

**Date:** 2026-06-11

## Overview

When a user visits `/products`, they must select a store (customer + division) before browsing. The selected store is persisted in localStorage and displayed in a banner below the page header. On subsequent visits, a dialog asks whether to switch stores or keep the current selection.

## Non-goals

- Global store selection across all pages (scoped to `/products` only)
- Server-side persistence of the selected store
- Filtering or searching the store list

---

## Data Model

**API:** `GET api/liff/user_check/{lineUserId}` (existing `api.checkUser`)

**Relevant response shape:**
```ts
type Customer = {
  customer_id: string;
  customer_name: string;
  division_id: string;
  division_name: string;
};

type UserCheckResponse = {
  status: "Success" | "Faile";
  code: number;
  error_message?: string;
  data: {
    customers: Customer[];
    // ...other fields
  };
};
```

**localStorage key:** `mowi_selected_customer`
**Stored value:** full `Customer` object (JSON stringified)

---

## Flow

```
products/page.tsx mounts
        ↓
read localStorage["mowi_selected_customer"]
        ↓ null                        ↓ found
StoreSelectDrawer              SwitchStoreDialog
(forced, no close)            "Want to switch stores?"
        ↓                         ↓ No        ↓ Yes
  user picks store          use saved     StoreSelectDrawer
        ↓                    value              ↓
save to localStorage                    user picks store
        ↓                                      ↓
  set selectedCustomer state           save to localStorage
                                               ↓
                                       set selectedCustomer state
```

---

## Components

### `StoreSelectDrawer` (new)
**File:** `src/app/(protected)/products/_components/store-select-drawer.tsx`

- Built with `NiceModal.create` + shadcn `Drawer`
- Opens from the bottom
- No close button; `onOpenChange` is a no-op (forced selection)
- Fetches customers via `useQuery` calling `api.checkUser(userId)` — receives `userId` as a prop
- Each list item displays: `{customer_name} · {division_name}`
- On item tap: saves to localStorage → calls `modal.resolve(customer)`
- Shows loading skeleton while fetching; shows error state on failure

### `SwitchStoreDialog` (new)
**File:** `src/app/(protected)/products/_components/switch-store-dialog.tsx`

- Built with `NiceModal.create` + shadcn `AlertDialog`
- Receives current `Customer` as prop
- Title: "切換店家？"
- Body: "目前選擇：{customer_name} · {division_name}"
- "否" button → `modal.resolve(false)`
- "是" button → `modal.resolve(true)`

### `products/page.tsx` (modified)
- Add `selectedCustomer: Customer | null` state (initially `null`)
- Add `useEffect` that runs once on mount:
  1. Read localStorage
  2. If null → `NiceModal.show(StoreSelectDrawer, { userId })` → set state from result
  3. If found → `NiceModal.show(SwitchStoreDialog, { customer })`:
     - `false` → set state from localStorage value directly
     - `true` → `NiceModal.show(StoreSelectDrawer, { userId })` → set state from result
- Below the existing `<header>`, add a store banner (only rendered when `selectedCustomer` is set):
  ```
  [ 目前店家：{customer_name} · {division_name}   [切換] ]
  ```
  Clicking "切換" re-triggers the full switch flow.
- Replace hardcoded `customer_id: 208682, division_id: 240` in `getProducts` payload with values from `selectedCustomer`
- `getProducts` query is `enabled` only when `selectedCustomer` is set

---

## State Management

All state is local to `products/page.tsx`. No context or global store needed.

```ts
const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
```

localStorage read/write is done inline in the `useEffect` and selection handlers.

---

## Error Handling

- If `user_check` fails to load, show an error message inside the drawer with a retry option.
- If localStorage value is malformed/unparseable, treat as null and show `StoreSelectDrawer`.

---

## Files Changed

| File | Action |
|------|--------|
| `src/app/(protected)/products/_components/store-select-drawer.tsx` | Create |
| `src/app/(protected)/products/_components/switch-store-dialog.tsx` | Create |
| `src/app/(protected)/products/page.tsx` | Modify |
