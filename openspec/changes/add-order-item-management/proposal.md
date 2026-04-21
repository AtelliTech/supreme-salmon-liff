## Why

目前訂單建立頁缺少完整的商品清單編修能力，使用者在送出前無法在同一流程中新增商品、調整數量或刪除品項，容易造成下單錯誤與重工。此變更優先補齊編修能力，並採用 modal 流程以維持行動端操作連續性與降低頁面切換成本。

## What Changes

- 在訂單編修流程新增「新增商品」入口，點擊後開啟商品選擇 modal，顯示可加入訂單的商品清單並支援點擊加入。
- 在訂單商品清單中新增「修改」能力，使用既有數量調整元件（減號按鈕、數字輸入、加號按鈕）調整單品數量。
- 在訂單商品清單中新增「刪除」能力，支援移除指定品項並即時更新清單狀態。
- 補齊前端互動狀態管理，確保新增、修改、刪除操作在同一頁面可被即時反映。

## Capabilities

### New Capabilities
- `order-item-management`: 提供訂單商品的新增、數量調整與刪除能力，包含商品選擇 modal 與清單互動規則。

### Modified Capabilities
- None.

## Impact

- Affected code:
  - `orders/create/index.html` 的 UI 結構與 modal 互動
  - `orders/create` 對應前端腳本中的訂單商品狀態管理與事件處理
- APIs:
  - 目前不新增後端 API；商品來源沿用既有前端商品資料來源策略
- Dependencies:
  - 不新增外部套件，沿用現有 Tailwind / 前端原生事件處理
- Systems:
  - 行動端下單流程 UX 與訂單建立頁的互動邏輯
