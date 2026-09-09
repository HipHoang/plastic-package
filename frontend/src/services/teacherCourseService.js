import apiClient from "../untils/auth";

const teacherCourseService = {
  // =========================
  // DASHBOARD
  // =========================
  async getTeacherCourses() {
    const response = await apiClient.get("/courses/instructor");
    return response.data;
  },

  async getTeacherCourseStats() {
    const response = await apiClient.get("/courses/instructor/stats");
    return response.data;
  },

  async getTeacherStats() {
    const response = await apiClient.get("/courses/instructor/stats");
    return response.data;
  },

  // =========================
  // ADMIN PRODUCTS
  // =========================
  async getAdminProducts() {
    const response = await apiClient.get("/courses/admin/products");
    return response.data;
  },

  async getAdminProductDetail(productId) {
    const response = await apiClient.get(
      `/courses/admin/products/${productId}`
    );
    return response.data;
  },

  async createProduct(formData) {
    const response = await apiClient.post(
      "/courses/admin/products",
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
      `/courses/admin/products/${productId}`,
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
      `/courses/admin/products/${productId}`
    );

    return response.data;
  },

  // =========================
  // LEGACY COURSE METHODS
  // =========================
  async getCourseDetail(courseId) {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  },

  async createCourse(payload) {
    const response = await apiClient.post("/courses", payload);
    return response.data;
  },

  async updateCourse(courseId, payload) {
    const response = await apiClient.put(
      `/courses/${courseId}`,
      payload
    );

    return response.data;
  },

  async deleteCourse(courseId) {
    const response = await apiClient.delete(
      `/courses/${courseId}`
    );

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

export { teacherCourseService };

export default teacherCourseService;