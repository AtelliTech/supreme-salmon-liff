# Edit Order — Add Product Drawer

**Date:** 2026-06-11

## Summary

Add an "新增商品" (add product) feature to the order edit page (`/orders/[id]/edit`). Users can open a bottom-sheet drawer listing all available products, tap one to choose a quantity via the existing `ProductDrawer`, then add it to the cart.

## Non-goals

- No search or category filtering in the drawer
- No special "already in cart" indicator on product rows

## Architecture

### New component

`src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx`

- Wrapped with `NiceModal.create<{ userId: string; selectedCustomer: Customer }>`
- Fetches products via `useQuery` → `api.getProducts(userId, { customer_id, division_id })`
- Renders a scrollable list of product rows (thumbnail + name + desc + price)
- On row tap: `NiceModal.show(ProductDrawer, { product })` → on resolve calls `addItem`
- Stays open after adding a product (user closes manually)

### Trigger

In `page.tsx`, the 商品清單 card header gets a `+ 新增商品` button on the right side. On click: `NiceModal.show(AddProductDrawer, { userId, selectedCustomer })`.

## Data Flow

```
page.tsx
  └─ click "+ 新增商品"
       └─ NiceModal.show(AddProductDrawer, { userId, selectedCustomer })
            └─ useQuery → api.getProducts → product list
            └─ click product row
                 └─ NiceModal.show(ProductDrawer, { product })
                      └─ resolve { product, qty }
                           └─ useCart().addItem(product, qty)
```

## Files to change

| File | Change |
|------|--------|
| `src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx` | Create new component |
| `src/app/(protected)/orders/[id]/edit/page.tsx` | Add button to header + NiceModal.show call |
