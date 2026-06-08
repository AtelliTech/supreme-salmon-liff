import axios from "axios";

const DEFAULT_BASE_URL = "/api";

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
    timeout: 3000
  })

  return {
    checkUser(lineUserId, requestOptions = {}) {
      if (!lineUserId) {
        return Promise.reject(new ApiError("lineUserId is required", {
          method: "GET",
          url: "/liff/user_check/{lineUserId}",
        }));
      }

      return api.request({
        method: "GET",
        url: `/liff/user_check/${lineUserId}`,
        ...requestOptions,
      })
    },

    createLineUser(payload, requestOptions = {}) {
      return api.request({
        method: "POST",
        url: "/liff/line_users",
        data: payload,
        ...requestOptions,
      })
    },

    getProducts(lineUserId, params = {}, requestOptions = {}) {
      return api.request({
        method: "GET",
        url: `/liff/${lineUserId}/products`,
        params,
        ...requestOptions
      })
    },

    createOrder(lineUserId, payload, requestOptions = {}) {
      return axios.request({
        method: "POST",
        url: `/liff/${lineUserId}/orders`,
        data: payload,
        ...requestOptions
      })
    },

    updateOrder(lineUserId, number, payload, requestOptions = {}) {
      if (!lineUserId) {
        return Promise.reject(new ApiError("lineUserId is required", {
          method: "PATCH",
          url: `/liff/${lineUserId}/orders/{number}`,
          payload,
        }));
      }

      if (!number) {
        return Promise.reject(new ApiError("Order number is required", {
          method: "PATCH",
          url: `/liff/${lineUserId}/orders/{number}`,
          payload,
        }));
      }

      return api.request({
        method: "PATCH",
        url: `/liff/${lineUserId}/orders/${number}`,
        data: payload,
        ...requestOptions
      })
    },

    getOrders(lineUserId, params = {}, requestOptions = {}) {
      return api.request({
        method: "GET",
        url: `/liff/${lineUserId}/orders`,
        params,
        ...requestOptions
      })
    },

    getOrderDetail(lineUserId, number, params = {}, requestOptions = {}) {
      return api.request({
        method: "GET",
        url: `/liff/${lineUserId}/orders/${number}`,
        params,
        ...requestOptions
      });
    },
  };
}