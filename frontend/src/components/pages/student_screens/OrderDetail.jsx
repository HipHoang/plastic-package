import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiCalendar,
  FiCreditCard,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiFileText,
  FiRefreshCw,
} from "react-icons/fi";

import userService from "../../../services/userService";

const formatPrice = (value) => {
  return new Intl.NumberFormat("vi-VN").format(
    Number(value || 0)
  );
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusInfo = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized === "paid" ||
    normalized === "success" ||
    normalized === "completed"
  ) {
    return {
      label: "Đã thanh toán",
      className: "bg-green-100 text-green-700",
    };
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return {
      label: "Đã hủy",
      className: "bg-red-100 text-red-700",
    };
  }

  if (normalized === "failed") {
    return {
      label: "Thanh toán thất bại",
      className: "bg-red-100 text-red-700",
    };
  }

  if (normalized === "processing") {
    return {
      label: "Đang xử lý",
      className: "bg-blue-100 text-blue-700",
    };
  }

  return {
    label: "Chờ xử lý",
    className: "bg-yellow-100 text-yellow-700",
  };
};

const getPaymentMethodLabel = (method) => {
  if (!method) return "—";

  const normalized = String(method).toLowerCase();

  if (normalized === "vnpay") {
    return "VNPay";
  }

  if (normalized === "cod") {
    return "Thanh toán khi nhận hàng";
  }

  return method;
};

const OrderDetail = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await userService.getMyOrderDetail(orderId);

      const data =
        response?.data ?? response ?? null;

      setOrder(data);
    } catch (err) {
      console.error(
        "getMyOrderDetail ERROR:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Không thể tải thông tin đơn hàng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <FiRefreshCw className="mx-auto mb-4 animate-spin text-2xl text-slate-400" />

            <p className="text-sm text-slate-500">
              Đang tải thông tin đơn hàng...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <FiPackage className="mx-auto mb-4 text-3xl text-red-400" />

            <h1 className="text-lg font-bold text-red-800">
              Không tìm thấy đơn hàng
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error || "Đơn hàng không tồn tại hoặc bạn không có quyền xem đơn hàng này."}
            </p>

            <Link
              to="/orders"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#002B5B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001f42]"
            >
              <FiArrowLeft />
              Quay lại đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const product = order.product;

  const status = getStatusInfo(order.status);

  const quantity = Number(order.quantity || 1);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* BACK */}
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#002B5B]"
        >
          <FiArrowLeft />
          Quay lại danh sách đơn hàng
        </Link>

        {/* HEADER */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <FiPackage className="text-2xl text-[#002B5B]" />

                <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                  Đơn hàng #{order.id}
                </h1>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <FiCalendar />
                  {formatDate(order.created_at)}
                </div>

                <div className="flex items-center gap-2">
                  <FiCreditCard />
                  {getPaymentMethodLabel(
                    order.payment_method
                  )}
                </div>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
            {/* PRODUCT */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                <h2 className="font-bold text-slate-900">
                  Sản phẩm
                </h2>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {product?.image ? (
                      <img
                        src={product.image}
                        alt={
                          product.name ||
                          "Sản phẩm"
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FiPackage className="text-3xl text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {product?.name ||
                        "Sản phẩm không còn tồn tại"}
                    </h3>

                    {product?.material && (
                      <p className="mt-2 text-sm text-slate-500">
                        Chất liệu:{" "}
                        <span className="font-medium text-slate-700">
                          {product.material}
                        </span>
                      </p>
                    )}

                    {product?.color && (
                      <p className="mt-1 text-sm text-slate-500">
                        Màu sắc:{" "}
                        <span className="font-medium text-slate-700">
                          {product.color}
                        </span>
                      </p>
                    )}

                    {product?.thickness && (
                      <p className="mt-1 text-sm text-slate-500">
                        Độ dày:{" "}
                        <span className="font-medium text-slate-700">
                          {product.thickness}
                        </span>
                      </p>
                    )}

                    <p className="mt-3 text-sm text-slate-600">
                      Số lượng:{" "}
                      <span className="font-bold text-slate-900">
                        {quantity.toLocaleString("vi-VN")}
                      </span>{" "}
                      {product?.unit || "cái"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-sm text-slate-500">
                    Tổng tiền sản phẩm
                  </span>

                  <span className="text-xl font-bold text-[#002B5B]">
                    {formatPrice(order.amount)} VNĐ
                  </span>
                </div>
              </div>
            </div>

            {/* CUSTOMER */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                <h2 className="font-bold text-slate-900">
                  Thông tin người nhận
                </h2>
              </div>

              <div className="space-y-4 p-5 md:p-6">
                <div className="flex items-start gap-3">
                  <FiUser className="mt-0.5 shrink-0 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-500">
                      Họ và tên
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {order.customer_name || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiPhone className="mt-0.5 shrink-0 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-500">
                      Số điện thoại
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {order.customer_phone || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiMail className="mt-0.5 shrink-0 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-500">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                      {order.customer_email || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiMapPin className="mt-0.5 shrink-0 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-500">
                      Địa chỉ giao hàng
                    </p>

                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                      {order.customer_address || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* NOTE */}
            {order.order_desc && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                  <h2 className="font-bold text-slate-900">
                    Ghi chú đơn hàng
                  </h2>
                </div>

                <div className="flex items-start gap-3 p-5 md:p-6">
                  <FiFileText className="mt-0.5 shrink-0 text-slate-400" />

                  <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                    {order.order_desc}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* SUMMARY */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-slate-900">
                  Tóm tắt đơn hàng
                </h2>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">
                    Số lượng
                  </span>

                  <span className="font-semibold text-slate-800">
                    {quantity.toLocaleString("vi-VN")}{" "}
                    {product?.unit || "cái"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">
                    Thanh toán
                  </span>

                  <span className="text-right font-semibold text-slate-800">
                    {getPaymentMethodLabel(
                      order.payment_method
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-600">
                      Tổng cộng
                    </span>

                    <span className="text-xl font-bold text-[#002B5B]">
                      {formatPrice(order.amount)} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SUPPORT */}
            <div className="rounded-2xl bg-[#002B5B] p-5 text-white shadow-sm">
              <h2 className="font-bold">
                Cần hỗ trợ?
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Nếu cần hỗ trợ về đơn hàng, vui lòng liên hệ hotline của ASIAPP.
              </p>

              <a
                href="tel:19000000"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#002B5B] transition hover:bg-slate-100"
              >
                <FiPhone />
                Liên hệ hỗ trợ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

