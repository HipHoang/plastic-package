import React, { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiGrid,
  FiPlus,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import CreateProductForm from "../form/CreateProductForm";
import { adminService } from "../../../services/adminService";

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("vi-VN");
};

const formatPrice = (price) => `${formatNumber(price)} đ`;

const unwrapList = (response, keys = []) => {
  if (Array.isArray(response)) return response;
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }
  return Array.isArray(response?.data) ? response.data : [];
};

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse, ordersResponse, customersResponse] = await Promise.all([
          adminService.getAdminProducts(),
          adminService.getAdminCategories(),
          adminService.getAdminOrders(),
          adminService.getAdminCustomers(),
        ]);

        const products = unwrapList(productsResponse, ["products"]);
        const categories = unwrapList(categoriesResponse, ["categories"]);
        const orders = unwrapList(ordersResponse, ["orders", "result"]);
        const customers = unwrapList(customersResponse, ["customers"]);
        const pendingOrders = orders.filter((order) => ["pending", "pending_confirmation"].includes(String(order.status).toLowerCase())).length;
        const revenue = orders
          .filter((order) => ["paid", "success", "completed", "delivered"].includes(String(order.status).toLowerCase()))
          .reduce((total, order) => total + Number(order.amount || 0), 0);

        setRecentOrders(orders.slice(0, 8));
        setStats([
          { title: "Tổng sản phẩm", value: formatNumber(products.length), icon: <FiShoppingBag size={22} /> },
          { title: "Sản phẩm đang bán", value: formatNumber(products.filter((product) => product.is_active !== false).length), icon: <FiShoppingBag size={22} /> },
          { title: "Tổng danh mục", value: formatNumber(categories.length), icon: <FiGrid size={22} /> },
          { title: "Tổng đơn hàng", value: formatNumber(orders.length), icon: <FiShoppingBag size={22} /> },
          { title: "Khách hàng", value: formatNumber(customers.length), icon: <FiUsers size={22} /> },
          { title: "Đơn hàng chờ xác nhận", value: formatNumber(pendingOrders), icon: <FiShoppingBag size={22} /> },
          { title: "Doanh thu ghi nhận", value: formatPrice(revenue), icon: <FiDollarSign size={22} /> },
        ]);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B5CFF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Tổng quan quản trị</h1>
          <p className="text-slate-500 mt-2">
            Theo dõi sản phẩm, đơn hàng và khách hàng của ASIAPP.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0B5CFF] hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold shadow-md transition"
          >
            <FiPlus />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {isModalOpen && (
        <CreateProductForm onClose={() => setIsModalOpen(false)} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0B5CFF] flex items-center justify-center">
                {item.icon}
              </div>

              <div>
                <p className="text-3xl font-bold text-slate-800">{item.value}</p>
                <p className="text-slate-500 mt-1">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.9fr] gap-6">
        <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Đơn hàng mới nhất
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-left text-sm">
              <thead className="border-b border-gray-100 text-slate-500">
                <tr><th className="px-3 py-3">Mã đơn</th><th className="px-3 py-3">Khách hàng</th><th className="px-3 py-3">Tổng tiền</th><th className="px-3 py-3">Trạng thái</th></tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-4 font-semibold text-[#0047AB]">#{order.id}</td>
                    <td className="px-3 py-4 text-slate-700">{order.customer?.name || order.customer_name || "Khách hàng"}</td>
                    <td className="px-3 py-4 font-semibold text-slate-800">{formatPrice(order.amount)}</td>
                    <td className="px-3 py-4 text-slate-600">{order.status === "pending_confirmation" ? "Chờ xác nhận" : order.status || "Chưa xác định"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Đơn hàng chờ xác nhận
            </h2>
            <span className="text-2xl font-bold text-[#0B5CFF]">{stats.find((item) => item.title === "Đơn hàng chờ xác nhận")?.value || "0"}</span>
          </div>

          <div className="text-center py-8 text-slate-500">
            <p>Kiểm tra và xác nhận đơn hàng mới của khách hàng.</p>
          </div>

          <button className="mt-8 w-full bg-[#0B5CFF] hover:bg-blue-700 text-white py-3.5 rounded-2xl font-semibold transition inline-flex items-center justify-center gap-2">
            <FiShoppingBag />
            Xử lý đơn hàng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Đơn hàng gần đây</h2>
          <button onClick={() => window.location.assign("/admin/orders")} className="text-[#0B5CFF] font-medium hover:underline">
            Xem tất cả
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p>Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-left">
                  <th className="px-5 py-4 rounded-l-2xl font-semibold">Mã đơn</th>
                  <th className="px-5 py-4 font-semibold">Khách hàng</th>
                  <th className="px-5 py-4 font-semibold">Sản phẩm</th>
                  <th className="px-5 py-4 font-semibold">Số lượng</th>
                  <th className="px-5 py-4 font-semibold">Tổng tiền</th>
                  <th className="px-5 py-4 rounded-r-2xl font-semibold">Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="px-5 py-5 font-semibold text-slate-800">
                      #{order.id}
                    </td>
                    <td className="px-5 py-5 text-slate-700">{order.customer?.name || order.customer_name || "Khách hàng"}</td>
                    <td className="px-5 py-5 text-slate-700">{order.product?.title || order.product?.name || "Sản phẩm"}</td>
                    <td className="px-5 py-5 text-slate-700">{formatNumber(order.quantity)}</td>
                    <td className="px-5 py-5 text-slate-700">{formatPrice(order.amount)}</td>
                    <td className="px-5 py-5 text-slate-700">{order.status === "pending_confirmation" ? "Chờ xác nhận" : order.status || "Chưa xác định"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
