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
