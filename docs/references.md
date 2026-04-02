# 美威鮭魚 API Spec 0224 v1.2.4

###### tags: `Mowi`, `APIs`, `Admin`, `Spec`

- **Version:** v1.2.4
- **Audience:** Backend / Frontend Engineers

---

# 1. 系統目標與範圍

## 1.1 系統目標

- 提供 LINE 客戶透過 LIFF 建立與管理訂單
- 與 M3 系統進行客戶與訂單資料整合
- 提供後台管理人員審核、維護與查詢資料

## 1.2 系統範圍

- LINE 客戶管理
- 訂單管理
- 操作記錄（Audit Log）
- M3 系統同步（客戶 / 訂單）

---

# 2. 角色與權限定義

## 2.1 LINE 客戶（End User）

### 未驗證客戶

**條件**

- 已加入 LINE 官方帳號
- 尚未綁定 M3 Customer ID

**限制**

- 不可使用任何 LIFF 訂單功能

**判斷依據**

```text
line_users.customer_id IS NULL
```

---

### 已驗證客戶

**條件**

- 已通過 M3 審核
- 已綁定 M3 Customer ID
- status = active

**權限**

- 建立 / 查詢 / 修改 / 取消訂單
- 匯出自身訂單資料

---

## 2.2 系統管理員（Backoffice）

| 角色         | 權限                            |
| ------------ | ------------------------------- |
| Admin        | 客戶管理、訂單管理、資料審核    |
| System Admin | Admin 權限 + 系統設定、權限管理 |

---

# 3. 系統架構與驗證機制

## 3.1 架構概覽

```
LINE LIFF
  ↓ LINE Token
API Server
  ├─ LINE 客戶管理模組
  ├─ 訂單管理模組
  ├─ 操作記錄模組
  ↓
Database
  ↓
M3 System
```

---

## 3.2 身份驗證規則

| 使用場景 | 驗證方式     |
| -------- | ------------ |
| LIFF API | LINE USER ID |
| 後台 API | JWT          |

- API 需依路徑判斷驗證方式

```text
/api/liff/*   → LINE USER ID
/api/*  → JWT + role
```

---

# 4. 系統模組與功能

- LINE客戶管理模組
- M3客戶管理模組
- 商品管理模組
- 訂單管理模組
- 使用者管理模組
- 操作記錄管理模組
- 同步任務管理模組

## 功能描述

### LINE客戶管理模組

- 建立
  當LINE客戶通過LINE官方帳號加入好友後，系統自動建立客戶資料，儲存至 **line_users** 資料表。(Note:此時客戶資料僅包含LINE User ID，暫未綁定任何M3 Customer ID等需後續更新。)
- 更新
  處理LINE客戶資料的更新請求，包括修改聯絡資訊、更新客戶狀態、M3 Customer ID綁定狀態等，儲存至 **line_users**、**line_user_customer**、**line_user_address** 等資料表。
- 查詢
  提供查詢LINE客戶資料的功能，支持關鍵字搜索功能，方便系統管理員快速找到特定客戶的資料。

### M3客戶管理模組

- 同步客戶資料
  將客戶資料從M3同步至Middleware系統中，並儲存至 **customers** 資料表。
- 同步區域資料
  1. 將M3區域資料同步至Middleware系統中，並儲存至 **divisions** 資料表。
  2. 建立 customer 與 division 關聯至 **customer_division** 資料表。
- 同步客戶地址資料
  1. 將客戶地址資料，經由排程從M3同步至Middleware系統中，並儲存至 **addresses** 資料表。

### 商品管理模組

- 同步商品資料
  將商品資料從M3同步至Middleware系統中，並儲存至 **products** 資料表。
- 同步客戶商品價格資料
  將客戶商品價格資料，經由排程從M3同步至Middleware系統中，並與客戶資料建立關聯，儲存至 **product_price** 資料表。

### 訂單管理模組

- 訂單建立
  允許已驗證的LINE客戶通過LIFF建立訂單，並將訂單資料儲存至 **orders** 與 **order_items** 等資料表。
- 訂單查詢
  提供查詢訂單資料的功能，支持根據訂單ID、客戶ID、LINE User ID等條件進行搜索。
- 訂單取消
  允許已驗證的LINE客戶通過LIFF取消訂單，並更新訂單狀態。
- 訂單修改
  允許已驗證的LINE客戶通過LIFF修改訂單資料，如修改商品數量、修改送貨地址等。
- 訂單成立
  當訂單資料完整且符合要求時，將訂單狀態更新為成立，並觸發相關的後續處理流程(同步至M3)。
- 同步M3訂單資料
  由於訂單資料成立後會同步至M3，後續訂單處理流程(如出貨、退貨等)將在M3系統中進行，LINE系統需要定期從M3同步訂單狀態，以確保資料的一致性。
- 訂單資料匯出
  提供將訂單資料匯出為CSV或Excel格式的功能，方便系統管理員進行分析和報告。

### 使用者管理模組

- 登入
  經由核發之帳號與密碼登入管理系統。
- 登出
  將已登入的JWT Token進行刪除 (ClientSide local storage)。
- 建立
  為新的業務或管理人員建立帳號，並將資料儲存至 **users** 資料表中。
- 編輯資料
  編輯帳號資訊，包含名稱、聯絡方式、角色等。
- 設定狀態
  設定使用者狀態，是否可以登入等。
- 重設密碼
  系統管理者可以為自已或其它使用者強制重新設定密碼。
- 查詢
  根據搜尋條件(keyword)列出使用者列表。

### 操作記錄管理模組

- 記錄操作行為
  系統自動記錄LINE客戶和系統管理員的操作行為，包括但不限於訂單建立、訂單修改、訂單取消、客戶資料更新等操作。
- 查詢操作記錄
  提供查詢操作記錄的功能，支持根據操作類型、操作人員、操作時間等條件進行搜索。

### 同步任務管理模組

- 查詢任務記錄
  提供查詢任務記錄的功能。
- 手動建立任務
  提供任務建立功能。

---

# 5. API Reference

## 5.1 LIFF 相關APIs

### 5.1.1 LINE USER 查詢 [**<font color="green">Verified @ 20260304 By Eric Huang</font>**]

#### Method

`GET`

#### Path Parameter

- line_user_id
  Ref: line_users.line_uid

#### Example Request

```curl=
GET /api/liff/user_check/{line_user_id}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data":  {
        "line_uid": "Uxxx",
        "display_name": "xxxx",
        "name": "xxxx",
        "email": "xxxx",
        "phone": "xxxx",
        "company_name": "xxxx",
        "vat_id": "xxxx",
        "is_customer": "Y|N",
        "display_price": "Y|N" // Add By Eric Huang @ 20260402
    } // 如果有的話
}
```

### 5.1.2 LINE USER 建立 [**<font color="green">Verified @ 20260304 By Eric Huang</font>**]

#### Method

`POST`

#### Example Request

```curl=
POST /api/liff/line_users
{
    "line_uid": "Uxxx",
    "display_name": "xxxx",
    "name": "xxxx",
    "email": "xxxx",
    "phone": "xxxx",
    "company_name": "xxxx",
    "vat_id": "xxxx",
}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data":  {
        "line_uid": "Uxxx",
        "display_name": "xxxx",
        "name": "xxxx",
        "email": "xxxx",
        "phone": "xxxx",
        "company_name": "xxxx",
        "vat_id": "xxxx",
        "is_customer": "Y|N",
        "display_price": "Y|N" // Add By Eric Huang @ 20260402
    } // 如果有的話
}
```

### 5.1.3 LINE USER 商品查詢

#### Method

`GET`

#### Path Parameter

- line_user_id [**Required**]
  Ref: line_users.line_uid

#### Query Parameter

- customer_id [**Required**]
  `String`
- division_id [**Required**]
  `String`
- category_id (Add By Eric Hunag @ 20260402)
  `String`
- page
  `int`，預設:1
- pageSize
  `int`，預設:10，最大值:50

#### Example Request

```curl=
GET /api/liff/{line_user_id}/products?customer_id={customer_id}&division_id={division_id}&page={page}&pageSize={page size}
```

#### Example Response

```json=

```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data":  [{
        "id": "xxxx",
        "img_url": "xxxx",
        "name": "xxxx",
        "description": "xxxx",
        "category": { // Add By Eric Huang @ 20260402
            "id": "xxxx",
            "name": "xxxx"
        },
        "box_net_weight": "xxxx",
        "unit_price": "xxxx",
        "remark": "xxx"
    },...], // 如果有的話
    "meta": {
        "page": int, // 當前頁面
        "page_size": int, // 每頁筆數
        "total_count": int, // 總資料筆數
        "page_count": int, // 分頁總數
    } // 如果有的話
}
```

### 5.1.4 LINE USER 訂單建立

#### Method

`POST`

#### Path Parameter

- line_user_id
  Ref: line_users.line_uid

#### Example Request

```curl=
POST /api/liff/{line_user_id}/orders
{
    "deliver_date": "xxx",
    "address_id": "xxx",
    "customer_id": "xxx",
    "division_id": "xxx",
    "remark": "xxx",
    "items": [
        {
            "product_id": "xxx",
            "product_img_url": "xxx",
            "product_name": "xxx",
            "product_desc": "xxx",
            "box_net_weight": "xxx",
            "unit": "xxx",
            "quantity": "xxx",
            "price": "xxx",
            "weight": "xxx",
            "sub_total": "xxx",
            "final_total": "xxx",
            "remark": "xxx"
        },...
    ]
}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data":  {
        "id": "xxx",
        "order_date": "xxxx",
        "number": "xxxx",
        "amount": "xxxx"
    } // 如果有的話
}
```

### 5.1.5 LINE USER 訂單修改

#### Method

`PATCH`

#### Path Parameter

- line_user_id
  Ref: line_users.line_uid
- number
  Ref: orders.number

#### Example Request

```curl=
PATCH /api/liff/{line_user_id}/orders/{number}
{
    "deliver_date": "xxx",
    "address_id": "xxx",
    "customer_id": "xxx",
    "division_id": "xxx",
    "remark": "xxx",
    "items": [
        {
            "product_id": "xxx",
            "product_img_url": "xxx",
            "product_name": "xxx",
            "product_desc": "xxx",
            "box_net_weight": "xxx",
            "unit": "xxx",
            "quantity": "xxx",
            "price": "xxx",
            "weight": "xxx",
            "sub_total": "xxx",
            "final_total": "xxx",
            "remark": "xxx"
        },...
    ]
}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data":  {
        "id": "xxx",
        "order_date": "xxxx",
        "number": "xxxx",
        "amount": "xxxx"
    } // 如果有的話
}
```

### 5.1.6 LINE USER 訂單查詢

1. 根據order_date 進行排序，由大到小

#### Method

`GET`

#### Path Parameter

- line_user_id
  Ref: line_users.line_uid

#### Query Parameter

- page
  `int`，預設:1
- pageSize
  `int`，預設:10，最大值:50

#### Example Request

```curl=
GET /api/liff/{line_user_id}/orders?page={page}&pageSize={page size}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data":  [{
        "id": "xxx",
        "order_date": "xxxx",
        "number": "xxxxx",
        "deliver_date": "xxx",
        "address": {
            "id": "xxx",
            "name": "xxxx",
            "address": "xxxx"
        }
        "customer": {
            "id": "xxxx",
            "name": "xxxx",
            "vat_id": "xxxx",
        },
        "division": {
            "id": "xxx",
            "name": "xxx"
        },
        "remark": "xxx",
        "item_count": int,
        "amount": "xxx",
        "final_amount": "xxxx",
        "state": "xxx",
        "ship_status": "xxxx"
    },...], // 如果有的話
    "meta": {
        "page": int, // 當前頁面
        "page_size": int, // 每頁筆數
        "total_count": int, // 總資料筆數
        "page_count": int, // 分頁總數
    } // 如果有的話
}
```

### 5.1.7 LINE USER 詳細訂單資料

#### Method

`GET`

#### Path Parameter

- line_user_id
  Ref: line_users.line_uid
- number
  Ref: orders.number

#### Example Request

```curl=
GET /api/liff/{line_user_id}/orders/{number}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data":  {
        "id": "xxx",
        "order_date": "xxxx",
        "number": "xxxxx",
        "deliver_date": "xxx",
        "address": {
            "id": "xxx",
            "name": "xxxx",
            "address": "xxxx"
        },
        "customer": {
            "id": "xxxx",
            "name": "xxxx",
            "vat_id": "xxxx",
        },
        "division": {
            "id": "xxx",
            "name": "xxx"
        },
        "remark": "xxx",
        "amount": "xxx",
        "final_amount": "xxxx",
        "state": "xxx",
        "ship_status": "xxxx",
        "items": [
            {
                "product_id": "xxx",
                "product_img_url": "xxx",
                "product_name": "xxx",
                "product_desc": "xxx",
                "box_net_weight": "xxx",
                "unit": "xxx",
                "quantity": "xxx",
                "final_quantity": "xxx",
                "price": "xxx",
                "deal_price": "xxx",
                "weight": "xxx",
                "final_weight": "xxx",
                "sub_total": "xxx",
                "final_total": "xxx",
                "remark": "xxx"
            },...
        ]
    } // 如果有的話
}
```

---

## 5.2 後台管理-使用者相關

### 5.2.1 登入 [**<font color="green">Verified @ 20260304 By Eric Huang</font>**]

![](https://hackmd.atelli.ai/uploads/d7a75be1-7e49-474f-b38e-6e2824a1727f.png)

#### Method

`POST`

#### Example Request

```curl=
POST /auth
{
    "username": "jack@test.com",
    "password": "12345678"
}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "access_token": "xxxxx" // 如果有的話
}
```

> JWT Token: 包含使用者 id, username, name, role

### 5.2.2 建立使用者 [**<font color="green">Verified @ 20260304 By Eric Huang</font>**]

#### Method

`POST`

#### Example Request

```curl=
POST /api/users -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
{
    "user_id": "xxx",
    "division_id": "xxx",
    "username": "xxxx",
    "name": "xxxx",
    "password": "xxxx",
    "role": "admin|system_admin"
}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
}
```

### 5.2.2 查詢使用者

#### Method

`GET`

#### Query Parameter

- keyword
  `String`
- page
  `int`，預設:1
- pageSize
  `int`，預設:10，最大值:50

#### Example Request

```curl=
GET /api/users?keyword={keyword}&page={page}&pageSize={page size} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data": [
        {
            "id": "xxx",
            "user_id": "xxx",
            "division": {
                "id": "xxx",
                "name": "xxx"
            },
            "username": "xxxx",
            "name": "xxxx",
            "role": "admin|system_admin",
            "last_login_at": "xxx",
            "last_login_ip": "xxxx",
            "status", "active", // Modify by Eric Huang @ 0305
            "created_at": "xxx",
            "creator": {
                "id": "xxx",
                "name": "xxx"
            }
            "updated_at": "xxxx",
            "updater": {
                "id": "xxx",
                "name": "xxx"
            }
        },...
    ], // 如果有的話
    "meta": {
        "page": int, // 當前頁面
        "page_size": int, // 每頁筆數
        "total_count": int, // 總資料筆數
        "page_count": int, // 分頁總數
    } // 如果有的話
}
```

### 5.2.3 變更使用者密碼

#### Method

`POST`

##### Path Parameter

- id
  Ref: users.id

#### Example Request

```curl=
POST /api/users/{id}/password -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
{
    "password": "xxxxx"
    "password_confirm": "xxxxx"
}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
}
```

### 5.2.4 變更使用者狀態

#### Method

`POST`

#### Example Request [Modify by Eric Huang @ 0309]

```curl=
POST /api/users/{id}/status -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
}
```

### 5.2.5 變更使用者資料 [Modify by Eric Huang @ 0309]

#### Method

`PATCH`

#### Path Parameter

- id
  Ref: users.id

#### Example Request

```curl=
PATCH /api/users/{id} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
{
    "user_id": "xxx",
    "division_id": "xxx",
    "name": "xxxx",
    "role": "admin|system_admin"
}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
}
```

---

## 5.3 後台管理-客戶(customer/division/address)相關

### 5.3.1 查詢客戶

#### Method

`GET`

#### Query Parameter

- keyword
  `String`
- page
  `int`，預設:1
- pageSize
  `int`，預設:10，最大值:50

#### Example Request

```curl=
GET /api/customers?keyword={keyword}&page={page}&pageSize={page size} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data": [
        {
            "id": "xxx",
            "name": "xxxx",
            "vat_id": "xxx",
            "created_at": "xxx",
            "creator": {
                "id": "xxx",
                "name": "xxx"
            }
            "updated_at": "xxxx",
            "updater": {
                "id": "xxx",
                "name": "xxx"
            }
        },...
    ], // 如果有的話
    "meta": {
        "page": int, // 當前頁面
        "page_size": int, // 每頁筆數
        "total_count": int, // 總資料筆數
        "page_count": int, // 分頁總數
    } // 如果有的話
}
```

### 5.3.2 查詢客戶的區域/國家

#### Method

`GET`

#### Query Parameter

- keyword
  `String`
- customer_id [**Required**]
  `String`
- page
  `int`，預設:1
- pageSize
  `int`，預設:10，最大值:50

#### Example Request

```curl=
GET /api/customer_divisions?keyword={keyword}&customer_id={customer_id} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data": [
        {
            "customer_id": "xxxx",
            "division": {
                "id": "xxx",
                "name": "xxxx",
            }
        },...
    ], // 如果有的話
    "meta": {
        "page": int, // 當前頁面
        "page_size": int, // 每頁筆數
        "total_count": int, // 總資料筆數
        "page_count": int, // 分頁總數
    } // 如果有的話
}
```

### 5.3.3 查詢店點

#### Method

`GET`

#### Query Parameter

- keyword
  `String`
- customer_id [**Required**]
  `String`
- division_id [**Required**]
  `String`
- page
  `int`，預設:1
- pageSize
  `int`，預設:10，最大值:50

#### Example Request

```curl=
GET /api/addresses?customer_id={customer_id}&division_id={division_id} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data": [
        {
            "id": "xxxx",
            "name": "xxxx",
            "address": "xxxx",
            "customer": {
                "id": "xxx",
                "name": "xxxx"
            },
            "division": {
                "id": "xxx",
                "name": "xxxx",
            }
        },...
    ], // 如果有的話
    "meta": {
        "page": int, // 當前頁面
        "page_size": int, // 每頁筆數
        "total_count": int, // 總資料筆數
        "page_count": int, // 分頁總數
    } // 如果有的話
}
```

---

## 5.4 後台管理-LINE 用戶相關

### 5.4.1 查詢LINE用戶

#### Method

`GET`

#### Query Parameter

- keyword
  `String`
- page
  `int`，預設:1
- pageSize
  `int`，預設:10，最大值:50

#### Example Request

```curl=
GET /api/line_users?keyword={keyword}&page={page}&pageSize={page size} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data": [
        {
            "id": "xxx",
            "line_uid": "Uxxx",
            "display_name": "xxxx",
            "name": "xxxx",
            "email": "xxxx",
            "phone": "xxxx",
            "company_name": "xxxx",
            "vat_id": "xxxx",
            "is_customer": "Y|N",
            "display_price": "Y|N" // Add By Eric Huang @ 20260402
            "address_num": int,
            "created_at": "xxxx",
            "updated_at": "xxxx",
            "updater": {
                "id": "xxxx",
                "name": "xxxx"
            }
        },...
    ], // 如果有的話
    "meta": {
        "page": int, // 當前頁面
        "page_size": int, // 每頁筆數
        "total_count": int, // 總資料筆數
        "page_count": int, // 分頁總數
    } // 如果有的話
}
```

### 5.4.1 查詢特定LINE用戶

#### Method

`GET`

#### Path Parameter

- id
  Ref: line_users.id

#### Example Request

```curl=
GET /api/line_users/{id} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data": {
        "id": "xxx",
        "line_uid": "Uxxx",
        "display_name": "xxxx",
        "name": "xxxx",
        "email": "xxxx",
        "phone": "xxxx",
        "company_name": "xxxx",
        "vat_id": "xxxx",
        "is_customer": "Y|N",
        "display_price": "Y|N" // Add By Eric Huang @ 20260402
        "created_at": "xxxx",
        "updated_at": "xxxx",
        "updater": {
            "id": "xxxx",
            "name": "xxxx"
        },
        "addresses": [
            {
                "id": "xxx",
                "name": "xxx",
                "address": "xxx",
                "customer": {
                    "id": "xxx",
                    "name": "xxx",
                    "vat_id": "xxx"
                },
                "division" {
                    "id": "xxx",
                    "name": "xxx"
                }
            },...
        ]
    }
}
```

### 5.4.2 編輯特定LINE用戶

#### Method

`POST`

#### Path Parameter

- id
  Ref: line_users.id

#### Example Request

```curl=
POST /api/line_users/{id} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
{
    "vat_id": "xxxx",
    "addresses": [
        {
            "address_id": "xxx",
            "customer_id": "xxx",
            "division_id": "xxx"
            "display_price": "Y|N" // Add By Eric Huang @ 20260402
        },...
    ]
}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
}
```

### 5.4.3 變更特定LINE用戶狀態

#### Method

`PATCH`

#### Path Parameter

- id
  Ref: line_users.id

#### Example Request

```curl=
PATCH /api/line_users/{id}/status -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
}
```

---

## 5.5 後台管理-訂單相關

### 5.5.1 查詢訂單

#### Method

`GET`

#### Query Parameter

- keyword
  `String`
- customer_id
  `String`
- address_id
  `String`
- page
  `int`，預設:1
- pageSize
  `int`，預設:10，最大值:50

#### Example Request

```curl=
GET /api/orders?keyword={keyword}&customer_id={customer_id}&address_id={address_id}&page={page}&pageSize={page size} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data": [{
        "id": "xxx",
        "order_date": "xxxx",
        "number": "xxxxx",
        "deliver_date": "xxx",
        "address": {
            "id": "xxx",
            "name": "xxxx",
            "address": "xxxx"
        }
        "customer": {
            "id": "xxxx",
            "name": "xxxx",
            "vat_id": "xxxx",
        },
        "division": {
            "id": "xxx",
            "name": "xxx"
        },
        "remark": "xxx",
        "item_count": int,
        "amount": "xxx",
        "final_amount": "xxxx",
        "state": "xxx",
        "ship_status": "xxxx"
    },...], // 如果有的話
    "meta": {
        "page": int, // 當前頁面
        "page_size": int, // 每頁筆數
        "total_count": int, // 總資料筆數
        "page_count": int, // 分頁總數
    } // 如果有的話
}
```

### 5.5.2 查詢特定訂單

#### Method

`GET`

#### Path Parameter

- id
  Ref: orders.id

#### Example Request

```curl=
GET /api/orders/{id} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data":  {
        "id": "xxx",
        "order_date": "xxxx",
        "number": "xxxxx",
        "deliver_date": "xxx",
        "address": {
            "id": "xxx",
            "name": "xxxx",
            "address": "xxxx"
        },
        "customer": {
            "id": "xxxx",
            "name": "xxxx",
            "vat_id": "xxxx",
        },
        "division": {
            "id": "xxx",
            "name": "xxx"
        },
        "remark": "xxx",
        "amount": "xxx",
        "final_amount": "xxxx",
        "state": "xxx",
        "ship_status": "xxxx",
        "items": [
            {
                "product_id": "xxx",
                "product_img_url": "xxx",
                "product_name": "xxx",
                "product_desc": "xxx",
                "box_net_weight": "xxx",
                "unit": "xxx",
                "quantity": "xxx",
                "final_quantity": "xxx",
                "price": "xxx",
                "deal_price": "xxx",
                "weight": "xxx",
                "final_weight": "xxx",
                "sub_total": "xxx",
                "final_total": "xxx",
                "remark": "xxx"
            },...
        ]
    } // 如果有的話
}
```

### 5.5.3 變更特定訂單

#### Method

`POST`

#### Path Parameter

- id
  Ref: orders.id

#### Example Request

```curl=
POST /api/orders/{id}/modify -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
{
    "deliver_date": "xxx",
    "address_id": "xxx",
    "customer_id": "xxx",
    "division_id": "xxx",
    "remark": "xxx",
    "items": [
        {
            "product_id": "xxx",
            "product_img_url": "xxx",
            "product_name": "xxx",
            "product_desc": "xxx",
            "box_net_weight": "xxx",
            "unit": "xxx",
            "quantity": "xxx",
            "price": "xxx",
            "weight": "xxx",
            "sub_total": "xxx",
            "final_total": "xxx",
            "remark": "xxx"
        },...
    ]
}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
}
```

---

## 5.6 後台管理-同步任務相關

### 5.6.1 查詢任務

#### Method

`GET`

#### Query Parameter

- category
  `String`
- action
  `String`
- page
  `int`，預設:1
- pageSize
  `int`，預設:10，最大值:50

#### Example Request

```curl=
GET /api/jobs?category={category}&action={action}&page={page}&pageSize={page size} -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
    "data": [{
        "id": "xxx",
        "category": "xxxx",
        "action": "xxxx",
        "state": "xxxx",
        "error_message": "xxxx",
        "begin_at": "xxxx",
        "end_at": "xxxx",
        "created_at": "xxxxx",
        "creator": {
            "id": "xxxx",
            "name": "xxxx"
        }
    },...], // 如果有的話
    "meta": {
        "page": int, // 當前頁面
        "page_size": int, // 每頁筆數
        "total_count": int, // 總資料筆數
        "page_count": int, // 分頁總數
    } // 如果有的話
}
```

### 5.6.2 建立任務

> **category 必須為 manual**

#### Method

`POST`

#### Example Request

```curl=
POST /api/jobs -H "Content-Type: application/json" -H "Authorization: Bearer <access token>"
{
    "action": "1"
}
```

#### Example Response

```json=
{
    "status": ["Success"|"Faile"],
    "code": [200|5xx|4xx],
    "error_message": "xxxxx", // 如果有的話
}
```

---

# 6 Middleware 後台UI

## 6.1 登入

### 6.1.1 說明

使用者輸入帳號與密碼進行登入作業。

### 6.1.1.1 Prototype

![](https://hackmd.atelli.ai/uploads/a4a4321e-108e-4200-a87e-4acba39fc107.png)

## 6.2 系統介面

### 6.2.1 說明

該介面提供

- LINE客戶管理
  - 查詢
- 訂單管理
  - 查詢
- 使用者管理
  - 查詢
  - 建立
- 操作記錄
  - 查詢

### 6.2.2 Prototype

![](https://hackmd.atelli.ai/uploads/c4a557d2-e9ad-4dcb-b6d0-e2dab9555342.png)

## 6.3 建立使用者

### 6.3.1 說明

1. 輸入 M3 User ID, Division ID, 使用者帳號，密碼、姓名、角色
2. 角色為下拉選單，值域為 管理者:admin|系統管理者:system_admin

### 6.3.2 Prototype

![](https://hackmd.atelli.ai/uploads/0cc175c9-f8e6-4e82-a6d9-1482b106704e.png)

## 6.4 查詢使用者

### 6.4.1 說明

1. 一頁10筆，列出當前頁面的使用者列表，包含使用者編號/姓名/帳號/地區(Division)/狀態/角色/建立者/建立時間/更新者/更新時間
2. 可透過 關鍵字 查詢 (姓名/帳號/地區)
3. 狀態為 active 與 inactive，並且可直接點擊作切換
4. 有編輯資料按紐，點擊後進入資料編輯頁
5. 有重設密碼按紐，點擊後進入密碼修改頁

### 6.4.2 Prototype

![](https://hackmd.atelli.ai/uploads/b43d9e39-94ff-4211-b2f0-c09326c1d7f6.png)

## 6.5 重設使用者密碼

### 6.5.1 說明

1. 輸入新密碼與新密碼確認
2. 進行送出

### 6.5.2 Prototype

![](https://hackmd.atelli.ai/uploads/52e7f5fa-60af-4052-83fe-d149d8c41524.png)

## 6.6 編輯使用者資料

### 6.6.1 說明

1. 顯示使用 Username
2. 可輸入 M3 User ID, Division ID, 姓名、角色
3. 角色為下拉選單，值域為 管理者:admin|系統管理者:system_admin

### 6.6.2 Prototype

![](https://hackmd.atelli.ai/uploads/55f52825-8187-4edb-a0b9-19fbdc34d282.png)

## 6.7 查詢LINE客戶列表

### 6.7.1 說明

1. 一頁10筆，列出當前頁面的LINE客戶列表，包含LINE UID/Display Name/名稱/E-Mail/Phone/公司名稱/是否通過驗證/狀態/加入時間
2. 可透過 關鍵字 查詢 (Display Name/名稱/E-Mail/Phone/公司名稱)
3. 狀態為 active 與 inactive，並且可直接點擊作切換
4. 有編輯資料按紐，點擊後進入資料編輯頁

### 6.7.2 Prototype

![](https://hackmd.atelli.ai/uploads/0369f2ff-c705-414d-8d68-10a5b9e32d61.png)

## 6.8 編輯特定LINE客戶

### 6.8.1 說明

1. 顯示 LINE UID/ Display Name/ Name
2. 設定該客戶的M3客戶資料，包含 客戶ID/地區ID/地點ID
3. 可設定多組M3客戶資料對應給同一個LINE UID
4. 客戶ID > 地區 ID > 地點ID 依序有相依性
5. 增加 顯示價格 的選項 (Add By Eric Huang @ 20260402)

### 6.8.2 Prototype

![](https://hackmd.atelli.ai/uploads/c8d78b3a-95b1-4463-a881-a1720abd2634.png)

## 6.9 查詢訂單列表

### 6.9.1 說明

1. 一頁10筆，列出當前頁面的訂單列表，包含訂單編號/訂單日期/客戶/地區/地點ID/品項數量/總金額/狀態/配送狀態
2. 可透過 關鍵字 查詢 (訂單編號/客戶ID/地區ID/地點ID)
3. 有編輯按紐，點擊後進入訂單編輯頁

### 6.9.2 Prototype

![](https://hackmd.atelli.ai/uploads/0a3b009e-7c43-4371-8182-155c28329bc0.png)

## 6.10 查閱特定訂單

### 6.10.1 說明

1. 顯示 訂單號碼/日期/狀態/建立者
2. 顯示 金額 與 品項
3. 每一個品項包含 商品編號/圖片/名稱/說明/每箱對應的重量/該項目使弿單位/數量/時價/購買重量/小計/備註

### 6.10.2 Prototype

![](https://hackmd.atelli.ai/uploads/259528ca-0fbd-437d-b938-888174e246cf.png)

## 6.11 編輯特定訂單

### 6.11.1 說明

1. 同查閱特定訂單
2. 可編輯品項的單位、數量
3. 可刪除品項
4. 進行儲存

### 6.11.2 Prototype

![](https://hackmd.atelli.ai/uploads/89094c01-959f-4d12-bd41-0282efffe852.png)

## 6.12 查詢任務

### 6.12.1 說明

1. 顯示 任務編號、類型、任務內容(動作)、任務狀態、開始時間、結束時間，建立時間、建立者
2. 當 state 為 failed 時，任務狀態下方增加錯誤訊息

### 6.12.2 Prototype

![](https://hackmd.atelli.ai/uploads/f09597e3-7529-4bac-8552-c83ee671b444.png)

## 6.13 建立任務

### 6.13.1 說明

1. 輸入預建立任務的動作
2. 動作為下拉選單
3. 進行儲存

### 6.13.2 Prototype

![](https://hackmd.atelli.ai/uploads/bed09b2a-8784-44d0-8c97-a83e85ad8e63.png)

---

# 7 事件

## 7.1 LINE用戶驗證成功

### 7.1.1 觸發時間

當 line_users 的 is_cusomter 資料狀態，從 N 改為 Y 時(即認證後)，須上傳該資料給 infobip

### 7.1.2 Infobip Request

待定
