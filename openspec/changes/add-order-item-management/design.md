## Context

目前 `orders/create/index.html` 以單頁流程呈現訂單確認與送出，但商品區塊僅供檢視，缺少可直接維護商品明細的互動。目標使用者主要在行動裝置下單，頁面切換會增加操作中斷與回填成本。既有 `products/index.html` 已有可用的數量調整互動（減號、數字輸入、加號），可作為修改數量的 UI 行為基準。

## Goals / Non-Goals

**Goals:**
- 在訂單建立頁提供完整的商品明細管理：新增、修改數量、刪除。
- 新增商品採 modal 呈現商品清單，使用者可直接點選加入，不離開當前頁面。
- 修改數量採用與既有組件一致的互動規則（按鈕 + 數字輸入）。
- 所有操作即時更新頁面中的商品清單與件數顯示。

**Non-Goals:**
- 不新增後端訂單 API 或資料庫 schema 變更。
- 不處理跨頁購物車同步與多裝置即時同步。
- 不在本次變更加入優惠券、庫存預留或複雜價格促銷邏輯。

## Decisions

1. 採用同頁 modal 作為新增商品入口，而非另開商品頁。
- Rationale: 行動端操作可保持在單一任務上下文，避免跳頁後返回帶來的狀態復原成本。
- Alternative considered: 另開商品列表頁並透過 query/localStorage 回傳選擇結果。此方案路由與狀態管理較複雜，且增加返回流程摩擦。

2. 將訂單商品明細狀態集中於前端單一 state（如陣列）驅動畫面。
- Rationale: 新增、修改、刪除都可經同一狀態更新流程，降低 DOM 手動同步錯誤。
- Alternative considered: 直接操作 DOM 節點。快速但難維護，且容易在多操作序列出現資料與畫面不一致。

3. 修改數量沿用既有數量調整組件交互規範。
- Rationale: 可重用使用者已熟悉的操作模式與可及性語意（按鈕 aria-label + number input）。
- Alternative considered: 只保留純輸入框。雖實作簡單，但在行動端操作效率與防呆較弱。

4. 刪除行為採即時移除 + 最小防呆（例如二次確認或復原提示擇一）。
- Rationale: 減少誤刪風險並維持操作可預期性。
- Alternative considered: 無防呆直接刪除。互動最快，但誤觸風險偏高。

## Risks / Trade-offs

- [Risk] modal 清單與主清單資料來源不一致 → Mitigation: 單一資料模型，所有清單以同一 state 重繪。
- [Risk] 數量輸入可能出現負值或非整數 → Mitigation: 在輸入與按鈕事件統一做整數與下限 0 的正規化。
- [Risk] 商品資料量成長造成 modal 捲動效能下降 → Mitigation: 初期保留簡化清單，必要時再加入分頁或虛擬化。
- [Trade-off] 同頁 modal 讓流程連續，但頁面腳本複雜度較另開頁高。
