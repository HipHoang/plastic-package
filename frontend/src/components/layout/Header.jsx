import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../auth/AuthModal";
import { isTeacherRole } from "../../untils/auth";
import { useAuth } from "../../context/AuthProvider";
import { courseService } from "../../services/courseService";
import { FiSearch, FiBell, FiChevronDown } from "react-icons/fi";

const Header = () => {
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [authType, setAuthType] = useState("login");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // --- States quản lý Tìm kiếm ---
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const { user, clearStoredAuth } = useAuth();
  const role = user?.role;
  const isTeacher = isTeacherRole(role);

  // Điều hướng tìm kiếm tổng quát (khi nhấn Enter)
  const handleSearchGlobal = (value) => {
    const keyword = value?.trim();
    if (!keyword) return;
    setShowResults(false);
    navigate(`/all-courses?q=${encodeURIComponent(keyword)}`);
  };

  // Logic tìm kiếm thời gian thực (Debounce)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsSearching(false);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        // Gọi hàm search đã chuẩn hóa từ service
        const data = await courseService.searchCourses({
          q: searchTerm,
          sort_by: "id",
          order: "asc",
        });
        setResults(data); // data lúc này đã là array các object đã normalize
      } catch (error) {
        console.error("Lỗi tìm kiếm khóa học:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400); // Đợi 400ms sau khi người dùng ngừng gõ mới gọi API

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    window.location.href = "/";
  };

  const displayName = user?.name || user?.fullName || "Người dùng";
  const avatarText = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-100">
        {/* LOGO */}
        <div
          className="flex items-center gap-3 min-w-fit cursor-pointer"
          onClick={() => navigate(isTeacher ? "/teacher/dashboard" : "/")}
        >
          <div className="text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.2 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55zM12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-3xl font-black text-[#002B5B] tracking-tight">OU</span>
            <span className="text-2xl font-bold text-[#002B5B] tracking-tight">Education</span>
          </div>
        </div>

        {/* Ô TÌM KIẾM */}
        <div className="flex-1 max-w-2xl mx-6 relative" ref={searchRef}>
          <div className="relative group">
            {/* <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span> */}

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm && setShowResults(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Nếu có kết quả, Enter vào cái đầu tiên, nếu không thì search all
                  if (results.length > 0) {
                    navigate(`/courses/${results[0].id}`);
                    setShowResults(false);
                    setSearchTerm("");
                  } else {
                    handleSearchGlobal(searchTerm);
                  }
                }
              }}
              placeholder={isTeacher ? "Tìm kiếm học viên, khóa học..." : "Bạn muốn học gì hôm nay?"}
              className="w-full py-3 pl-14 pr-14 bg-[#F0F2F5] border border-transparent rounded-full focus:bg-white focus:border-[#002B5B] focus:ring-1 focus:ring-[#002B5B] outline-none transition-all text-base"
            />

            {isSearching && (
              <span className="absolute inset-y-0 right-12 flex items-center">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </span>
            )}


            <button
              onClick={() => handleSearchGlobal(searchTerm)}
              className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-400 hover:text-[#002B5B] transition-colors"
            >
              <FiSearch size={22} strokeWidth={2.5} />
            </button>
          </div>

          {/* HIỂN THỊ KẾT QUẢ TỨ THÌ (DROPDOWN) */}
          {showResults && searchTerm && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-110">
              {isSearching ? (
                <div className="p-6 text-gray-500 text-center italic">Đang tìm kiếm...</div>
              ) : results.length > 0 ? (
                <ul className="max-h-100 overflow-y-auto">
                  <li className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Kết quả gợi ý
                  </li>
                  {results.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        setShowResults(false);
                        setSearchTerm("");
                        navigate(`/courses/${item.id}`);
                      }}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex gap-4 items-center group transition-all border-b border-gray-50 last:border-none"
                    >
                      {/* Ảnh nhỏ đại diện khóa học */}
                      <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-gray-800 group-hover:text-blue-700 truncate">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded uppercase font-bold">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            Giảng viên: {item.instructor}
                          </span>
                        </div>
                      </div>

                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </li>
                  ))}
                  <li
                    onClick={() => handleSearchGlobal(searchTerm)}
                    className="p-3 text-center bg-white hover:bg-gray-50 text-blue-600 font-bold text-sm cursor-pointer transition-colors border-t"
                  >
                    Xem tất cả kết quả cho "{searchTerm}"
                  </li>
                </ul>
              ) : (
                <div className="p-8 text-gray-500 text-center">
                  <p className="text-4xl mb-2">🔭</p>
                  <p>Không tìm thấy khóa học phù hợp</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* USER ACTIONS */}
        {!user ? (
          <div className="flex items-center gap-4 min-w-fit">
            <button
              onClick={() => { setAuthType("login"); setOpenModal(true); }}
              className="px-6 py-2.5 text-base font-semibold text-gray-700 hover:text-[#002B5B] transition-colors"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setAuthType("register"); setOpenModal(true); }}
              className="px-6 py-2.5 text-base font-semibold text-white bg-[#013396] rounded-full hover:bg-[#002B5B] shadow-md transition-all active:scale-95"
            >
              Đăng ký
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-5 min-w-fit">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-3 hover:bg-gray-50 px-2 py-1.5 rounded-2xl transition"
              >
                <div className="w-11 h-11 rounded-full bg-[#2F63D8] text-white flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                  {avatarText}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{displayName}</p>
                  <p className="text-[10px] uppercase font-black text-blue-500 tracking-wider">
                    {isTeacher ? "Giảng viên" : "Học viên"}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-120">
                  <div className="p-4 border-b border-gray-50 bg-slate-50">
                    <p className="font-bold text-slate-800 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); navigate(isTeacher ? "/teacher/profile" : "/settings"); }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 transition flex items-center gap-2"
                  >
                    {isTeacher ? "Hồ sơ giảng viên" : "Thông tin tài khoản"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition border-t border-gray-50 flex items-center gap-2"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {openModal && (
        <AuthModal
          type={authType}
          onClose={() => setOpenModal(false)}
          onSwitchType={(type) => setAuthType(type)}
        />
      )}
    </>
  );
};

export default Header;