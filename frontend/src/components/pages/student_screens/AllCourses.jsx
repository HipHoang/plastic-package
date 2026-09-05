import React, { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { courseService } from "../../../services/courseService";

const formatPrice = (price) => {
  if (!price || Number(price) === 0) return "Miễn phí";
  return `${Number(price).toLocaleString("vi-VN")}VNĐ`;
};

const AllCourses = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ URL params (source of truth)
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";

  // ✅ state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: "",
    level: "",
    rating: "",
    price: "",
    sort_by: "newest",
  });

  // =========================
  // CALL API WHEN URL / FILTER CHANGE
  // =========================
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);

      try {
        const params = {
          q,
          category: filters.category,
          level: filters.level,
          sort_by: filters.sort_by,
          order: "desc",
          rating: filters.rating || undefined,
        };

        if (filters.price === "free") params.is_free = true;
        if (filters.price === "paid") params.is_free = false;

        const res = await courseService.searchCoursesPaged(params);

        setCourses(res?.results || []);
      } catch (err) {
        console.error(err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [q, filters]);


  // =========================
  // UI
  // =========================
  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-gray-100 p-10 text-center text-slate-500">
        Đang tải khóa học...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-slate-700 font-medium hover:bg-gray-50 transition"
        >
          <FiArrowLeft />
          Quay lại
        </button>
      </div>

      {/* HEADER */}
      <div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-800">
          Tất cả khóa học
        </h1>
        <p className="text-sm text-slate-500 mt-3">
          Hiển thị {Array.isArray(courses) ? courses.length : 0} khóa học
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* LEFT FILTERS */}
          <div className="flex flex-wrap items-center gap-4">

            {/* CATEGORY */}
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm
                   hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                   outline-none transition"
            >
              <option value="">Tất cả chủ đề</option>
              <option value="Lập trình">Lập trình</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>

            {/* LEVEL */}
            <select
              value={filters.level}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, level: e.target.value }))
              }
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm
                   hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                   outline-none transition"
            >
              <option value="">Tất cả trình độ</option>
              <option value="Cơ bản">Cơ bản</option>
              <option value="Trung cấp">Trung cấp</option>
              <option value="Nâng cao">Nâng cao</option>
            </select>

            {/* RATING */}
            <select
              value={filters.rating}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, rating: e.target.value }))
              }
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm
                   hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                   outline-none transition"
            >
              <option value="">Tất cả sao</option>
              <option value="4">Từ 4.0 ⭐</option>
              <option value="4.5">Từ 4.5 ⭐</option>
            </select>

            {/* PRICE */}
            <select
              value={filters.price}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, price: e.target.value }))
              }
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm
                   hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                   outline-none transition"
            >
              <option value="">Tất cả giá</option>
              <option value="free">Miễn phí</option>
              <option value="paid">Trả phí</option>
            </select>

          </div>

          {/* RIGHT SORT */}
          <div className="flex items-center gap-2">

            <span className="text-sm text-gray-500 hidden sm:block">
              Sắp xếp:
            </span>

            <select
              value={filters.sort_by}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sort_by: e.target.value }))
              }
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm
                   hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200
                   outline-none transition"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="most_popular">Phổ biến nhất</option>
            </select>

          </div>
        </div>
      </div>



      {/* EMPTY STATE */}
      {!Array.isArray(courses) || courses.length === 0 ? (
        <div className="bg-white rounded-[28px] border border-gray-100 p-10 text-center text-slate-500">
          Không tìm thấy khóa học
        </div>
      ) : (
        /* COURSE LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {courses.map((course) => {
            console.log("COURSE ITEM:", course);

            return (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="bg-white rounded-[28px] border border-gray-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="relative h-44 overflow-hidden bg-slate-50">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      📚
                    </div>
                  )}

                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold ${Number(course.price) > 0
                        ? "bg-orange-400 text-white"
                        : "bg-green-500 text-white"
                        }`}
                    >
                      {Number(course.price) > 0 ? "PRO" : "FREE"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 min-h-12 group-hover:text-[#002B5B] transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-gray-400 mb-2">
                    {course.instructor}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                      {course.level || "Cơ bản"}
                    </span>
                    <span className="text-xs text-orange-500 font-semibold">
                      {course.rating > 0 ? `⭐ ${course.rating}` : "Chưa có đánh giá"}
                    </span>

                  </div>

                  <p className="text-sm font-bold text-right text-[#002B5B]">
                    {formatPrice(course.price)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllCourses;
