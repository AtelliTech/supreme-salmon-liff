# supreme-salmon

MOWI Taiwan 的 LINE LIFF 前端專案，使用 Vite 建置多頁面（MPA），提供會員註冊、商品瀏覽、建立訂單、訂單查詢與待處理頁面。

## 功能概覽

- LINE LIFF 登入與使用者流程導引
  - 已存在使用者：導向商品頁
  - 新使用者：導向註冊頁
- 商品列表與加入購物流程（UI 原型）
- 建立訂單與訂單明細頁（UI 原型）
- 訂單列表與待處理頁（UI 原型）
- 封裝 LIFF API helper，統一處理 API 請求與錯誤

## 技術棧

- Node.js
- Vite 7
- LIFF SDK (`@line/liff`)
- 前端頁面樣式以 Tailwind CDN 為主

## 專案結構

```text
.
├── index.html                # LIFF 入口
├── main.js                   # LIFF 初始化與入口導流
├── api/
│   └── index.js              # API helper（createLiffApi）
├── products/index.html       # 商品頁
├── orders/index.html         # 訂單列表
├── orders/create/index.html  # 建立訂單
├── orders/[id]/index.html    # 訂單詳情
├── sign-up/index.html        # 會員註冊
├── pending/index.html        # 待處理頁
├── docs/
│   ├── api-reference.md      # API 規格（節錄）
│   └── references.md         # 完整參考文件
└── deploy/stage/nginx.conf   # Stage Nginx 設定
```

## 環境需求

- Node.js 20+（建議）
- yarn 10+（建議）

## 安裝與啟動

```bash
yarn install
yarn run dev
```

預設本機開發位址：

- `https://localhost:9000`

本專案啟用 Vite HTTPS（`@vitejs/plugin-basic-ssl`），首次啟動若遇到憑證警告屬正常情況。

## 可用指令

- `yarn run dev`：啟動開發伺服器（port 9000）
- `yarn run build`：打包至 `dist/`
- `yarn run preview`：預覽打包結果
- `yarn run start`：使用 `serve` 啟動 `dist/`（port 3000）
- `yarn run start:https`：使用本機憑證啟動 HTTPS 靜態服務（port 9000）
- `yarn run release`：執行 release-it 發版流程

## 路由與頁面

Vite 設定了多頁輸入，並在 dev server 以 clean URL middleware 支援以下路徑：

- `/`（LIFF 入口）
- `/products`
- `/orders`
- `/orders/create`
- `/orders/[id]`
- `/sign-up`
- `/pending`

## LIFF 流程說明

`main.js` 啟動時會：

1. 呼叫 `liff.init()` 初始化 LIFF
2. 若未登入，觸發 `liff.login()`
3. 已登入後取得 `userId`
4. 呼叫 `api.checkUser(userId)` 檢查使用者
5. 依結果導頁
   - 404：導向 `/sign-up`
   - 其他：導向 `/products`

> 目前 `main.js` 內建 LIFF ID，正式環境建議改為可配置化管理。

## API Helper 使用方式

`api/index.js` 提供 `createLiffApi()` 與預設 instance：

```js
import { createLiffApi } from "./api";

const api = createLiffApi({
  baseUrl: "https://mowiapi.ilnk.io/api",
});

const user = await api.checkUser(lineUserId);
const products = await api.getProducts(lineUserId, {
  customerId: "C001",
  divisionId: "D001",
  page: 1,
  pageSize: 10,
});
```

已封裝的主要方法：

- `checkUser(lineUserId)`
- `createLineUser(payload)`
- `getProducts(lineUserId, params)`
- `createOrder(lineUserId, payload)`
- `updateOrder(lineUserId, number, payload)`
- `listOrders(lineUserId, params)`
- `getOrderDetail(lineUserId, number)`

## 建置與部署

### Build

```bash
yarn run build
```

產物輸出於 `dist/`。

### Stage 部署參考

`deploy/stage/nginx.conf` 使用：

- `root /var/www/supreme-salmon-liff/webroot/dist;`
- `try_files $uri $uri/ /index.html$is_args$args;`

請依實際站台調整：

- `server_name`
- `root`
- SSL / 反向代理設定

## 文件索引

- API 規格節錄：`docs/api-reference.md`
- 系統與完整 API 參考：`docs/references.md`

## 版本

目前版本：`0.1.0-alpha.3`

## 注意事項

- 多數頁面目前為 UI 原型，需再串接資料與互動邏輯。
- 若部署於 LIFF 正式環境，請確認 LIFF URL、網域白名單與 HTTPS 設定一致。
