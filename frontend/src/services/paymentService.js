import apiClient from "../untils/auth";

export const paymentService = {
  // =========================
  // THANH TOÁN VNPAY
  // =========================
  async createPayment(payload) {
    try {
      const productId =
        payload?.productId ??
        payload?.product_id ??
        payload?.courseId ??
        payload?.course_id;

      if (!productId) {
        throw new Error("Thiếu mã sản phẩm");
      }

      const quantity = Number(
        payload?.quantity || 1
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error(
          "Số lượng sản phẩm không hợp lệ"
        );
      }

      const response = await apiClient.post(
        "/payment/checkout",
        {
          product_id: Number(productId),
          course_id: Number(productId),
          quantity,

          customer_name:
            payload?.customerName ??
            payload?.customer_name ??
            "",

          customer_phone:
            payload?.customerPhone ??
            payload?.customer_phone ??
            "",

          customer_email:
            payload?.customerEmail ??
            payload?.customer_email ??
            "",

          customer_address:
            payload?.customerAddress ??
            payload?.customer_address ??
            "",

          note:
            payload?.note ??
            "",
        }
      );

      const data = response.data;

      if (!data?.payment_url) {
        throw new Error(
          data?.message ||
          "Không nhận được đường dẫn thanh toán từ hệ thống"
        );
      }

      // Chuyển khách hàng sang cổng VNPay
      window.location.href =
        data.payment_url;

      return data;
    } catch (error) {
      console.error(
        "createPayment ERROR:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  // =========================
  // ĐẶT HÀNG COD
  // =========================
  async createCodOrder(payload) {
    try {
      const productId =
        payload?.productId ??
        payload?.product_id ??
        payload?.courseId ??
        payload?.course_id;

      if (!productId) {
        throw new Error(
          "Thiếu mã sản phẩm"
        );
      }

      const quantity = Number(
        payload?.quantity || 1
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error(
          "Số lượng sản phẩm không hợp lệ"
        );
      }

      const response = await apiClient.post(
        "/payment/cod",
        {
          product_id: Number(productId),
          course_id: Number(productId),
          quantity,

          customer_name:
            payload?.customerName ??
            payload?.customer_name ??
            "",

          customer_phone:
            payload?.customerPhone ??
            payload?.customer_phone ??
            "",

          customer_email:
            payload?.customerEmail ??
            payload?.customer_email ??
            "",

          customer_address:
            payload?.customerAddress ??
            payload?.customer_address ??
            "",

          note:
            payload?.note ??
            "",
        }
      );

      const data = response.data;

      if (!data?.success) {
        throw new Error(
          data?.message ||
          "Không thể tạo đơn hàng COD"
        );
      }

      return data;
    } catch (error) {
      console.error(
        "createCodOrder ERROR:",
        error?.response?.data || error
      );

      throw error;
    }
  },

  // =========================
  // LẤY LỊCH SỬ THANH TOÁN
  // =========================
  async getMyPayments() {
    try {
      const response = await apiClient.get(
        "/courses/my-courses"
      );

      return (
        response.data?.data || []
      );
    } catch (error) {
      console.error(
        "getMyPayments ERROR:",
        error?.response?.data || error
      );

      return [];
    }
  },

  // =========================
  // KIỂM TRA ĐÃ MUA
  // =========================
  async hasPaidCourse(productId) {
    try {
      const response = await apiClient.get(
        `/courses/${productId}/check-enrollment`
      );

      return (
        response.data?.data?.isPurchased === true ||
        response.data?.data?.isEnrolled === true
      );
    } catch (error) {
      console.error(
        "hasPaidProduct ERROR:",
        error?.response?.data || error
      );

      return false;
    }
  },

  // =========================
  // ALIAS
  // =========================
  async hasPurchasedProduct(productId) {
    return this.hasPaidCourse(
      productId
    );
  },
};
