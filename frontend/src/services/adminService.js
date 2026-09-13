import apiClient from "../untils/auth";

const adminService = {
  // =========================
  // DASHBOARD
  // =========================
  async getStaffProducts() {
    const response = await apiClient.get("/products/staff/products");
    return response.data;
  },

  async getStaffProductStats() {
    const response = await apiClient.get("/products/staff/stats");
    return response.data;
  },

  async getStaffStats() {
    const response = await apiClient.get("/products/staff/stats");
    return response.data;
  },

  // =========================
  // ADMIN PRODUCTS
  // =========================
  async getAdminProducts() {
    const response = await apiClient.get("/products/admin/products");
    return response.data;
  },

  async getAdminCategories() {
    const response = await apiClient.get("/products/admin/product-categories");
    return response.data;
  },

  async getAdminCustomers() {
    const response = await apiClient.get("/users/admin/customers");
    return response.data;
  },

  async getAdminPosts() {
    const response = await apiClient.get("/posts/admin");
    return response.data;
  },

  async getAdminReviews() {
    const response = await apiClient.get("/reviews/admin");
    return response.data;
  },

  async getAdminProductDetail(productId) {
    const response = await apiClient.get(
      `/products/admin/products/${productId}`
    );
    return response.data;
  },

  async createProduct(formData) {
    const response = await apiClient.post(
      "/products/admin/products",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async updateProduct(productId, formData) {
    const response = await apiClient.put(
      `/products/admin/products/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async deleteProduct(productId) {
    const response = await apiClient.delete(
      `/products/admin/products/${productId}`
    );

    return response.data;
  },

  async getProductDetail(productId) {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  },

  // =========================
  // ADMIN ORDERS
  // =========================
  async getAdminOrders() {
    const response = await apiClient.get(
      "/users/admin/orders"
    );

    return response.data;
  },

  async getAdminOrderDetail(orderId) {
    const response = await apiClient.get(
      `/users/admin/orders/${orderId}`
    );

    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await apiClient.put(
      `/users/admin/orders/${orderId}/status`,
      { status }
    );

    return response.data;
  },
};

export { adminService };

export default adminService;