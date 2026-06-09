import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
    this.method = options.method;
    this.url = options.url;
    this.payload = options.payload;
    this.cause = options.cause;
  }
}

export function createApi(options = {}) {
  const api = axios.create({
    baseURL: "https://api.mowi.ilnk.io/api",
    timeout: 3000,
  });

  mockApi(api);

  return {
    checkUser(lineUserId, requestOptions = {}) {
      if (!lineUserId) {
        return Promise.reject(
          new ApiError("lineUserId is required", {
            method: "GET",
            url: `/liff/user_check/${lineUserId}`,
          }),
        );
      }

      return api.request({
        method: "GET",
        url: `/liff/user_check/${lineUserId}`,
        ...requestOptions,
      });
    },

    createLineUser(payload, requestOptions = {}) {
      return api.request({
        method: "POST",
        url: "/liff/line_users",
        data: payload,
        ...requestOptions,
      });
    },

    getProducts(lineUserId, params = {}, requestOptions = {}) {
      return api.request({
        method: "GET",
        url: `/liff/${lineUserId}/products`,
        params,
        ...requestOptions,
      });
    },

    createOrder(lineUserId, payload, requestOptions = {}) {
      return api.request({
        method: "POST",
        url: `/liff/${lineUserId}/orders`,
        data: payload,
        ...requestOptions,
      });
    },

    updateOrder(lineUserId, number, payload, requestOptions = {}) {
      if (!lineUserId) {
        return Promise.reject(
          new ApiError("lineUserId is required", {
            method: "PATCH",
            url: `/liff/${lineUserId}/orders/${number}`,
            payload,
          }),
        );
      }

      if (!number) {
        return Promise.reject(
          new ApiError("Order number is required", {
            method: "PATCH",
            url: `/liff/${lineUserId}/orders/${number}`,
            payload,
          }),
        );
      }

      return api.request({
        method: "PATCH",
        url: `/liff/${lineUserId}/orders/${number}`,
        data: payload,
        ...requestOptions,
      });
    },

    getOrders(lineUserId, payload = {}, requestOptions = {}) {
      return api.request({
        method: "POST",
        url: `/liff/${lineUserId}/orders`,
        data: payload,
        ...requestOptions,
      });
    },

    getOrderDetail(lineUserId, number, params = {}, requestOptions = {}) {
      return api.request({
        method: "GET",
        url: `/liff/${lineUserId}/orders/${number}`,
        params,
        ...requestOptions,
      });
    },
  };
}

function mockApi(api) {
  const mock = new AxiosMockAdapter(api, {
    onNoMatch: "passthrough",
  });

  mock.onGet("/liff/U05186207f72d445ae6eba79ab4e13998/products").reply(200, {
    status: "Success",
    code: 200,
    data: [
      {
        id: "prod-001",
        img_url: "/placeholder.jpg",
        name: "挪威鮭魚菲力",
        description: "新鮮挪威鮭魚，肉質細嫩，富含 Omega-3",
        category: {
          id: "cat-001",
          name: "鮭魚",
        },
        box_net_weight: "1kg",
        unit_price: "580",
        remark: "",
      },
      {
        id: "prod-002",
        img_url: "/placeholder.jpg",
        name: "挪威鮭魚切片",
        description: "精選挪威鮭魚切片，適合生魚片或烤食",
        category: {
          id: "cat-001",
          name: "鮭魚",
        },
        box_net_weight: "500g",
        unit_price: "320",
        remark: "限量供應",
      },
      {
        id: "prod-003",
        img_url: "/placeholder.jpg",
        name: "鮭魚卵",
        description: "頂級鮭魚卵，顆粒飽滿，口感鮮美",
        category: {
          id: "cat-002",
          name: "鮭魚加工品",
        },
        box_net_weight: "200g",
        unit_price: "450",
        remark: "",
      },
    ],
    meta: {
      page: 1,
      page_size: 10,
      total_count: 3,
      page_count: 1,
    },
  });

  mock.onPost("/liff/U05186207f72d445ae6eba79ab4e13998/orders").reply(200, {
    deliver_date: "xxx",
    address_id: "xxx",
    customer_id: "xxx",
    division_id: "xxx",
    remark: "xxx",
    items: [
      {
        product_id: "xxx",
        product_img_url: "xxx",
        product_name: "xxx",
        product_desc: "xxx",
        box_net_weight: "xxx",
        unit: "xxx",
        quantity: "xxx",
        price: "xxx",
        weight: "xxx",
        sub_total: "xxx",
        final_total: "xxx",
        remark: "xxx",
      },
    ],
  });
}
