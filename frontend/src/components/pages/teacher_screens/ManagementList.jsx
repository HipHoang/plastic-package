import React, { useEffect, useState } from "react";
import apiClient from "../../../untils/auth";

const ManagementList = ({ resource }) => {
  const isCustomers = resource === "customers";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiClient.get(
          isCustomers
            ? "/users/admin/customers"
            : "/products/admin/product-categories"
        );
        const data = response.data?.data || response.data || [];
        setItems(Array.isArray(data) ? data : []);
      } catch (loadError) {
        setError(
          loadError.response?.data?.message ||
            "Không thể tải dữ liệu quản trị."
        );
      }
    };

    load();
  }, [isCustomers]);

  return (
    <section className="p-8">
      <h1 className="text-2xl font-bold text-slate-800">
        {isCustomers
          ? "Quản lý khách hàng"
          : "Quản lý danh mục sản phẩm"}
      </h1>
      {error && (
        <p className="mt-4 text-red-600">{error}</p>
      )}
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">
                {isCustomers ? "Tên / Email" : "Tên danh mục"}
              </th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={
                  item.user_id ||
                  item.category_id ||
                  item.id
                }
                className="border-t"
              >
                <td className="px-4 py-3">
                  {item.user_id ||
                    item.category_id ||
                    item.id}
                </td>
                <td className="px-4 py-3">
                  {isCustomers
                    ? item.name || item.email
                    : item.name}
                </td>
                <td className="px-4 py-3">
                  {item.is_active === false
                    ? "Không hoạt động"
                    : "Hoạt động"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && !error && (
          <p className="p-6 text-slate-500">
            Chưa có dữ liệu.
          </p>
        )}
      </div>
    </section>
  );
};

export default ManagementList;
