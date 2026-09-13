import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiShoppingBag,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiPhone,
  FiPackage,
  FiCreditCard,
  FiCalendar,
} from "react-icons/fi";
import adminService from "../../../services/adminService";

const statusLabels = {
  pending: "Chờ xử lý",
  pending_confirmation: "Chờ xác nhận",
  processing: "Đang xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  success: "Thành công",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  canceled: "Đã hủy",
  failed: "Thất bại",
};

const statusClasses = {
  pending: "bg-yellow-100 text-yellow-700",
  pending_confirmation: "bg-orange-100 text-orange-700",
  processing: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  shipping: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  success: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  canceled: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("vi-VN");
}

function getOrderId(order) {
  return order?.id ?? order?.order_id ?? "-";
}

function getProductName(order) {
  return (
    order?.product?.name ||
    order?.product?.title ||
    order?.product_name ||
    "Sản phẩm"
  );
}

function getCustomerName(order) {
  return (
    order?.customer_name ||
    order?.customer?.name ||
    order?.user?.name ||
    "Khách hàng"
  );
}

function getCustomerPhone(order) {
  return (
    order?.customer_phone ||
    order?.customer?.phone ||
    order?.user?.phone ||
    "-"
  );
}

function getPaymentMethod(order) {
  const method = order?.payment_method;

  if (!method) return "Chưa xác định";

  if (method.toLowerCase() === "vnpay") {
    return "VNPay";
  }

  if (method.toLowerCase() === "cod") {
    return "COD";
  }

  return method;
}

export default function OrderManagement() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const loadOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await adminService.getAdminOrders();

      const data = Array.isArray(response)
        ? response
        : response?.orders ||
          response?.data ||
          response?.result ||
          [];

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("getAdminOrders ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách đơn hàng"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      String(getOrderId(order)).toLowerCase().includes(keyword) ||
      getCustomerName(order).toLowerCase().includes(keyword) ||
      getCustomerPhone(order).toLowerCase().includes(keyword) ||
      getProductName(order).toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      String(order?.status || "").toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter((item) =>
    ["pending", "pending_confirmation"].includes(
      String(item?.status || "").toLowerCase()
    )
  ).length;

  const completedCount = orders.filter((item) =>
    ["success", "completed", "delivered"].includes(
      String(item?.status || "").toLowerCase()
    )
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Quản lý đơn hàng
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Theo dõi và xử lý đơn hàng của khách hàng
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <FiRefreshCw
              className={refreshing ? "animate-spin" : ""}
              size={17}
            />
            Làm mới
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <FiShoppingBag size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-800">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
                <FiShoppingBag size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-800">
                  {pendingCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                <FiShoppingBag size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-800">
                  {completedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <FiSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã đơn, khách hàng, số điện thoại, sản phẩm..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 md:w-56"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="pending_confirmation">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="success">Thành công</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-75 items-center justify-center rounded-xl bg-white shadow-sm">
            <div className="text-sm text-gray-500">
              Đang tải danh sách đơn hàng...
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex min-h-75 flex-col items-center justify-center rounded-xl bg-white px-6 text-center shadow-sm">
            <div className="mb-3 rounded-full bg-gray-100 p-4 text-gray-400">
              <FiShoppingBag size={28} />
            </div>

            <h3 className="font-semibold text-gray-700">
              Không có đơn hàng
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {search || statusFilter !== "all"
                ? "Không tìm thấy đơn hàng phù hợp với bộ lọc."
                : "Hiện chưa có đơn hàng nào."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredOrders.map((order) => {
                const status = String(
                  order?.status || "pending"
                ).toLowerCase();

                return (
                  <div
                    key={getOrderId(order)}
                    className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Mã đơn hàng
                        </p>

                        <p className="mt-1 text-lg font-bold text-gray-800">
                          #{getOrderId(order)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex max-w-32.5 rounded-full px-3 py-1 text-center text-xs font-medium ${
                          statusClasses[status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabels[status] || status}
                      </span>
                    </div>

                    <div className="space-y-3 border-t border-gray-100 pt-4">
                      <div className="flex items-start gap-3">
                        <FiUser
                          size={17}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />

                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">
                            Khách hàng
                          </p>

                          <p className="truncate text-sm font-medium text-gray-800">
                            {getCustomerName(order)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FiPhone
                          size={17}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />

                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">
                            Số điện thoại
                          </p>

                          <p className="text-sm text-gray-700">
                            {getCustomerPhone(order)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FiPackage
                          size={17}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-400">
                            Sản phẩm
                          </p>

                          <p
                            className="line-clamp-2 text-sm font-medium text-gray-800"
                            title={getProductName(order)}
                          >
                            {getProductName(order)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-xs text-gray-400">
                            Số lượng
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {order?.quantity || 1}
                          </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-xs text-gray-400">
                            Thanh toán
                          </p>

                          <div className="mt-1 flex items-center gap-1.5">
                            <FiCreditCard
                              size={14}
                              className="text-gray-500"
                            />

                            <p className="truncate text-sm font-semibold text-gray-700">
                              {getPaymentMethod(order)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FiCalendar
                          size={17}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />

                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">
                            Ngày đặt
                          </p>

                          <p className="text-sm text-gray-600">
                            {formatDate(order?.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">
                          Tổng tiền
                        </p>

                        <p className="mt-0.5 truncate text-lg font-bold text-blue-600">
                          {formatMoney(order?.amount)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/orders/${getOrderId(order)}`
                          )
                        }
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
                      >
                        <FiEye size={16} />
                        Xem
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
            </div>
          </>
        )}
      </div>
    </div>
  );
}