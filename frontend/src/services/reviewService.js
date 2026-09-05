import { getCurrentUser } from "../untils/auth";

const KEY = "courseReviews";

const getAllReviews = () => {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
};

const saveAllReviews = (data) => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const reviewService = {
  getCourseReviews(courseId) {
    const all = getAllReviews();
    return all[courseId] || [];
  },

  addOrUpdateReview(courseId, payload) {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("USER_NOT_LOGGED_IN");

    const all = getAllReviews();
    const courseReviews = all[courseId] || [];

    const existedIndex = courseReviews.findIndex(
      (item) => Number(item.userId) === Number(currentUser.id)
    );

    const review = {
      id:
        existedIndex >= 0
          ? courseReviews[existedIndex].id
          : Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      courseId: Number(courseId),
      rating: Number(payload.rating),
      comment: payload.comment?.trim() || "",
      createdAt:
        existedIndex >= 0
          ? courseReviews[existedIndex].createdAt
          : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existedIndex >= 0) {
      courseReviews[existedIndex] = review;
    } else {
      courseReviews.unshift(review);
    }

    all[courseId] = courseReviews;
    saveAllReviews(all);

    return review;
  },

  getMyReview(courseId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    const courseReviews = this.getCourseReviews(courseId);
    return (
      courseReviews.find(
        (item) => Number(item.userId) === Number(currentUser.id)
      ) || null
    );
  },

  getCourseReviewStats(courseId) {
    const reviews = this.getCourseReviews(courseId);

    if (!reviews.length) {
      return {
        average: 0,
        total: 0,
      };
    }

    const totalRating = reviews.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0
    );

    return {
      average: Number((totalRating / reviews.length).toFixed(1)),
      total: reviews.length,
    };
  },
};