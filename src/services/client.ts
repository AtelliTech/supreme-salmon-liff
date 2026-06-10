import ky from "ky";

const client = ky.create({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  checkUser(lineUserId: string, requestOptions = {}) {
    return client.get(`api/liff/user_check/${lineUserId}`, requestOptions);
  },

  createLineUser(payload: object, requestOptions = {}) {
    return client.post("api/liff/line_users", { json: payload, ...requestOptions });
  },

  getProducts(lineUserId: string, searchParams = {}, requestOptions = {}) {
    return client.get(`api/liff/${lineUserId}/products`, {
      searchParams,
      ...requestOptions,
    });
  },

  createOrder(lineUserId: string, payload: object, requestOptions = {}) {
    return client.post(`api/liff/${lineUserId}/orders`, {
      json: payload,
      ...requestOptions,
    });
  },

  updateOrder(
    lineUserId: string,
    number: string,
    payload: object,
    requestOptions = {},
  ) {
    return client.patch(`api/liff/${lineUserId}/orders/${number}`, {
      json: payload,
      ...requestOptions,
    });
  },

  getOrders(lineUserId: string, payload = {}, requestOptions = {}) {
    return client.post(`api/liff/${lineUserId}/orders`, {
      json: payload,
      ...requestOptions,
    });
  },

  getOrderDetail(
    lineUserId: string,
    number: string,
    searchParams = {},
    requestOptions = {},
  ) {
    return api.get(`liff/${lineUserId}/orders/${number}`, {
      searchParams,
      ...requestOptions,
    });
  },
};
