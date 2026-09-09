import apiClient from "../untils/auth";

export const enrollmentService = {
  /**
   * Kiểm tra khách hàng đã mua sản phẩm chưa
   * GET /api/courses/{productId}/check-enrollment
   */
  async checkEnrollment(productId) {
    try {
      const res = await apiClient.get(
        `/courses/${productId}/check-enrollment`
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
   * POST /api/courses/enroll
   *
   * Đây chỉ là API tương thích với backend hiện tại.
   * Thanh toán VNPay thực tế dùng paymentService.
   */
  async enrollCourse(productId) {
    try {
      const res = await apiClient.post("/courses/enroll", {
        product_id: productId,
        course_id: productId,
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
   * GET /api/courses/my-courses
   *
   * Giữ tên getMyCourses để không làm hỏng component cũ.
   */
  async getMyCourses() {
    try {
      const res = await apiClient.get("/courses/my-courses");

      const products = res.data?.data || [];

      if (!Array.isArray(products)) {
        return [];
      }

      return products.map((item) => ({
        productId:
          item.product_id ??
          item.course_id ??
          item.id,

        courseId:
          item.course_id ??
          item.product_id ??
          item.id,

        id:
          item.product_id ??
          item.course_id ??
          item.id,

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
    return this.getMyCourses();
  },

  /**
   * API tiến độ học không còn sử dụng cho website bao bì.
   * Giữ lại để component cũ không bị lỗi import.
   */
  async getLearningProgress() {
    return {
      progress: 0,
      completedLessons: 0,
      currentLessonId: null,
    };
  },
};