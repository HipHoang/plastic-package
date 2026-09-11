import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCreditCard,
  FiCalendar,
  FiHash,
  FiRefreshCw,
  FiCheckCircle,
  FiTruck,
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

const statusOptions = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "pending_confirmation", label: "Chờ xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "success", label: "Thành công" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "failed", label: "Thất bại" },
];

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
    order?.course?.name ||
    order?.course?.title ||
    order?.product_name ||
    order?.course_title ||
    "Sản phẩm"
  );
}

function getProductImage(order) {
  return (
    order?.product?.image ||
    order?.product?.image_url ||
    order?.course?.image ||
    order?.course?.image_url ||
    null
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

function getCustomerEmail(order) {
  return (
    order?.customer_email ||
    order?.customer?.email ||
    order?.user?.email ||
    "-"
  );
}

function getCustomerAddress(order) {
  return (
    order?.customer_address ||
    order?.customer?.address ||
    order?.user?.address ||
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

function getOrderNote(order) {
  return (
    order?.order_desc ||
    order?.note ||
    order?.description ||
    "Không có ghi chú"
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 rounded-lg bg-gray-100 p-2 text-gray-500">
        {React.createElement(Icon, { size: 16 })}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        <div className="mt-0.5 break-words text-sm text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailAdmin() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadOrder = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccessMessage("");

      const response =
        await adminService.getAdminOrderDetail(id);

      const data =
        response?.order ||
        response?.data ||
        response?.result ||
        response;

      setOrder(data || null);
      setStatus(String(data?.status || "pending").toLowerCase());
    } catch (err) {
      console.error("getAdminOrderDetail ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải thông tin đơn hàng"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order || !status) return;

    const currentStatus = String(
      order?.status || ""
    ).toLowerCase();

    if (status === currentStatus) {
      setSuccessMessage("Trạng thái đơn hàng hiện tại đã được cập nhật.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response =
        await adminService.updateOrderStatus(
          getOrderId(order),
          status
        );

      const updatedOrder =
        response?.order ||
        response?.data ||
        response?.result ||
        null;

      if (updatedOrder) {
        setOrder(updatedOrder);
      } else {
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                status,
              }
            : prev
        );
      }

      setSuccessMessage("Đã cập nhật trạng thái đơn hàng.");
    } catch (err) {
      console.error("updateOrderStatus ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể cập nhật trạng thái đơn hàng"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto flex min-h-[400px] max-w-7xl items-center justify-center rounded-xl bg-white shadow-sm">
          <div className="text-sm text-gray-500">
            Đang tải thông tin đơn hàng...
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <FiArrowLeft size={17} />
            Quay lại danh sách đơn hàng
          </button>

          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 w-fit rounded-full bg-red-100 p-4 text-red-500">
              <FiPackage size={28} />
            </div>

            <h2 className="font-semibold text-gray-800">
              Không tìm thấy đơn hàng
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Đơn hàng có thể không tồn tại hoặc bạn không có quyền truy cập.
            </p>

            {error && (
              <p className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const orderId = getOrderId(order);
  const currentStatus = String(
    order?.status || "pending"
  ).toLowerCase();

  const productName = getProductName(order);
  const productImage = getProductImage(order);
  const quantity = order?.quantity || 1;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            <FiArrowLeft size={18} />
            Quay lại đơn hàng
          </button>

          <button
            type="button"
            onClick={() => loadOrder(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Làm mới
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <FiCheckCircle size={17} />
            {successMessage}
          </div>
        )}

        <div className="mb-5 rounded-xl bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Chi tiết đơn hàng
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">
                  #{orderId}
                </h1>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    statusClasses[currentStatus] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {statusLabels[currentStatus] || currentStatus}
                </span>
              </div>

              <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <FiCalendar size={15} />
                Đặt lúc {formatDate(order?.created_at)}
              </p>
            </div>

            <div className="w-full md:w-72">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Cập nhật trạng thái
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {statusOptions.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <FiRefreshCw
                        size={15}
                        className="animate-spin"
                      />
                      Lưu
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={15} />
                      Cập nhật
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-xl bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600">
                  <FiPackage size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-800">
                    Sản phẩm
                  </h2>

                  <p className="text-xs text-gray-400">
                    Thông tin sản phẩm trong đơn hàng
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiPackage
                      size={32}
                      className="text-gray-300"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {productName}
                  </h3>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-400">
                        Số lượng
                      </p>

                      <p className="mt-1 font-semibold text-gray-700">
                        {quantity}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-400">
                        Đơn giá
                      </p>

                      <p className="mt-1 font-semibold text-gray-700">
                        {formatMoney(
                          quantity > 0
                            ? Number(order?.amount || 0) /
                                quantity
                            : order?.amount
                        )}
                      </p>
                    </div>

                    <div className="col-span-2 rounded-lg bg-blue-50 p-3 sm:col-span-1">
                      <p className="text-xs text-blue-500">
                        Thành tiền
                      </p>

                      <p className="mt-1 font-bold text-blue-600">
                        {formatMoney(order?.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2.5 text-green-600">
                  <FiUser size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-800">
                    Thông tin khách hàng
                  </h2>

                  <p className="text-xs text-gray-400">
                    Thông tin nhận hàng
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoRow icon={FiUser} label="Họ và tên">
                  <span className="font-medium text-gray-800">
                    {getCustomerName(order)}
                  </span>
                </InfoRow>

                <InfoRow icon={FiPhone} label="Số điện thoại">
                  {getCustomerPhone(order)}
                </InfoRow>

                <InfoRow icon={FiMail} label="Email">
                  {getCustomerEmail(order)}
                </InfoRow>

                <InfoRow icon={FiMapPin} label="Địa chỉ">
                  {getCustomerAddress(order)}
                </InfoRow>
              </div>
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2.5 text-orange-600">
                  <FiTruck size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-800">
                    Ghi chú đơn hàng
                  </h2>

                  <p className="text-xs text-gray-400">
                    Yêu cầu hoặc ghi chú từ khách hàng
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                  {getOrderNote(order)}
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-xl bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2.5 text-purple-600">
                  <FiCreditCard size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-800">
                    Thanh toán
                  </h2>

                  <p className="text-xs text-gray-400">
                    Thông tin thanh toán
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <InfoRow icon={FiCreditCard} label="Phương thức">
                  <span className="font-medium text-gray-800">
                    {getPaymentMethod(order)}
                  </span>
                </InfoRow>

                <InfoRow icon={FiHash} label="Mã giao dịch">
                  {order?.vnp_transaction_no || "-"}
                </InfoRow>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">
                    Tổng thanh toán
                  </p>

                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {formatMoney(order?.amount)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm md:p-6">
              <h2 className="mb-4 font-semibold text-gray-800">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">
                    Mã đơn
                  </span>

                  <span className="font-medium text-gray-800">
                    #{orderId}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">
                    Số lượng
                  </span>

                  <span className="font-medium text-gray-800">
                    {quantity}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">
                    Trạng thái
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusClasses[currentStatus] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusLabels[currentStatus] ||
                      currentStatus}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-gray-700">
                      Tổng cộng
                    </span>

                    <span className="text-lg font-bold text-blue-600">
                      {formatMoney(order?.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-blue-600 p-5 text-white shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white/15 p-2.5">
                  <FiPhone size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Cần hỗ trợ đơn hàng?
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-blue-100">
                    Liên hệ bộ phận kinh doanh để được hỗ trợ xử lý đơn hàng.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}