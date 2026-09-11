import React from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiPackage,
  FiGrid,
  FiShoppingBag,
  FiUsers,
  FiFileText,
  FiMessageCircle,
  FiUser,
  FiSettings,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

const AdminSidebar = ({ isExpanded, setIsExpanded }) => {
  const menuItems = [
    {
      name: "Tổng quan",
      icon: <FiHome />,
      path: "/admin/dashboard",
      fallbackPath: "/admin/dashboard",
    },
    {
      name: "Sản phẩm",
      icon: <FiPackage />,
      path: "/admin/products",
      fallbackPath: "/admin/products",
    },
    {
      name: "Danh mục",
      icon: <FiGrid />,
      path: "/admin/categories",
      fallbackPath: "/admin/categories",
    },
    {
      name: "Đơn hàng",
      icon: <FiShoppingBag />,
      path: "/admin/orders",
      fallbackPath: "/admin/orders",
    },
    {
      name: "Khách hàng",
      icon: <FiUsers />,
      path: "/admin/customers",
      fallbackPath: "/admin/customers",
    },
    {
      name: "Tin tức",
      icon: <FiFileText />,
      path: "/admin/news",
      fallbackPath: "/admin/news",
    },
    {
      name: "Đánh giá",
      icon: <FiMessageCircle />,
      path: "/admin/reviews",
      fallbackPath: "/admin/reviews",
    },
    {
      name: "Hồ sơ",
      icon: <FiUser />,
      path: "/admin/profile",
      fallbackPath: "/admin/profile",
    },
    {
      name: "Cài đặt",
      icon: <FiSettings />,
      path: "/admin/settings",
      fallbackPath: "/admin/settings",
    },
  ];

  return (
    <div className="h-full min-h-screen flex flex-col p-4 text-white bg-[#021e4b]">
      <div className="mb-8 flex justify-end">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={isExpanded ? "Thu gọn menu" : "Mở rộng menu"}
        >
          {isExpanded ? (
            <FiChevronLeft size={20} />
          ) : (
            <FiChevronRight size={20} />
          )}
        </button>
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={`${item.name}-${item.path}`}
            to={item.path}
            end={item.path === "/admin/dashboard"}
            className={({ isActive }) => `
              flex items-center gap-4 p-3 rounded-xl cursor-pointer
              transition-all
              ${
                isActive
                  ? "bg-[#0047AB] text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-white/5 text-gray-300 hover:text-white"
              }
            `}
          >
            <div className="text-xl flex-none">
              {item.icon}
            </div>

            {isExpanded && (
              <span className="whitespace-nowrap text-sm font-medium overflow-hidden">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;