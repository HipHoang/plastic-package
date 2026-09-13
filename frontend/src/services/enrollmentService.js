import apiClient from "../untils/auth";

export const orderService = {
  /**
   * Kiểm tra khách hàng đã mua sản phẩm chưa
   * GET /api/products/{productId}/check-enrollment
   */
  async checkOrder(productId) {
    try {
      const res = await apiClient.get(
        `/products/${productId}/check-order`
      );

      return (
        res.data?.data?.isPurchased === true ||
        res.data?.data?.isEnrolled === true ||
        res.data?.is_purchased === true ||
        res.data?.is_enrolled === true
      );
    } catch (error) {
      console.error(
        "checkPurchase ERROR:",
        error.response?.data || error
      );

      return false;
    }
  },

  /**
   * Đặt mua sản phẩm
   * POST /api/products/enroll
   *
   * Đây chỉ là API tương thích với backend hiện tại.
   * Thanh toán VNPay thực tế dùng paymentService.
   */
  async enrollCourse(productId) {
    try {
      const res = await apiClient.post("/products/orders", {
        product_id: productId,
      });

      return res.data;
    } catch (error) {
      console.error(
        "purchaseProduct ERROR:",
        error.response?.data || error
      );

      throw error;
    }
  },

  /**
   * Alias mới cho website bao bì
   */
  async purchaseProduct(productId) {
    return this.enrollCourse(productId);
  },

  /**
   * Lấy danh sách sản phẩm đã mua
   * GET /api/products/my-products
   */
  async getMyOrders() {
    try {
      const res = await apiClient.get("/products/my-products");

      const products = res.data?.data || [];

      if (!Array.isArray(products)) {
        return [];
      }

      return products.map((item) => ({
        productId:
          item.product_id ??
          item.product_id ?? item.id,

        id:
          item.product_id ??
          item.product_id ?? item.id,

        name:
          item.name ||
          item.title ||
          "",

        title:
          item.title ||
          item.name ||
          "",

        description:
          item.description || "",

        image:
          item.image ||
          item.thumbnail ||
          "",

        price:
          Number(item.price || 0),

        quantity:
          Number(item.quantity || 1),

        unit:
          item.unit || "cái",

        material:
          item.material || "",

        status:
          item.status ||
          "Đã mua",

        purchasedAt:
          item.created_at ||
          item.purchased_at ||
          null,
      }));
    } catch (error) {
      console.error(
        "getMyProducts ERROR:",
        error.response?.data || error
      );

      return [];
    }
  },

  /**
   * Alias mới
   */
  async getMyProducts() {
    return this.getMyOrders();
  },

  async getLearningProgress() {
    return {
      progress: 0,
      completedLessons: 0,
      currentLessonId: null,
    };
  },
};

export const enrollmentService = {
  ...orderService,
  checkEnrollment: orderService.checkOrder,
  enrollCourse: orderService.enrollCourse,
  getMyCourses: orderService.getMyOrders,
};