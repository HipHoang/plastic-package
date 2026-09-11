import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCreditCard,
  FiMail,
  FiPackage,
  FiPhone,
  FiStar,
  FiTrash2,
  FiUser,
  FiTruck,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { productService } from "../../../services/productService";
import { paymentService } from "../../../services/paymentService";
import { reviewService } from "../../../services/reviewService";
import { enrollmentService } from "../../../services/enrollmentService";
import { getCurrentUser } from "../../../untils/auth";

const formatPrice = (price) => {
  const value = Number(price || 0);

  if (value <= 0) {
    return "Liên hệ báo giá";
  }

  return `${value.toLocaleString("vi-VN")} VNĐ`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [isPurchased, setIsPurchased] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [paymentForm, setPaymentForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
  });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const [editingReviewId, setEditingReviewId] = useState(null);

  const currentUser = getCurrentUser();

  const showNotification = (message, type = "success") => {
    setNotification({
      show: true,
      type,
      message,
    });

    window.clearTimeout(
      window.__asiappNotificationTimer
    );

    window.__asiappNotificationTimer =
      window.setTimeout(() => {
        setNotification({
          show: false,
          type: "success",
          message: "",
        });
      }, 4000);
  };

  const closeNotification = () => {
    window.clearTimeout(
      window.__asiappNotificationTimer
    );

    setNotification({
      show: false,
      type: "success",
      message: "",
    });
  };

  const loadReviewData = async (productId) => {
    try {
      const result =
        await reviewService.getCourseReviews(
          productId
        );

      const reviewList = Array.isArray(result)
        ? result
        : result?.reviews ||
          result?.items ||
          result?.data ||
          [];

      setReviews(reviewList);

      if (reviewList.length > 0) {
        const total = Number(result?.total) || reviewList.length;

        const average =
          reviewList.reduce(
            (sum, item) =>
              sum + Number(item.rating || 0),
            0
          ) / total;

        setReviewStats({
          average: Number(
            average.toFixed(1)
          ),
          total,
        });
      } else {
        setReviewStats({
          average: 0,
          total: 0,
        });
      }

      try {
        const myReview =
          await reviewService.getMyReview(
            productId
          );

        if (myReview) {
          setReviewForm({
            rating: Number(
              myReview.rating || 5
            ),
            comment:
              myReview.comment || "",
          });

          setEditingReviewId(
            myReview.id ||
              myReview.review_id
          );
        }
      } catch (error) {
        console.warn(
          "Không lấy được đánh giá của khách hàng:",
          error
        );
      }
    } catch (error) {
      console.error(
        "Load review error:",
        error
      );

      setReviews([]);

      setReviewStats({
        average: 0,
        total: 0,
      });
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const data =
          await productService.getProductById(
            id
          );

        if (!data) {
          setProduct(null);
          return;
        }

        setProduct(data);

        const minQuantity = Number(
          data.minOrderQuantity ||
            data.min_order_quantity ||
            1
        );

        setQuantity(minQuantity);

        try {
          const purchased =
            await enrollmentService.checkEnrollment(
              id
            );

          setIsPurchased(
            Boolean(purchased)
          );
        } catch (error) {
          console.warn(
            "Không kiểm tra được trạng thái mua:",
            error
          );

          setIsPurchased(false);
        }

        const productId =
          data.id ||
          data.product_id ||
          data.product_id ||
          id;

        await loadReviewData(
          productId
        );

        if (currentUser) {
          setPaymentForm((prev) => ({
            ...prev,
            fullName:
              currentUser.name || "",
            email:
              currentUser.email || "",
            phone:
              currentUser.phone || "",
            address:
              currentUser.address || "",
          }));
        }
      } catch (error) {
        console.error(
          "Fetch product error:",
          error
        );

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const productId =
    product?.id ||
    product?.product_id ||
    product?.product_id ||
    id;

  const minQuantity = Number(
    product?.minOrderQuantity ||
      product?.min_order_quantity ||
      1
  );

  const unit =
    product?.unit || "cái";

  const hasFixedPrice =
    Number(product?.price || 0) > 0;

  const totalPrice = hasFixedPrice
    ? Number(product.price || 0) *
      Number(
        quantity || minQuantity
      )
    : 0;

  const handleRequireAuth = (
    message
  ) => {
    window.dispatchEvent(
      new CustomEvent(
        "openAuthModal",
        {
          detail: {
            type: "login",
            message,
          },
        }
      )
    );
  };

  const increaseQuantity = () => {
    setQuantity(
      (prev) => Number(prev) + 1
    );
  };

  const decreaseQuantity = () => {
    setQuantity((prev) =>
      Math.max(
        minQuantity,
        Number(prev) - 1
      )
    );
  };

  const handleQuantityChange = (
    event
  ) => {
    const value = Number(
      event.target.value
    );

    if (!Number.isFinite(value)) {
      setQuantity(minQuantity);
      return;
    }

    if (value < minQuantity) {
      setQuantity(minQuantity);
      return;
    }

    setQuantity(Math.floor(value));
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      handleRequireAuth(
        "Bạn cần đăng nhập để đặt mua sản phẩm."
      );

      return;
    }

    if (isPurchased) {
      return;
    }

    if (!hasFixedPrice) {
      window.location.href =
        "tel:02873008899";

      return;
    }

    setPaymentMethod("cod");
    setShowPaymentModal(true);
  };

  const handleConfirmPayment =
    async () => {
      if (!paymentForm.fullName.trim()) {
        showNotification(
          "Vui lòng nhập họ và tên.",
          "error"
        );
        return;
      }

      if (!paymentForm.phone.trim()) {
        showNotification(
          "Vui lòng nhập số điện thoại.",
          "error"
        );
        return;
      }

      if (!paymentForm.email.trim()) {
        showNotification(
          "Vui lòng nhập email.",
          "error"
        );
        return;
      }

      if (!paymentForm.address.trim()) {
        showNotification(
          "Vui lòng nhập địa chỉ giao hàng.",
          "error"
        );
        return;
      }

      if (
        Number(quantity) <
        minQuantity
      ) {
        showNotification(
          `Số lượng tối thiểu là ${minQuantity.toLocaleString(
            "vi-VN"
          )} ${unit}.`,
          "error"
        );

        return;
      }

      if (!currentUser) {
        handleRequireAuth(
          "Bạn cần đăng nhập để thanh toán."
        );

        return;
      }

      setIsProcessingPayment(true);

      try {
        const payload = {
          productId,
          quantity: Number(
            quantity
          ),

          customerName:
            paymentForm.fullName.trim(),

          customerPhone:
            paymentForm.phone.trim(),

          customerEmail:
            paymentForm.email.trim(),

          customerAddress:
            paymentForm.address.trim(),

          note:
            paymentForm.note.trim(),

          paymentMethod,
        };

        if (
          paymentMethod ===
          "vnpay"
        ) {
          await paymentService.createPayment(
            payload
          );

          return;
        }

        const response =
          await paymentService.createCodOrder(
            payload
          );

        if (
          response?.success === false
        ) {
          throw new Error(
            response?.message ||
              "Không thể tạo đơn hàng."
          );
        }

        setShowPaymentModal(false);
        setIsProcessingPayment(false);

        showNotification(
          "Đặt hàng thành công. Nhân viên ASIAPP sẽ liên hệ với bạn để xác nhận đơn hàng.",
          "success"
        );

        navigate(
          `/payment-success?product_id=${productId}&method=cod`
        );
      } catch (error) {
        console.error(
          "Create order/payment error:",
          error
        );

        const message =
          error?.response?.data
            ?.message ||
          error?.message ||
          "Không thể tạo đơn hàng. Vui lòng thử lại.";

        showNotification(
          message,
          "error"
        );

        setIsProcessingPayment(
          false
        );
      }
    };

  const handleSubmitReview =
    async () => {
      if (!currentUser) {
        handleRequireAuth(
          "Bạn cần đăng nhập để đánh giá sản phẩm."
        );

        return;
      }

      if (!isPurchased) {
        showNotification(
          "Bạn cần mua sản phẩm trước khi đánh giá.",
          "error"
        );

        return;
      }

      if (
        !reviewForm.comment.trim()
      ) {
        showNotification(
          "Vui lòng nhập nội dung đánh giá.",
          "error"
        );

        return;
      }

      try {
        await reviewService.addOrUpdateReview(
          productId,
          {
            rating: Number(
              reviewForm.rating
            ),
            comment:
              reviewForm.comment.trim(),
          }
        );

        showNotification(
          "Đã lưu đánh giá.",
          "success"
        );

        setEditingReviewId(null);

        await loadReviewData(
          productId
        );
      } catch (error) {
        console.error(
          "Submit review error:",
          error
        );

        const message =
          error?.response?.data
            ?.message ||
          error?.message ||
          "Không thể gửi đánh giá.";

        showNotification(
          message,
          "error"
        );
      }
    };

  const requestDeleteReview = (
    reviewId
  ) => {
    if (!reviewId) return;

    setDeleteReviewId(
      reviewId
    );

    setShowDeleteConfirm(
      true
    );
  };

  const handleDeleteReview =
    async () => {
      if (!deleteReviewId) {
        return;
      }

      try {
        await reviewService.deleteReview(
          deleteReviewId
        );

        setShowDeleteConfirm(
          false
        );

        setDeleteReviewId(null);

        showNotification(
          "Đã xóa đánh giá.",
          "success"
        );

        setReviewForm({
          rating: 5,
          comment: "",
        });

        setEditingReviewId(null);

        await loadReviewData(
          productId
        );
      } catch (error) {
        console.error(
          "Delete review error:",
          error
        );

        setShowDeleteConfirm(
          false
        );

        setDeleteReviewId(null);

        showNotification(
          "Không thể xóa đánh giá.",
          "error"
        );
      }
    };

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-gray-100 p-10 text-center">
        <div className="text-slate-500">
          Đang tải thông tin sản phẩm...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-[28px] border border-gray-100 p-10 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Không tìm thấy sản phẩm
        </h2>

        <p className="text-slate-500 mb-6">
          Sản phẩm có thể đã bị xóa hoặc ngừng
          hiển thị.
        </p>

        <button
          onClick={() =>
            navigate(
              "/products"
            )
          }
          className="px-5 py-3 rounded-xl bg-[#002B5B] text-white font-semibold"
        >
          Xem danh mục sản phẩm
        </button>
      </div>
    );
  }

  const image =
    product.image ||
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80";

  const categoryName =
    product.category_name ||
    product.category ||
    "Bao bì nhựa";

  const productName =
    product.name ||
    product.title ||
    "Sản phẩm bao bì";

  const productDescription =
    product.description ||
    "Sản phẩm bao bì nhựa được sản xuất phục vụ nhu cầu đóng gói và bảo quản hàng hóa.";

  const specifications = [
    ["Chất liệu", product.material],
    ["Độ dày", product.thickness],
    ["Chiều rộng", product.width],
    ["Chiều cao", product.height],
    ["Chiều dài", product.length],
    ["Màu sắc", product.color],
    ["In ấn", product.printing],
    ["Đơn vị", unit],
  ].filter(
    ([, value]) => value
  );

  return (
    <>
      {notification.show && (
        <div className="fixed top-6 right-6 z-[100] w-[min(420px,calc(100vw-32px))]">
          <div
            className={`rounded-2xl border shadow-xl bg-white px-5 py-4 flex items-start gap-3 ${
              notification.type ===
              "error"
                ? "border-red-200"
                : "border-emerald-200"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                notification.type ===
                "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {notification.type ===
              "error" ? (
                <FiX size={18} />
              ) : (
                <FiCheckCircle
                  size={18}
                />
              )}
            </div>

            <div className="flex-1">
              <div className="font-semibold text-slate-800">
                {notification.type ===
                "error"
                  ? "Có lỗi xảy ra"
                  : "Thông báo"}
              </div>

              <p className="text-sm text-slate-600 mt-1 leading-6">
                {
                  notification.message
                }
              </p>
            </div>

            <button
              type="button"
              onClick={
                closeNotification
              }
              className="text-slate-400 hover:text-slate-700"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <button
          onClick={() =>
            navigate(-1)
          }
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-slate-700 font-medium hover:bg-gray-50 transition"
        >
          <FiArrowLeft />
          Quay lại
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="bg-slate-100 min-h-105">
                  <img
                    src={image}
                    alt={productName}
                    className="w-full h-full min-h-105 object-cover"
                  />
                </div>

                <div className="p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase">
                      {categoryName}
                    </span>

                    {product.material && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        {
                          product.material
                        }
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-bold text-[#0F172A] leading-tight mb-5">
                    {productName}
                  </h1>

                  <p className="text-slate-600 leading-8 mb-7">
                    {
                      productDescription
                    }
                  </p>

                  <div className="flex items-center gap-2 mb-7">
                    <div className="flex items-center gap-1 text-orange-500">
                      {[
                        1,
                        2,
                        3,
                        4,
                        5,
                      ].map(
                        (star) => (
                          <FiStar
                            key={star}
                            size={18}
                            fill={
                              star <=
                              Math.round(
                                Number(
                                  reviewStats.average ||
                                    product.rating ||
                                    0
                                )
                              )
                                ? "currentColor"
                                : "none"
                            }
                          />
                        )
                      )}
                    </div>

                    <span className="font-semibold text-slate-700">
                      {reviewStats.total >
                      0
                        ? reviewStats.average.toFixed(
                            1
                          )
                        : Number(
                            product.rating ||
                              0
                          ).toFixed(
                            1
                          )}
                    </span>

                    <span className="text-slate-400">
                      (
                      {
                        reviewStats.total
                      }{" "}
                      đánh giá)
                    </span>
                  </div>

                  {product.usage && (
                    <div className="rounded-2xl bg-slate-50 border border-gray-100 p-5">
                      <div className="font-bold text-slate-800 mb-2">
                        Ứng dụng
                      </div>

                      <p className="text-slate-600 leading-7">
                        {
                          product.usage
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FiPackage
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Thông số sản phẩm
                  </h2>

                  <p className="text-sm text-slate-500">
                    Thông tin kỹ thuật của sản phẩm
                  </p>
                </div>
              </div>

              {specifications.length >
              0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 border border-gray-100 rounded-2xl overflow-hidden">
                  {specifications.map(
                    (
                      [
                        label,
                        value,
                      ],
                      index
                    ) => (
                      <div
                        key={label}
                        className={`flex items-center justify-between gap-5 px-5 py-4 ${
                          index %
                            2 ===
                          0
                            ? "bg-slate-50"
                            : "bg-white"
                        } border-b border-gray-100`}
                      >
                        <span className="text-slate-500">
                          {label}
                        </span>

                        <span className="font-semibold text-slate-800 text-right">
                          {value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
                  Sản phẩm chưa có thông số kỹ thuật
                  chi tiết.
                </div>
              )}
            </div>

            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FiCheckCircle
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Chính sách đặt hàng
                  </h2>

                  <p className="text-sm text-slate-500">
                    Thông tin dành cho khách hàng doanh nghiệp
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="font-bold text-slate-800 mb-2">
                    Số lượng tối thiểu
                  </div>

                  <div className="text-slate-600">
                    {minQuantity.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    {unit}
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    MOQ được áp dụng riêng theo từng
                    sản phẩm.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="font-bold text-slate-800 mb-2">
                    Báo giá
                  </div>

                  <div className="text-slate-600">
                    Theo quy cách và số lượng đặt hàng
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="font-bold text-slate-800 mb-2">
                    Đơn hàng số lượng lớn
                  </div>

                  <div className="text-slate-600">
                    Liên hệ bộ phận kinh doanh để có
                    chính sách giá phù hợp.
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="font-bold text-slate-800 mb-2">
                    Hỗ trợ
                  </div>

                  <div className="text-slate-600">
                    Tư vấn quy cách, sản lượng và giao
                    hàng.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <FiStar
                  className="text-orange-500"
                  size={22}
                />

                <h2 className="text-2xl font-bold text-slate-800">
                  Đánh giá sản phẩm
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
                <div className="rounded-3xl bg-slate-50 border border-gray-100 p-6">
                  <div className="text-5xl font-bold text-slate-800 mb-3">
                    {reviewStats.total >
                    0
                      ? reviewStats.average.toFixed(
                          1
                        )
                      : "0.0"}
                  </div>

                  <div className="flex items-center gap-1 text-orange-500 mb-3">
                    {[
                      1,
                      2,
                      3,
                      4,
                      5,
                    ].map(
                      (star) => (
                        <FiStar
                          key={star}
                          fill={
                            star <=
                            Math.round(
                              reviewStats.average
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />
                      )
                    )}
                  </div>

                  <p className="text-sm text-slate-500">
                    {
                      reviewStats.total
                    }{" "}
                    lượt đánh giá
                  </p>
                </div>

                <div className="rounded-3xl border border-gray-100 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">
                    {editingReviewId
                      ? "Cập nhật đánh giá của bạn"
                      : "Đánh giá của bạn"}
                  </h3>

                  <div className="flex gap-2 mb-4">
                    {[
                      1,
                      2,
                      3,
                      4,
                      5,
                    ].map(
                      (star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setReviewForm(
                              (
                                prev
                              ) => ({
                                ...prev,
                                rating:
                                  star,
                              })
                            )
                          }
                          className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${
                            reviewForm.rating >=
                            star
                              ? "bg-orange-50 border-orange-200 text-orange-500"
                              : "bg-white border-gray-200 text-gray-400"
                          }`}
                        >
                          <FiStar
                            fill="currentColor"
                          />
                        </button>
                      )
                    )}
                  </div>

                  <textarea
                    rows={4}
                    value={
                      reviewForm.comment
                    }
                    onChange={(
                      event
                    ) =>
                      setReviewForm(
                        (
                          prev
                        ) => ({
                          ...prev,
                          comment:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Nhập nhận xét về sản phẩm..."
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B]"
                  />

                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={
                        handleSubmitReview
                      }
                      className="px-5 py-3 rounded-2xl bg-[#002B5B] text-white font-semibold hover:opacity-90"
                    >
                      {editingReviewId
                        ? "Cập nhật đánh giá"
                        : "Gửi đánh giá"}
                    </button>

                    {editingReviewId && (
                      <button
                        onClick={() =>
                          requestDeleteReview(
                            editingReviewId
                          )
                        }
                        className="px-5 py-3 rounded-2xl border border-red-200 text-red-600 font-semibold hover:bg-red-50"
                      >
                        <span className="inline-flex items-center gap-2">
                          <FiTrash2 />
                          Xóa đánh giá
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {reviews.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-slate-500 text-center">
                    Chưa có đánh giá nào cho sản phẩm
                    này.
                  </div>
                ) : (
                  reviews.map(
                    (item) => (
                      <div
                        key={
                          item.id ||
                          item.review_id
                        }
                        className="rounded-2xl border border-gray-100 p-5"
                      >
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2 text-slate-800 font-semibold">
                            <FiUser />
                            {item.userName ||
                              item.user_name ||
                              "Khách hàng"}
                          </div>

                          <div className="flex items-center gap-1 text-orange-500">
                            {[
                              1,
                              2,
                              3,
                              4,
                              5,
                            ].map(
                              (star) => (
                                <FiStar
                                  key={
                                    star
                                  }
                                  size={
                                    16
                                  }
                                  fill={
                                    star <=
                                    Number(
                                      item.rating ||
                                        0
                                    )
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                              )
                            )}
                          </div>
                        </div>

                        <p className="text-slate-600 leading-7">
                          {item.comment ||
                            "Khách hàng chưa để lại nhận xét chi tiết."}
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>

          <div className="sticky top-24">
            <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
              <div className="rounded-[22px] overflow-hidden mb-6 bg-slate-100">
                <img
                  src={image}
                  alt={productName}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="mb-6">
                <div className="text-sm text-slate-500 mb-2">
                  Giá sản phẩm
                </div>

                <div className="text-3xl font-bold text-[#002B5B]">
                  {formatPrice(
                    product.price
                  )}
                </div>

                {!hasFixedPrice && (
                  <p className="text-sm text-slate-500 mt-2">
                    Giá được xác định theo quy cách
                    và số lượng. Vui lòng liên hệ bộ
                    phận kinh doanh để nhận báo giá.
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-slate-50 border border-gray-100 p-4 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500">
                    Số lượng tối thiểu
                  </span>

                  <span className="font-semibold text-slate-800">
                    {minQuantity.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    {unit}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    Đơn vị
                  </span>

                  <span className="font-semibold text-slate-800">
                    {unit}
                  </span>
                </div>
              </div>

              {hasFixedPrice && (
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Số lượng đặt hàng
                  </label>

                  <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      className="w-12 h-12 text-lg font-bold text-slate-600 hover:bg-slate-50"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min={
                        minQuantity
                      }
                      value={
                        quantity
                      }
                      onChange={
                        handleQuantityChange
                      }
                      className="flex-1 h-12 text-center font-semibold outline-none"
                    />

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      className="w-12 h-12 text-lg font-bold text-slate-600 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 mt-2">
                    Đơn tối thiểu:{" "}
                    {minQuantity.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    {unit}
                  </div>
                </div>
              )}

              {hasFixedPrice && (
                <div className="flex items-center justify-between mb-5">
                  <span className="text-slate-500">
                    Thành tiền
                  </span>

                  <span className="text-xl font-bold text-[#002B5B]">
                    {totalPrice.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VNĐ
                  </span>
                </div>
              )}

              <button
                onClick={
                  handleBuyNow
                }
                className="w-full rounded-2xl bg-[#002B5B] text-white py-4 font-semibold hover:opacity-90 transition"
              >
                {isPurchased
                  ? "Đã đặt mua"
                  : hasFixedPrice
                  ? "Mua ngay"
                  : "Liên hệ báo giá"}
              </button>

              <a
                href="tel:02873008899"
                className="w-full mt-3 rounded-2xl border border-gray-200 py-3.5 font-semibold text-slate-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <FiPhone />
                Gọi hotline tư vấn
              </a>

              <div className="border-t border-gray-100 mt-6 pt-6 space-y-4 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="text-green-600" />
                  <span>
                    Sản phẩm đang được cung cấp
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FiPackage />
                  <span>
                    MOQ theo từng sản phẩm
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FiTruck />
                  <span>
                    Hỗ trợ giao hàng theo đơn
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FiUser />
                  <span>
                    Tư vấn khách hàng doanh nghiệp
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-[30px] shadow-2xl overflow-hidden my-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Đặt mua sản phẩm
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Vui lòng kiểm tra thông tin đơn
                  hàng trước khi xác nhận.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowPaymentModal(
                    false
                  )
                }
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-50"
              >
                <FiX />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6">
                <h4 className="font-bold text-slate-800 mb-4">
                  Thông tin khách hàng
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Họ và tên
                    </label>

                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                      <input
                        type="text"
                        value={
                          paymentForm.fullName
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              fullName:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        className="w-full rounded-2xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Số điện thoại
                    </label>

                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                      <input
                        type="tel"
                        value={
                          paymentForm.phone
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              phone:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        className="w-full rounded-2xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Email
                    </label>

                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                      <input
                        type="email"
                        value={
                          paymentForm.email
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              email:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        className="w-full rounded-2xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Địa chỉ giao hàng
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <FiMapPin className="absolute left-4 top-4 text-slate-400" />

                      <textarea
                        rows={3}
                        value={
                          paymentForm.address
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentForm(
                            (
                              prev
                            ) => ({
                              ...prev,
                              address:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        placeholder="Nhập số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                        className="w-full rounded-2xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B] resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Ghi chú đơn hàng
                    </label>

                    <textarea
                      rows={3}
                      value={
                        paymentForm.note
                      }
                      onChange={(
                        event
                      ) =>
                        setPaymentForm(
                          (
                            prev
                          ) => ({
                            ...prev,
                            note:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      placeholder="Ví dụ: thời gian giao hàng, yêu cầu đóng gói..."
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50">
                <h4 className="font-bold text-slate-800 mb-4">
                  Tóm tắt đơn hàng
                </h4>

                <div className="rounded-3xl bg-white border border-gray-100 p-5">
                  <div className="flex gap-4">
                    <img
                      src={image}
                      alt={productName}
                      className="w-20 h-20 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 leading-6">
                        {
                          productName
                        }
                      </div>

                      <div className="text-sm text-slate-500 mt-1">
                        {quantity.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        {unit}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-5 pt-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Đơn giá
                      </span>

                      <span className="font-medium text-slate-700">
                        {formatPrice(
                          product.price
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        Số lượng
                      </span>

                      <span className="font-medium text-slate-700">
                        {quantity.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        {unit}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-slate-500 shrink-0">
                        Giao đến
                      </span>

                      <span className="font-medium text-slate-700 text-right break-words">
                        {paymentForm.address ||
                          "Chưa nhập địa chỉ"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="font-semibold text-slate-700">
                        Tổng tiền hàng
                      </span>

                      <span className="text-xl font-bold text-[#002B5B]">
                        {totalPrice.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="font-bold text-slate-800 mb-3">
                    Phương thức thanh toán
                  </h4>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethod(
                          "cod"
                        )
                      }
                      className={`w-full text-left rounded-2xl border p-4 transition ${
                        paymentMethod ===
                        "cod"
                          ? "border-[#002B5B] bg-white ring-2 ring-blue-100"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod ===
                            "cod"
                              ? "border-[#002B5B]"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod ===
                            "cod" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#002B5B]" />
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <FiTruck />
                            Thanh toán khi nhận hàng
                            (COD)
                          </div>

                          <p className="text-sm text-slate-500 mt-1">
                            Thanh toán khi đơn hàng
                            được giao đến địa chỉ của
                            bạn.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethod(
                          "vnpay"
                        )
                      }
                      className={`w-full text-left rounded-2xl border p-4 transition ${
                        paymentMethod ===
                        "vnpay"
                          ? "border-[#002B5B] bg-white ring-2 ring-blue-100"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod ===
                            "vnpay"
                              ? "border-[#002B5B]"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod ===
                            "vnpay" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#002B5B]" />
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <FiCreditCard />
                            Thanh toán trực tuyến
                            (VNPay)
                          </div>

                          <p className="text-sm text-slate-500 mt-1">
                            Chuyển đến cổng VNPay để
                            hoàn tất thanh toán trực
                            tuyến.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 mt-4">
                  <div className="flex items-start gap-3">
                    {paymentMethod ===
                    "cod" ? (
                      <FiTruck className="text-blue-700 mt-0.5" />
                    ) : (
                      <FiCreditCard className="text-blue-700 mt-0.5" />
                    )}

                    <div>
                      <div className="font-semibold text-blue-900">
                        {paymentMethod ===
                        "cod"
                          ? "Thanh toán khi nhận hàng"
                          : "Thanh toán trực tuyến VNPay"}
                      </div>

                      <div className="text-sm text-blue-700 mt-1">
                        {paymentMethod ===
                        "cod"
                          ? "Đơn hàng sẽ được tiếp nhận và nhân viên ASIAPP sẽ liên hệ xác nhận trước khi giao."
                          : "Bạn sẽ được chuyển đến cổng VNPay để hoàn tất giao dịch."}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={
                    handleConfirmPayment
                  }
                  disabled={
                    isProcessingPayment
                  }
                  className="w-full mt-5 rounded-2xl bg-[#002B5B] text-white py-4 font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {isProcessingPayment
                    ? paymentMethod ===
                      "vnpay"
                      ? "Đang chuyển đến VNPay..."
                      : "Đang tạo đơn hàng..."
                    : paymentMethod ===
                      "vnpay"
                    ? "Thanh toán qua VNPay"
                    : "Xác nhận đặt hàng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <FiTrash2
                size={22}
              />
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              Xóa đánh giá?
            </h3>

            <p className="text-slate-500 mt-2 leading-6">
              Bạn có chắc chắn muốn xóa đánh giá
              này? Hành động này không thể hoàn tác.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(
                    false
                  );
                  setDeleteReviewId(
                    null
                  );
                }}
                className="px-5 py-3 rounded-2xl border border-gray-200 text-slate-700 font-semibold hover:bg-gray-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteReview
                }
                className="px-5 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Xóa đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;