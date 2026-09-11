import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../auth/AuthModal";
import { isStaffRole, isAdminRole } from "../../untils/auth";
import { useAuth } from "../../context/AuthProvider";
import { productService } from "../../services/productService";
import {
  FiSearch,
  FiBell,
  FiChevronDown,
  FiPhone,
  FiShoppingBag,
} from "react-icons/fi";

const Header = () => {
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [authType, setAuthType] = useState("login");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const { user, clearStoredAuth } = useAuth();

  const role = user?.role;

  const isAdmin = isAdminRole(role);
  const isStaff = isStaffRole(role);
  const isManagement = isAdmin || isStaff;

  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      const requestedType =
        event?.detail?.type === "register"
          ? "register"
          : "login";

      setAuthType(requestedType);
      setOpenModal(true);
    };

    window.addEventListener(
      "openAuthModal",
      handleOpenAuthModal
    );

    return () => {
      window.removeEventListener(
        "openAuthModal",
        handleOpenAuthModal
      );
    };
  }, []);

  const handleSearchGlobal = (value) => {
    const keyword = value?.trim();

    if (!keyword) return;

    setShowResults(false);

    navigate(
      `/products?q=${encodeURIComponent(keyword)}`
    );
  };

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
        const data =
          await productService.searchProducts({
            q: searchTerm,
            sort_by: "newest",
          });

        setResults(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Lỗi tìm kiếm sản phẩm:",
          error
        );

        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () =>
      clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setShowResults(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(
          event.target
        )
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    setShowUserMenu(false);
    navigate("/");
  };

  const displayName =
    user?.name ||
    user?.fullName ||
    "Khách hàng";

  const avatarText =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase() || "K";

  const getHomePath = () => {
    if (isAdmin || isStaff) {
      return "/admin/dashboard";
    }

    return "/";
  };

  const getAccountPath = () => {
    if (isAdmin || isStaff) {
      return "/admin/profile";
    }

    return "/settings";
  };

  const getRoleLabel = () => {
    if (isAdmin) return "Quản trị viên";
    if (isStaff) return "Nhân viên";

    return "Khách hàng";
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-100">

        {/* LOGO */}
        <div
          className="flex items-center gap-3 min-w-fit cursor-pointer"
          onClick={() =>
            navigate(getHomePath())
          }
        >
          <div className="w-11 h-11 rounded-lg bg-[#013396] flex items-center justify-center">
            <span className="text-white text-xl font-black">
              A
            </span>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-black text-[#002B5B] tracking-tight">
              ASIAPP
            </span>

            <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
              Plastic Packaging
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-6 ml-8">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-semibold text-gray-700 hover:text-[#013396] transition"
          >
            Trang chủ
          </button>

          <button
            onClick={() =>
              navigate("/products")
            }
            className="text-sm font-semibold text-gray-700 hover:text-[#013396] transition"
          >
            Sản phẩm
          </button>

          <button
            onClick={() =>
              navigate("/products")
            }
            className="text-sm font-semibold text-gray-700 hover:text-[#013396] transition"
          >
            Danh mục
          </button>
        </nav>

        {/* SEARCH */}
        <div
          className="flex-1 max-w-xl mx-6 relative"
          ref={searchRef}
        >
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FiSearch size={20} />
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              onFocus={() =>
                searchTerm &&
                setShowResults(true)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (results.length > 0) {
                    navigate(
                      `/products/${results[0].id}`
                    );

                    setShowResults(false);
                    setSearchTerm("");
                  } else {
                    handleSearchGlobal(
                      searchTerm
                    );
                  }
                }
              }}
              placeholder="Tìm kiếm sản phẩm bao bì..."
              className="w-full py-3 pl-12 pr-12 bg-[#F0F2F5] border border-transparent rounded-full focus:bg-white focus:border-[#002B5B] focus:ring-1 focus:ring-[#002B5B] outline-none transition-all text-sm"
            />

            {isSearching && (
              <span className="absolute inset-y-0 right-12 flex items-center">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </span>
            )}

            <button
              onClick={() =>
                handleSearchGlobal(
                  searchTerm
                )
              }
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#002B5B] transition-colors"
            >
              <FiSearch size={20} />
            </button>
          </div>

          {/* SEARCH RESULTS */}
          {showResults &&
            searchTerm && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-110">
                {isSearching ? (
                  <div className="p-6 text-gray-500 text-center">
                    Đang tìm kiếm sản phẩm...
                  </div>
                ) : results.length > 0 ? (
                  <ul className="max-h-100 overflow-y-auto">
                    <li className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Sản phẩm phù hợp
                    </li>

                    {results.map(
                      (item) => (
                        <li
                          key={item.id}
                          onClick={() => {
                            setShowResults(
                              false
                            );

                            setSearchTerm(
                              ""
                            );

                            navigate(
                              `/products/${item.id}`
                            );
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex gap-4 items-center group transition-all border-b border-gray-50 last:border-none"
                        >
                          <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                            {item.image ? (
                              <img
                                src={
                                  item.image
                                }
                                alt={
                                  item.title
                                }
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                ASIAPP
                              </div>
                            )}
                          </div>

                          <div className="flex-1 overflow-hidden">
                            <p className="font-bold text-gray-800 group-hover:text-blue-700 truncate">
                              {
                                item.title
                              }
                            </p>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded uppercase font-bold">
                                {
                                  item.category
                                }
                              </span>

                              {item.material && (
                                <span className="text-xs text-gray-400 font-medium truncate">
                                  {
                                    item.material
                                  }
                                </span>
                              )}
                            </div>
                          </div>

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </li>
                      )
                    )}

                    <li
                      onClick={() =>
                        handleSearchGlobal(
                          searchTerm
                        )
                      }
                      className="p-3 text-center bg-white hover:bg-gray-50 text-blue-600 font-bold text-sm cursor-pointer transition-colors border-t"
                    >
                      Xem tất cả kết quả cho "
                      {searchTerm}"
                    </li>
                  </ul>
                ) : (
                  <div className="p-8 text-gray-500 text-center">
                    <p className="text-3xl mb-2">
                      Không có kết quả
                    </p>

                    <p>
                      Không tìm thấy sản phẩm phù hợp
                    </p>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* HOTLINE */}
        <a
          href="tel:02873008899"
          className="hidden xl:flex items-center gap-2 mr-5 text-[#013396] hover:text-[#002B5B] transition"
        >
          <FiPhone size={20} />

          <div className="leading-tight">
            <p className="text-[10px] uppercase font-bold text-gray-400">
              Hotline
            </p>

            <p className="text-sm font-bold">
              028 7300 8899
            </p>
          </div>
        </a>

        {/* USER ACTIONS */}
        {!user ? (
          <div className="flex items-center gap-3 min-w-fit">
            <button
              onClick={() => {
                setAuthType("login");
                setOpenModal(true);
              }}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-[#002B5B] transition-colors"
            >
              Đăng nhập
            </button>

            <button
              onClick={() => {
                setAuthType("register");
                setOpenModal(true);
              }}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#013396] rounded-full hover:bg-[#002B5B] shadow-md transition-all active:scale-95"
            >
              Đăng ký
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 min-w-fit">

            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <FiBell size={22} />
            </button>

            <div
              className="relative"
              ref={userMenuRef}
            >
              <button
                onClick={() =>
                  setShowUserMenu(
                    (prev) => !prev
                  )
                }
                className="flex items-center gap-3 hover:bg-gray-50 px-2 py-1.5 rounded-2xl transition"
              >
                <div className="w-10 h-10 rounded-full bg-[#2F63D8] text-white flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                  {avatarText}
                </div>

                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    {displayName}
                  </p>

                  <p className="text-[10px] uppercase font-black text-blue-500 tracking-wider">
                    {getRoleLabel()}
                  </p>
                </div>

                <FiChevronDown
                  className={`text-gray-400 transition-transform ${
                    showUserMenu
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-120">

                  {/* ACCOUNT */}
                  <div className="p-4 border-b border-gray-50 bg-slate-50">
                    <p className="font-bold text-slate-800 truncate">
                      {displayName}
                    </p>

                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* PROFILE */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate(
                        getAccountPath()
                      );
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 transition"
                  >
                    {isManagement
                      ? "Thông tin tài khoản"
                      : "Thông tin khách hàng"}
                  </button>

                  {/* CUSTOMER ORDERS */}
                  {!isManagement && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/orders");
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 transition border-t border-gray-50 flex items-center gap-3"
                    >
                      <FiShoppingBag
                        size={17}
                        className="text-[#013396]"
                      />

                      <span>
                        Đơn hàng của tôi
                      </span>
                    </button>
                  )}

                  {/* ADMIN */}
                  {isManagement && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate(
                          "/admin/dashboard"
                        );
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 transition border-t border-gray-50"
                    >
                      Quản trị sản phẩm
                    </button>
                  )}

                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition border-t border-gray-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* AUTH MODAL */}
      {openModal && (
        <AuthModal
          type={authType}
          onClose={() =>
            setOpenModal(false)
          }
          onSwitchType={(type) =>
            setAuthType(type)
          }
        />
      )}
    </>
  );
};

export default Header;
