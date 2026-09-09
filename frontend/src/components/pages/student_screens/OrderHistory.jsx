import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiPackage,
  FiCalendar,
  FiCreditCard,
  FiMapPin,
  FiChevronRight,
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

  return new Date(value).toLocaleDateString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
};

const getStatusInfo = (status) => {
  const normalized = String(
    status || ""
  ).toLowerCase();

  if (
    normalized === "paid" ||
    normalized === "success" ||
    normalized === "completed"
  ) {
    return {
      label: "Đã thanh toán",
      className:
        "bg-green-100 text-green-700",
    };
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return {
      label: "Đã hủy",
      className:
        "bg-red-100 text-red-700",
    };
  }

  if (
    normalized === "failed"
  ) {
    return {
      label: "Thanh toán thất bại",
      className:
        "bg-red-100 text-red-700",
    };
  }

  if (
    normalized === "processing"
  ) {
    return {
      label: "Đang xử lý",
      className:
        "bg-blue-100 text-blue-700",
    };
  }

  return {
    label: "Chờ xử lý",
    className:
      "bg-yellow-100 text-yellow-700",
  };
};

const getPaymentMethodLabel = (
  method
) => {
  if (!method) return "—";

  const normalized = String(
    method
  ).toLowerCase();

  if (normalized === "vnpay") {
    return "VNPay";
  }

  if (normalized === "cod") {
    return "Thanh toán khi nhận hàng";
  }

  return method;
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await userService.getMyOrders();

      const data =
        response?.data ?? response ?? [];

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "getMyOrders ERROR:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Không thể tải lịch sử đơn hàng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Lịch sử đơn hàng
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Theo dõi các đơn hàng sản phẩm
              của bạn tại ASIAPP.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Làm mới
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <FiRefreshCw className="mx-auto mb-4 animate-spin text-2xl text-slate-400" />

            <p className="text-sm text-slate-500">
              Đang tải lịch sử đơn hàng...
            </p>
          </div>
        ) : orders.length === 0 ? (
          /* EMPTY */
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FiPackage className="text-2xl text-slate-400" />
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              Chưa có đơn hàng
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Bạn chưa có đơn hàng nào.
              Hãy xem danh mục sản phẩm của
              ASIAPP để bắt đầu đặt hàng.
            </p>

            <Link
              to="/all-courses"
              className="mt-6 inline-flex items-center rounded-xl bg-[#002B5B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001f42]"
            >
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          /* ORDER LIST */
          <div className="space-y-5">
            {orders.map((order) => {
              const product =
                order.product;

              const status =
                getStatusInfo(
                  order.status
                );

              const quantity =
                Number(
                  order.quantity || 1
                );

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* ORDER TOP */}
                  <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FiPackage />

                        <span>
                          Đơn hàng #
                          {order.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <FiCalendar />

                        <span>
                          {formatDate(
                            order.created_at
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <FiCreditCard />

                        <span>
                          {getPaymentMethodLabel(
                            order.payment_method
                          )}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* PRODUCT */}
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {product?.image ? (
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name ||
                              "Sản phẩm"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FiPackage className="text-2xl text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-2 text-base font-bold text-slate-900 md:text-lg">
                          {product?.name ||
                            "Sản phẩm không còn tồn tại"}
                        </h2>

                        {product?.material && (
                          <p className="mt-1 text-sm text-slate-500">
                            Chất liệu:{" "}
                            {product.material}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-slate-600">
                          Số lượng:{" "}
                          <span className="font-semibold">
                            {quantity.toLocaleString(
                              "vi-VN"
                            )}
                          </span>{" "}
                          {product?.unit ||
                            "cái"}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-500">
                          Tổng tiền
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#002B5B]">
                          {formatPrice(
                            order.amount
                          )}{" "}
                          VNĐ
                        </p>
                      </div>
                    </div>

                    {/* DELIVERY */}
                    {order.customer_address && (
                      <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <FiMapPin className="mt-0.5 shrink-0 text-slate-400" />

                        <div>
                          <span className="font-semibold text-slate-700">
                            Địa chỉ giao hàng:
                          </span>{" "}
                          {order.customer_address}
                        </div>
                      </div>
                    )}

                    {/* DETAIL */}
                    <div className="mt-5 flex justify-end">
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Xem chi tiết
                        <FiChevronRight />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
