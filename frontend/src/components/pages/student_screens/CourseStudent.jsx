import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiBookOpen,
  FiCheckCircle,
  FiFilter,
  FiPlay,
  FiSearch,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../../untils/auth";

const CourseStudent = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token = getAccessToken();

        if (!token) {
          console.warn("No token found");
          setCourses([]);
          return;
        }

        const res = await axios.get(
          "http://127.0.0.1:5000/api/courses/my-courses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("My courses API:", res.data);

        // Defensive mapping
        const normalized = (res.data || []).map((c) => ({
          courseId: c.id,
          title: c.title || "",
          image: c.image || "",
          progress: c.progress_percent || 0,
          completedLessons: c.completed_lessons || 0,
          totalLessons: c.total_lessons || 0,
          status:
            c.course_status === "completed"
              ? "Hoàn thành"
              : c.course_status === "in_progress"
                ? "Đang học"
                : "Chưa bắt đầu",
          category: c.category || "",
          shortDescription: c.description || "",
        }));

        setCourses(normalized);
      } catch (error) {
        console.error("Fetch my courses error:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);


  const filteredCourses = (courses || []).filter((course) => {
  const title = course.title || "";
  const category = course.category || "";
  const status = course.status || "";

  const matchSearch =
    title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    status.toLowerCase().includes(searchTerm.toLowerCase());

  const matchTab =
    activeTab === "all"
      ? true
      : activeTab === "learning"
      ? status === "Đang học"
      : status === "Hoàn thành";

  return matchSearch && matchTab;
});


  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-gray-100 p-8">
        Đang tải khóa học...
      </div>
    );
  }

  return (
    <div className="space-y-8 px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Khóa học của tôi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bạn đã đăng ký {courses.length} khóa học
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#002B5B] w-64"
            />
          </div>

          <button className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-600">
            <FiFilter />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100 pb-1">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-semibold transition ${activeTab === "all"
              ? "text-[#002B5B] border-b-2 border-[#002B5B]"
              : "text-gray-500 hover:text-[#002B5B]"
            }`}
        >
          Tất cả
        </button>

        <button
          onClick={() => setActiveTab("learning")}
          className={`px-4 py-2 text-sm font-semibold transition ${activeTab === "learning"
              ? "text-[#002B5B] border-b-2 border-[#002B5B]"
              : "text-gray-500 hover:text-[#002B5B]"
            }`}
        >
          Đang học
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 text-sm font-semibold transition ${activeTab === "completed"
              ? "text-[#002B5B] border-b-2 border-[#002B5B]"
              : "text-gray-500 hover:text-[#002B5B]"
            }`}
        >
          Hoàn thành
        </button>
      </div>

      {/* Empty state */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-[28px] border border-gray-100 p-10 text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Chưa có khóa học nào
          </h3>
          <p className="text-slate-500 mb-6">
            Hãy đăng ký một khóa học để bắt đầu hành trình học tập của bạn.
          </p>
          <button
            onClick={() => navigate("/all-courses")}
            className="px-6 py-3 rounded-full bg-[#002B5B] text-white font-semibold hover:bg-[#001E3C] transition"
          >
            Khám phá khóa học
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.courseId}
              onClick={() => navigate(`/learn/${course.courseId}`)}
              className="bg-white rounded-[28px] border border-gray-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image || "/default-course.jpg"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-[#002B5B] uppercase">
                    {course.category}
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-[#002B5B] text-white rounded-lg text-[10px] font-bold">
                    Tiếp tục học
                  </span>
                </div>

                {course.progress === 100 && (
                  <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
                    <div className="bg-white p-2 rounded-full text-green-600 shadow-lg">
                      <FiCheckCircle size={30} />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-[#002B5B] transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <FiBookOpen />
                  <span>
                    {course.completedLessons}/{course.totalLessons} bài học
                  </span>
                </div>

                <p className="text-sm text-slate-500 mb-5 line-clamp-2">
                  {(course.shortDescription || "").slice(0, 100)}
                </p>

                {/* Progress */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      Tiến độ
                    </span>
                    <span
                      className={`font-bold ${course.progress === 100
                          ? "text-green-600"
                          : "text-[#002B5B]"
                        }`}
                    >
                      {course.progress}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${course.progress === 100
                          ? "bg-green-500"
                          : "bg-[#002B5B]"
                        }`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${course.status === "Hoàn thành"
                        ? "text-green-600"
                        : "text-slate-500"
                      }`}
                  >
                    {course.status}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/learn/${course.courseId}`);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition ${course.progress === 100
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-[#002B5B] text-white hover:bg-[#001E3C]"
                      }`}
                  >
                    {course.progress === 100 ? (
                      "Xem lại"
                    ) : (
                      <>
                        Tiếp tục <FiPlay fill="currentColor" size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseStudent;