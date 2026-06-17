# Account Page Design

**Date:** 2026-06-17  
**Route:** `/account`  
**File:** `src/app/(protected)/account/page.tsx`

## Overview

A read-only member info page. Displays data from `api.checkUser(userId)` alongside the user's currently active store from localStorage.

## Data Sources

- `useLIFF()` → `profile.userId`
- `useQuery` → `api.checkUser(userId)` — key: `["/api/liff/user_check", userId]` (matches layout, hits cache)
- `loadCustomer()` from `src/app/(protected)/products/_components/store-select-drawer.tsx` → active customer

## API Response Shape

```ts
{
  data: {
    line_uid: string
    display_name: string
    name: string
    email: string
    phone: string
    company_name: string
    vat_id: string
    is_customer: "Y" | "N"
    display_price: "Y" | "N"
    customers: Array<{
      customer_id: string
      customer_name: string
      division_id: string
      division_name: string
    }>
  }
}
```

## Layout Sections

### Header
Sticky header matching products page: "MOWI Taiwan" (salmon-600, font-bold) + cart icon (link to `/orders/create`).

### Section label
Gray background bar: "會員資訊"

### 1. 個人資訊卡
White card (rounded-xl, shadow-sm, p-4):
- Avatar: dark circle (bg-gray-800 text-white), first letter of `display_name`
- `display_name` bold + `"LINE 帳號已綁定：" + line_uid` (truncated, text-gray-500 text-sm)
- Badges:
  - `is_customer === "Y"` → green badge "已認證客戶"
  - `display_price === "Y"` → teal badge "可查看價格"

### 2. 目前下單店家卡
White card (rounded-xl, shadow-sm, p-4):
- Label "目前下單店家" (text-sm text-gray-500)
- `customer_name` (font-bold text-lg)
- `division_name` (text-sm text-gray-500)
- Full-width black rounded button "切換店家" → `NiceModal.show(StoreSelectDrawer, { userId })`

Shows skeleton/placeholder if no active customer in localStorage.

### 3. 基本資料卡
White card (rounded-xl, shadow-sm):
- Section header "基本資料" (text-sm text-gray-500, p-4 pb-2)
- Row list, each row: label (text-gray-500) left, value right, separated by `border-b border-gray-100`
- Rows: 姓名 / Email / 電話 / 公司名稱 / 統一編號

### 4. 可用客戶 / 分店卡
White card (rounded-xl, shadow-sm):
- Section header "可用客戶 / 分店"
- Each customer row: `customer_name` (font-semibold) + `division_name` (text-sm text-gray-500) on left
  - Active (matches `loadCustomer().customer_id + division_id`) → green "目前使用中" text
  - Others → "切換" button → calls `loadCustomer` update + triggers re-render

## Non-goals
- No profile editing
- No pagination for customers
