import apiClient from "../untils/auth";

export const reviewService = {
  async getCourseReviews(productId, page = 1, size = 10) {
    try {
      const res = await apiClient.get(
        `/reviews/products/${productId}`,
        {
          params: {
            page,
            size,
          },
        }
      );

      const data = res.data?.data || {};

      return {
        page: data.page || page,
        size: data.size || size,
        total: data.total || 0,
        totalPages: data.total_pages || 0,

        reviews: (data.data || []).map((item) =>
          this.normalizeReview(item)
        ),
      };
    } catch (error) {
      console.error(
        "getProductReviews ERROR:",
        error.response?.data || error
      );

      return {
        page,
        size,
        total: 0,
        totalPages: 0,
        reviews: [],
      };
    }
  },

  async addOrUpdateReview(productId, payload) {
    try {
      const rating = Number(payload?.rating);

      if (rating < 1 || rating > 5) {
        throw new Error("Rating phải từ 1 đến 5");
      }

      const res = await apiClient.post(
        `/reviews/products/${productId}`,
        {
          rating,
          comment: payload?.comment?.trim() || "",
        }
      );

      const review =
        res.data?.data?.review ||
        res.data?.review ||
        null;

      return review
        ? this.normalizeReview(review)
        : res.data;
    } catch (error) {
      console.error(
        "addOrUpdateReview ERROR:",
        error.response?.data || error
      );

      throw error;
    }
  },

  async deleteReview(reviewId) {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  async getMyReview(productId) {
    try {
      const result = await this.getCourseReviews(
        productId,
        1,
        50
      );

      const currentUserId = this.getCurrentUserId();

      if (!currentUserId) {
        return null;
      }

      return (
        result.reviews.find(
          (item) =>
            Number(item.userId) === Number(currentUserId)
        ) || null
      );
    } catch (error) {
      console.error(
        "getMyReview ERROR:",
        error.response?.data || error
      );

      return null;
    }
  },

  async getCourseReviewStats(productId) {
    try {
      const result = await this.getCourseReviews(
        productId,
        1,
        1
      );

      const reviews = result.reviews || [];

      if (!reviews.length && !result.total) {
        return {
          average: 0,
          total: 0,
        };
      }

      const total =
        Number(result.total) || reviews.length;

      const totalRating = reviews.reduce(
        (sum, item) =>
          sum + Number(item.rating || 0),
        0
      );

      return {
        average:
          reviews.length > 0
            ? Number(
                (totalRating / reviews.length).toFixed(1)
              )
            : 0,
        total,
      };
    } catch (error) {
      console.error(
        "getProductReviewStats ERROR:",
        error.response?.data || error
      );

      return {
        average: 0,
        total: 0,
      };
    }
  },

  getCurrentUserId() {
    try {
      const raw =
        localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser");

      if (!raw) {
        return null;
      }

      const auth = JSON.parse(raw);

      return (
        auth?.user?.id ??
        auth?.user?.user_id ??
        null
      );
    } catch {
      return null;
    }
  },

  normalizeReview(review) {
    return {
      id:
        review.review_id ??
        review.id,

      reviewId:
        review.review_id ??
        review.id,

      userId:
        review.user_id ??
        null,

      userName:
        review.user_name ||
        review.user?.name ||
        "Khách hàng",

      productId:
        review.product_id ??
        review.course_id,

      rating:
        Number(review.rating || 0),

      comment:
        review.comment || "",

      createdAt:
        review.created_at ||
        null,

      updatedAt:
        review.updated_at ||
        null,
    };
  },
};