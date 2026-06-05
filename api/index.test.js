/**
 * Integration tests for LIFF API (api/index.js)
 *
 * Configure via environment variables before running:
 *   BASE_URL=https://api.mowi.ilnk.io \
 *   LINE_USER_ID=Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
 *   yarn test
 *
 * Optional variables for order-related tests:
 *   CUSTOMER_ID=xxx
 *   DIVISION_ID=xxx
 *   ORDER_NUMBER=xxx
 */

import { describe, expect, it } from "vitest";
import { createLiffApi } from "./index.js";

// ─── Configurable ────────────────────────────────────────────────────────────
const BASE_URL = process.env.BASE_URL ?? "https://api.mowi.ilnk.io";
const LINE_USER_ID = process.env.LINE_USER_ID ?? "";
const CUSTOMER_ID = process.env.CUSTOMER_ID ?? "";
const DIVISION_ID = process.env.DIVISION_ID ?? "";
const ORDER_NUMBER = process.env.ORDER_NUMBER ?? "";
// ─────────────────────────────────────────────────────────────────────────────

const api = createLiffApi({ baseUrl: BASE_URL });

// Helper: assert the standard API envelope is present
function assertEnvelope(body) {
  expect(
    body !== null && typeof body === "object",
    "response body should be an object",
  ).toBe(true);
  expect("status" in body, 'response should have "status" field').toBe(true);
  expect("code" in body, 'response should have "code" field').toBe(true);
}

function missingEnv(...names) {
  return names.filter((name) => !process.env[name]);
}

// ─── 5.1.1 LINE USER 查詢 ─────────────────────────────────────────────────────
describe("5.1.1 checkUser (GET /liff/user_check/:line_user_id)", () => {
  const checkUserIt = missingEnv("LINE_USER_ID").length > 0 ? it.skip : it;

  checkUserIt("returns envelope with data when user exists", async () => {
    const res = await api.checkUser(LINE_USER_ID);

    assertEnvelope(res);
    if (res.data) {
      expect(typeof res.data.line_uid, "data.line_uid should be a string").toBe(
        "string",
      );
      expect("display_name" in res.data, "data should have display_name").toBe(
        true,
      );
      expect("is_customer" in res.data, "data should have is_customer").toBe(
        true,
      );
      expect(
        "display_price" in res.data,
        "data should have display_price",
      ).toBe(true);
    }
  });

  it("throws TypeError for missing lineUserId argument", () => {
    expect(() => api.checkUser("")).toThrow(/lineUserId is required/i);
  });
});

// ─── 5.1.2 LINE USER 建立 ─────────────────────────────────────────────────────
describe("5.1.2 createLineUser (POST /liff/line_users)", () => {
  const createUserIt = missingEnv("LINE_USER_ID").length > 0 ? it.skip : it;

  it("requires payload argument", () => {
    expect(() => api.createLineUser(null)).toThrow(/payload is required/i);
  });

  createUserIt("returns envelope after creating a user", async () => {
    const res = await api.createLineUser({
      line_uid: LINE_USER_ID,
      display_name: "Test User",
      name: "Test User",
      email: "test@example.com",
      phone: "0900000000",
      company_name: "Test Co.",
      vat_id: "00000000",
    });

    assertEnvelope(res);
    if (res.data) {
      expect(res.data.line_uid).toBe(LINE_USER_ID);
    }
  });
});

// ─── 5.1.3 LINE USER 商品查詢 ─────────────────────────────────────────────────
describe("5.1.3 getProducts (GET /liff/:line_user_id/products)", () => {
  const productsIt =
    missingEnv("LINE_USER_ID", "CUSTOMER_ID", "DIVISION_ID").length > 0
      ? it.skip
      : it;

  it("requires customerId and divisionId", () => {
    expect(() => api.getProducts(LINE_USER_ID, { divisionId: "d1" })).toThrow(
      /customerId is required/i,
    );
    expect(() => api.getProducts(LINE_USER_ID, { customerId: "c1" })).toThrow(
      /divisionId is required/i,
    );
  });

  productsIt("returns paginated product list", async () => {
    const res = await api.getProducts(LINE_USER_ID, {
      customerId: CUSTOMER_ID,
      divisionId: DIVISION_ID,
      page: 1,
      pageSize: 10,
    });

    assertEnvelope(res);
    if (res.data) {
      expect(Array.isArray(res.data), "data should be an array").toBe(true);
    }
    if (res.meta) {
      expect(typeof res.meta.page, "meta.page should be a number").toBe(
        "number",
      );
      expect(
        typeof res.meta.total_count,
        "meta.total_count should be a number",
      ).toBe("number");
    }
  });

  productsIt("supports optional category_id filter", async () => {
    const res = await api.getProducts(LINE_USER_ID, {
      customerId: CUSTOMER_ID,
      divisionId: DIVISION_ID,
      categoryId: "nonexistent",
    });

    assertEnvelope(res);
  });
});

// ─── 5.1.4 LINE USER 訂單建立 ─────────────────────────────────────────────────
describe("5.1.4 createOrder (POST /liff/:line_user_id/orders)", () => {
  const createOrderIt =
    missingEnv("LINE_USER_ID", "CUSTOMER_ID", "DIVISION_ID").length > 0
      ? it.skip
      : it;

  it("requires payload argument", () => {
    expect(() => api.createOrder(LINE_USER_ID, null)).toThrow(
      /payload is required/i,
    );
  });

  createOrderIt("returns order envelope with id and number", async () => {
    const res = await api.createOrder(LINE_USER_ID, {
      deliver_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      customer_id: CUSTOMER_ID,
      division_id: DIVISION_ID,
      remark: "integration test order",
      items: [],
    });

    assertEnvelope(res);
    if (res.data) {
      expect("id" in res.data, "data should have id").toBe(true);
      expect("number" in res.data, "data should have number").toBe(true);
      expect("order_date" in res.data, "data should have order_date").toBe(
        true,
      );
      expect("amount" in res.data, "data should have amount").toBe(true);
    }
  });
});

// ─── 5.1.5 LINE USER 訂單修改 ─────────────────────────────────────────────────
describe("5.1.5 updateOrder (PATCH /liff/:line_user_id/orders/:number)", () => {
  const updateOrderIt =
    missingEnv("LINE_USER_ID", "ORDER_NUMBER", "CUSTOMER_ID", "DIVISION_ID")
      .length > 0
      ? it.skip
      : it;

  it("requires number and payload arguments", () => {
    expect(() => api.updateOrder(LINE_USER_ID, "", {})).toThrow(
      /number is required/i,
    );
    expect(() => api.updateOrder(LINE_USER_ID, "ORD-001", null)).toThrow(
      /payload is required/i,
    );
  });

  updateOrderIt("returns updated order envelope", async () => {
    const res = await api.updateOrder(LINE_USER_ID, ORDER_NUMBER, {
      deliver_date: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
      customer_id: CUSTOMER_ID,
      division_id: DIVISION_ID,
      remark: "updated by integration test",
      items: [],
    });

    assertEnvelope(res);
    if (res.data) {
      expect(res.data.number).toBe(ORDER_NUMBER);
    }
  });
});

// ─── 5.1.6 LINE USER 訂單查詢 ─────────────────────────────────────────────────
describe("5.1.6 listOrders (GET /liff/:line_user_id/orders)", () => {
  const listOrdersIt = missingEnv("LINE_USER_ID").length > 0 ? it.skip : it;

  listOrdersIt(
    "returns paginated order list sorted by order_date desc",
    async () => {
      const res = await api.listOrders(LINE_USER_ID, { page: 1, pageSize: 10 });

      assertEnvelope(res);
      if (res.data) {
        expect(Array.isArray(res.data), "data should be an array").toBe(true);

        for (let i = 1; i < res.data.length; i++) {
          expect(
            res.data[i - 1].order_date >= res.data[i].order_date,
            "orders should be sorted by order_date descending",
          ).toBe(true);
        }

        if (res.data.length > 0) {
          const order = res.data[0];
          expect("number" in order, "order should have number").toBe(true);
          expect("state" in order, "order should have state").toBe(true);
          expect("ship_status" in order, "order should have ship_status").toBe(
            true,
          );
          expect("item_count" in order, "order should have item_count").toBe(
            true,
          );
        }
      }
      if (res.meta) {
        expect(typeof res.meta.page).toBe("number");
        expect(typeof res.meta.page_size).toBe("number");
        expect(typeof res.meta.total_count).toBe("number");
        expect(typeof res.meta.page_count).toBe("number");
      }
    },
  );

  listOrdersIt("respects pageSize cap (max 50)", async () => {
    const res = await api.listOrders(LINE_USER_ID, { page: 1, pageSize: 50 });
    assertEnvelope(res);
    if (res.data) {
      expect(res.data.length <= 50, "should return at most 50 items").toBe(
        true,
      );
    }
  });
});

// ─── 5.1.7 LINE USER 詳細訂單資料 ─────────────────────────────────────────────
describe("5.1.7 getOrderDetail (GET /liff/:line_user_id/orders/:number)", () => {
  const orderDetailIt =
    missingEnv("LINE_USER_ID", "ORDER_NUMBER").length > 0 ? it.skip : it;

  it("requires number argument", () => {
    expect(() => api.getOrderDetail(LINE_USER_ID, "")).toThrow(
      /number is required/i,
    );
  });

  orderDetailIt("returns full order detail with items array", async () => {
    const res = await api.getOrderDetail(LINE_USER_ID, ORDER_NUMBER);

    assertEnvelope(res);
    if (res.data) {
      expect(res.data.number).toBe(ORDER_NUMBER);
      expect(
        Array.isArray(res.data.items),
        "data.items should be an array",
      ).toBe(true);
      expect("address" in res.data, "data should have address").toBe(true);
      expect("customer" in res.data, "data should have customer").toBe(true);
      expect("division" in res.data, "data should have division").toBe(true);
      expect("state" in res.data, "data should have state").toBe(true);
      expect("ship_status" in res.data, "data should have ship_status").toBe(
        true,
      );
      expect("final_amount" in res.data, "data should have final_amount").toBe(
        true,
      );

      if (res.data.items.length > 0) {
        const item = res.data.items[0];
        expect("product_id" in item).toBe(true);
        expect("quantity" in item).toBe(true);
        expect("price" in item).toBe(true);
        expect("sub_total" in item).toBe(true);
        expect("final_total" in item).toBe(true);
      }
    }
  });
});
