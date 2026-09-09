import apiClient from "../untils/auth";

// =========================
// PROFILE
// =========================
export const getProfile = async () => {
  const response = await apiClient.get("/users/profile");
  return response.data;
};

export const updateProfile = async (payload) => {
  const response = await apiClient.put(
    "/users/profile",
    payload
  );

  return response.data;
};

// =========================
// ORDERS
// =========================
export const getMyOrders = async () => {
  const response = await apiClient.get(
    "/users/orders"
  );

  return response.data;
};

export const getOrderDetail = async (orderId) => {
  const response = await apiClient.get(
    `/users/orders/${orderId}`
  );

  return response.data;
};

// Alias dùng cho trang chi tiết đơn hàng
export const getMyOrderDetail = async (orderId) => {
  return getOrderDetail(orderId);
};

const userService = {
  getProfile,
  updateProfile,
  getMyOrders,
  getOrderDetail,
  getMyOrderDetail,
};

export default userService;