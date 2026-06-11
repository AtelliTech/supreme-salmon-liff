# Create Order Flow — Design

Date: 2026-06-11

## Summary

Implement end-to-end order creation: product selection → cart (localStorage) → create order form → API submission.

## Non-goals

- Cart persistence across devices / cross-tab reactivity
- Discount / coupon logic
- Date picker for deliver_date (sent as empty string for now)
- Address lookup or geocoding

---

## Architecture

### Cart State: `useCart` hook

**File:** `src/hooks/use-cart.ts`  
**Storage key:** `mowi_cart`  
**Type:**

```ts
type CartItem = {
  product_id: string;
  product_img_url: string;
  product_name: string;
  product_desc: string;
  box_net_weight: number;
  unit_price: number;
  remark: string;
  qty: number;
};
```

**Exposed API:**

| Member | Type | Description |
|---|---|---|
| `items` | `CartItem[]` | Current cart contents |
| `totalCount` | `number` | Sum of all qty values (for badge) |
| `addItem(product, qty)` | function | Add or merge item by `product_id` |
| `updateQty(productId, qty)` | function | Update qty; removes if qty ≤ 0 |
| `removeItem(productId)` | function | Remove item |
| `clearCart()` | function | Empty the cart |

Implementation: `useState` initialized from `localStorage.getItem("mowi_cart")`, writes back on every mutation. SSR-safe (reads localStorage only on mount / inside handlers, never during SSR render).

---

## Component Changes

### 1. `product-card.tsx`

Add `useCart` and capture `ProductDrawer` resolve:

```ts
const { addItem } = useCart();

NiceModal.show(ProductDrawer, { product }).then(({ product, qty }) => {
  addItem(product, qty);
});
```

### 2. `products/page.tsx`

**Badge:** Replace hardcoded `2` with `useCart().totalCount`. Hide badge when count is 0.

**Clear cart on customer switch:** Call `clearCart()` inside `handleSwitchStore` after the new customer is selected, and also after the initial `runStoreSelection` resolves to a new customer (detected by comparing prev vs next `selectedCustomer`).

Concretely: extract a `handleCustomerChange(customer)` helper that calls both `setSelectedCustomer(customer)` and `clearCart()`. Use it wherever a new customer is set.

### 3. `orders/create/page.tsx`

Full replacement of mock data with real data:

**Data sources:**
- `userId` — from `useLIFF` + `useQuery` (same pattern as products page)
- `selectedCustomer` — from `loadCustomer()` on mount (already in `store-select-drawer.tsx`)
- `customers` list — from `useQuery` calling `api.checkUser(userId)`, used for address dropdown
- `cartItems` — from `useCart().items`

**Form fields:**
| Field | Source / Behavior |
|---|---|
| 商品清單 | `useCart().items` — read-only display, qty editable via `updateQty`, delete via `removeItem` |
| 選擇地址 | `<select>` populated from `checkUser` customers (`customer_name · division_name`) |
| 收件地址 | Free-text input, defaults to empty |
| 訂單備註 | Free-text textarea |

**Submission payload mapping:**

```ts
{
  deliver_date: "",
  address_id: "",
  customer_id: selectedCustomer.customer_id,
  division_id: selectedCustomer.division_id,
  remark: orderRemark,
  items: cartItems.map(item => ({
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
}
```

**Success flow:** Call `clearCart()` → redirect to `/orders`.

**Mutation:** Use `useMutation` with `api.createOrder(userId, payload)`. Show loading state on submit button. On error, show toast (sonner).

---

## Data Flow Diagram

```
[ProductCard] +button
      │
      ▼
[ProductDrawer] user sets qty → confirm
      │ modal.resolve({ product, qty })
      ▼
[useCart].addItem → localStorage "mowi_cart"
      │
      ├──► [products/page] badge reads totalCount
      │
      └──► [orders/create/page] reads items, submits to api.createOrder
                  │
                  └── success → clearCart → /orders
```

---

## Edge Cases

- **Empty cart on create page:** Show empty state, disable submit button.
- **No selectedCustomer on create page:** If `loadCustomer()` returns null, redirect to `/products`.
- **Customer switch:** `handleCustomerChange` always clears cart before setting new customer.
- **addItem with existing product:** Merge by `product_id` — add quantities together.
