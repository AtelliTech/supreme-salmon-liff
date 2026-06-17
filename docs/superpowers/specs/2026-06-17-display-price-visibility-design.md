# Display Price Visibility Design

**Date:** 2026-06-17  
**Status:** Approved

## Overview

When `checkUser` returns `display_price: "N"`, all price displays across the app should be visually hidden (using `visibility: hidden`) without removing functionality or breaking layout.

## Non-goals

- Removing price data from API calls or cart logic
- Hiding the "account page" price tier display (already handled separately at `account/page.tsx:159`)
- Server-side enforcement of price hiding

## Architecture

### New file: `src/providers/user-settings-provider.tsx`

A React context that stores `{ displayPrice: boolean }` derived from the `checkUser` API response.

Exports:
- `UserSettingsProvider` — wraps children with context value
- `useUserSettings()` — hook for consuming the context

Default context value: `{ displayPrice: true }` — ensures prices are visible before data loads (prevents layout flash).

### Modified: `src/app/(protected)/layout.tsx`

Extend the existing `checkUser` query (queryKey: `["/api/liff/user_check", userId]`) to also read `display_price` from the response. Pass it to `UserSettingsProvider` wrapping `children`.

The query response type must be extended to include `display_price: "Y" | "N"`.

### Modified price components (7 price elements across 5 files)

Apply `cn("...existing classes...", !displayPrice && "invisible")` to each price element:

| File | Element |
|------|---------|
| `src/app/(protected)/products/_components/product-card.tsx` | `NT$ unit_price` |
| `src/app/(protected)/products/_components/product-drawer.tsx` | `NT$ unit_price` |
| `src/app/(protected)/orders/[id]/edit/_components/add-product-drawer.tsx` | `NT$ unit_price` (in list) |
| `src/app/(protected)/orders/create/page.tsx` | `NT$ unit_price` (per cart item) |
| `src/app/(protected)/orders/[id]/_components/order-items-card.tsx` | `NT$ price` (per item) + subtotal + final total |

### `order-items-card.tsx` specific note

This file currently has no `"use client"` directive. Since it will consume a React context hook, `"use client"` must be added at the top.

## Data flow

```
(protected)/layout.tsx
  ↓ checkUser (TanStack Query, existing)
  ↓ display_price: "Y" | "N"
  UserSettingsProvider
    ↓ useUserSettings()
    product-card, product-drawer, add-product-drawer,
    orders/create/page, order-items-card
```

## Hiding strategy

Use Tailwind `invisible` class (`visibility: hidden`) — not `hidden` (`display: none`).  
This preserves the element's space in the layout, preventing layout shifts when prices are hidden.

```tsx
<p className={cn("font-bold text-red-500", !displayPrice && "invisible")}>
  NT$ {numeral(product.unit_price).format("0,0")}
</p>
```
