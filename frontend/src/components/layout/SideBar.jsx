import React from "react";
import {
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiMapPin,
  FiMessageCircle,
  FiSettings,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const menuItems = [
    { name: "Trang chủ", icon: <FiHome />, path: "/" },
    { name: "Khóa học của tôi", icon: <FiBookOpen />, path: "/courses" },
    { name: "Lộ trình học", icon: <FiMapPin />, path: "/pathway" },
    {
      name: "Đề xuất cho bạn",
      icon: <HiSparkles />,
      path: "/ai",
      hasBadge: true,
      badgeText: "AI",
    },
    { name: "Hỏi đáp (Q&A)", icon: <FiMessageCircle />, path: "/qa" },
    { name: "Cài đặt", icon: <FiSettings />, path: "/settings" },
  ];

  return (
    <div className="h-full flex flex-col p-4 text-white bg-[#021e4b]">
      <div className="mb-8 flex justify-end">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <FiChevronLeft size={20} />
          ) : (
            <FiChevronRight size={20} />
          )}
        </button>
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all
              ${
                isActive
                  ? "bg-[#0047AB] text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-white/5 text-gray-300 hover:text-white"
              }
            `}
          >
            <div className="text-xl flex-none">{item.icon}</div>

            {isExpanded && (
              <div className="flex items-center flex-1 justify-between overflow-hidden">
                <span className="whitespace-nowrap text-sm font-medium">
                  {item.name}
                </span>

                {item.hasBadge && (
                  <span className="bg-blue-500 text-[10px] px-1.5 py-0.5 rounded text-white uppercase font-bold ml-2">
                    {item.badgeText}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;