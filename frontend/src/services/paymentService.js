import { storageService } from "./storageService";

const KEY = "payments";

export const paymentService = {
  createPayment(payload) {
    const payment = {
      id: Date.now(),
      ...payload,
      status: "success",
      createdAt: new Date().toISOString(),
    };

    storageService.addUserItem(KEY, payment);
    return payment;
  },

  getMyPayments() {
    return storageService.getUserData(KEY);
  },

  hasPaidCourse(courseId) {
    const myPayments = storageService.getUserData(KEY);
    return myPayments.some(
      (item) =>
        Number(item.courseId) === Number(courseId) && item.status === "success"
    );
  },
};