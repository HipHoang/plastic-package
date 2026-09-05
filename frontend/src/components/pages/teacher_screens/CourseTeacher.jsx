import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { teacherCourseService } from "../../../services/teacherCourseService";

const CourseTeacher = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await teacherCourseService.getTeacherCourses();
        setCourses(data);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách khóa học");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
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

  const formatPrice = (price) => {
    if (!price || price === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Khóa học của tôi</h1>
        <p className="text-slate-500 mt-2">
          Danh sách khóa học bạn đang quản lý
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[28px] border border-gray-100">
          <p className="text-slate-500">Bạn chưa có khóa học nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
            >
              {course.image && (
                <div className="mb-4 rounded-2xl overflow-hidden h-40">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-xl text-sm font-medium ${course.status === "Đã xuất bản"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                    }`}
                >
                  {course.status || "Đã xuất bản"}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {course.title}
              </h3>

              <div className="space-y-2 text-slate-600">
                <p>Học viên: {course.students || 0}</p>
                <p>Giá: {formatPrice(course.price)}</p>
              </div>

<div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate(`/teacher/courses/${course.id}`)}
                  className="flex-1 bg-[#0B5CFF] text-white py-3 rounded-2xl font-semibold hover:bg-blue-700 transition"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    
  );
};

export default CourseTeacher;
