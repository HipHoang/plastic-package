import React, { useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiPlay, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../../services/courseService";
import bannerImg from "../../../assets/Avt1.jpg";

const formatPrice = (price) => {
  if (!price || Number(price) === 0) return "Miễn phí";
  return `${Number(price).toLocaleString("vi-VN")}VNĐ`;
};

const getFirstName = (fullName = "") => {
  const trimmed = fullName.trim();
  if (!trimmed) return "bạn";
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1];
};

const UserCourseCard = ({ course, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-4xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
  >
    <div className="h-32 bg-slate-50 relative flex items-center justify-center overflow-hidden">
      {course.image ? (
        <img
          src={course.image || ""}
          alt={course.title || ""}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <span className="group-hover:scale-110 transition-transform text-4xl">📚</span>
      )}

      <span
        className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-lg ${Number(course.price) > 0 ? "bg-orange-400 text-white" : "bg-green-500 text-white"
          }`}
      >
        {Number(course.price) > 0 ? "PRO" : "FREE"}
      </span>
    </div>

    <div className="p-5">
      <h4 className="font-bold text-sm mb-1 group-hover:text-[#013396] transition-colors line-clamp-2 min-h-10">
        {course.title || ""}
      </h4>
      <p className="text-xs text-gray-400 mb-4">{course.instructor}</p>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 text-orange-400 min-w-fit">
          <FiStar fill="currentColor" size={12} />
          <span className="text-xs font-bold">{course.rating || 4.8}</span>
        </div>

        <span
          className={`text-sm font-bold text-right whitespace-nowrap ${Number(course.price) > 0 ? "text-blue-700" : "text-green-600"
            }`}
        >
          {formatPrice(course.price)}
        </span>
      </div>
    </div>
  </div>
);

const TopicCard = ({ title, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-[18px] border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-md transition cursor-pointer"
  >
    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl">
      📘
    </div>
    <h4 className="font-semibold text-sm text-slate-700">{title}</h4>
  </div>
);

const GuestHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses();
        setCourses(data);
      } catch (error) {
        console.error("Lỗi lấy khóa học:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const featuredCourses = useMemo(() => {
    let allCourses = [...courses];

    if (activeTab === "free") {
      allCourses = allCourses.filter((course) => Number(course.price) === 0);
    }

    if (activeTab === "pro") {
      allCourses = allCourses.filter((course) => Number(course.price) > 0);
    }

    return allCourses;
  }, [courses, activeTab]);

  const displayedFeaturedCourses = (featuredCourses || []).slice(0, 4);

  const popularTopics = useMemo(() => {
    const categoryMap = new Map();

    courses.forEach((course) => {
      const key = course.category || course.topic || "Khác";
      if (!categoryMap.has(key)) {
        categoryMap.set(key, key);
      }
    });

    return Array.from(categoryMap.values()).slice(0, 5);
  }, [courses]);

  return (
    <div className="space-y-10">
      <section className="relative bg-linear-to-r from-[#051e58] to-[#1758cf] rounded-[28px] px-8 py-10 md:px-12 md:py-12 overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-100">
        <div className="ml-6 relative z-10 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">
            Học tập hiệu quả,
            <br />
            chinh phục tri thức!
          </h1>

          <p className="text-blue-100 text-base md:text-lg mb-10 leading-relaxed">
            Khám phá các khóa học chất lượng và theo đuổi mục tiêu
            <br />
            học tập cùng OU Education.
          </p>

          <button
            onClick={() => navigate("/all-courses")}
            className="bg-[#0B5CFF] hover:bg-[#044794] px-7 py-3 mt-4 rounded-full font-semibold transition-all flex items-center gap-2 group shadow-lg"
          >
            Khám phá khóa học
            <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative z-10 flex items-center justify-center">
          <img
            src={bannerImg}
            alt="Laptop"
            className="hidden md:block h-64 lg:h-72 object-contain drop-shadow-2xl rounded-2xl"
          />
        </div>

        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"></div>
      </section>

      <section>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-slate-800">Khóa học nổi bật</h2>
              <button
                onClick={() => navigate("/all-courses")}
                className="text-[#002B5B] text-sm font-medium flex items-center gap-1 hover:underline"
              >
                Xem tất cả <FiChevronRight />
              </button>
            </div>

            <div className="flex gap-3 mb-6 flex-wrap">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${activeTab === "all"
                  ? "bg-[#044794] text-white"
                  : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                  }`}
              >
                Tất cả
              </button>

              <button
                onClick={() => setActiveTab("free")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${activeTab === "free"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                  }`}
              >
                Miễn phí
              </button>

              <button
                onClick={() => setActiveTab("pro")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${activeTab === "pro"
                  ? "bg-[#044794] text-white"
                  : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                  }`}
              >
                Pro 
              </button>
            </div>

            {loadingCourses ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 text-sm text-slate-500">
                Đang tải khóa học...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {displayedFeaturedCourses.map((course) => (
                  <UserCourseCard
                    key={course.id || course.course_id}
                    course={course}
                    onClick={() => navigate(`/courses/${course.id || course.course_id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-[20px] md:text-[22px] font-bold text-[#002B5B] leading-snug mb-4">
              Tham gia học tập
              <br />
              cùng chúng tôi!
            </h3>

            <p className="text-sm text-gray-500 leading-6 mb-6">
              Đăng ký tài khoản
              <br />
              để bắt đầu hành trình
              <br />
              chinh phục kiến thức của
              <br />
              bạn.
            </p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("openAuthModal", { detail: { type: "register" } })
                  )
                }
                className="flex-1 bg-[#013396] text-white rounded-full py-3 font-semibold hover:bg-[#002B5B] transition"
              >
                Đăng ký ngay
              </button>

              <button
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("openAuthModal", { detail: { type: "login" } })
                  )
                }
                className="flex-1 bg-white border border-gray-200 text-[#002B5B] rounded-full py-3 font-semibold hover:bg-gray-50 transition"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-[#002B5B]">Chủ đề phổ biến</h2>
          <button
            onClick={() => navigate("/all-courses")}
            className="text-[#002B5B] text-sm font-medium flex items-center gap-1 hover:underline"
          >
            Xem tất cả <FiChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {popularTopics.map((topic) => (
            <TopicCard
              key={topic}
              title={topic}
              onClick={() =>
                navigate(`/all-courses?topic=${encodeURIComponent(topic)}`)
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const UserDashboard = ({ currentUser }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [myCourses, setMyCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
  // TODO: sau này thay bằng API getMyCourses
  setMyCourses([]); // tránh crash
}, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses();
        setCourses(data);
      } catch (error) {
        console.error("Lỗi lấy khóa học:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const featuredCourses = useMemo(() => {
    let allCourses = [...courses];

    if (activeTab === "free") {
      allCourses = allCourses.filter((course) => Number(course.price) === 0);
    }

    if (activeTab === "pro") {
      allCourses = allCourses.filter((course) => Number(course.price) > 0);
    }

    return allCourses;
  }, [courses, activeTab]);

  const displayedFeaturedCourses = featuredCourses.slice(0, 4);
  const continueLearningCourses = (myCourses || []).filter(
  (course) => Number(course?.progress || 0) < 100
);
  const roadmapCourses = (myCourses || []).slice(0, 2);

  const averageProgress = myCourses.length
    ? Math.round(
      myCourses.reduce((sum, item) => sum + Number(item.progress || 0), 0) /
      myCourses.length
    )
    : 0;

  const firstName = getFirstName(currentUser.fullName || "");

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-10">
        <div className="relative bg-[#002B5B] rounded-4xl p-8 md:p-12 overflow-hidden text-white flex items-center justify-between shadow-xl shadow-blue-100">
          <div className="mr-5 relative z-10 max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Chào mừng {firstName} quay trở lại!
            </h1>

            <p className="text-blue-100 text-lg leading-relaxed mb-10">
              Học tập hiệu quả, chinh phục tri thức!
              <br />
              <span className="text-sm opacity-80 font-light">
                Khám phá các khóa học chất lượng và theo dõi tiến độ học tập dễ dàng cùng OU
                Education.
              </span>
            </p>

            <button
              onClick={() => navigate("/all-courses")}
              className="bg-[#007bff] hover:bg-blue-600 px-7 py-3 mt-4 rounded-full font-semibold transition-all flex items-center gap-2 group"
            >
              Khám phá khóa học
              <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="hidden md:block w-64 h-64 bg-blue-400/20 rounded-full blur-3xl absolute -right-10 -bottom-10"></div>

          <img
            src="https://img.freepik.com/free-vector/learning-concept-illustration_114360-6186.jpg"
            alt="Học tập"
            className="hidden md:block h-64 w-auto object-contain relative z-10 drop-shadow-2xl rounded-2xl"
          />
        </div>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Khóa học nổi bật</h2>
            <button
              onClick={() => navigate("/all-courses")}
              className="text-[#044794] text-sm font-medium flex items-center gap-1 hover:underline"
            >
              Xem tất cả <FiChevronRight />
            </button>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${activeTab === "all"
                ? "bg-[#044794] text-white"
                : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
            >
              Tất cả
            </button>

            <button
              onClick={() => setActiveTab("free")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${activeTab === "free"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
            >
              Miễn phí
            </button>

            <button
              onClick={() => setActiveTab("pro")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${activeTab === "pro"
                ? "bg-[#044794] text-white"
                : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
            >
              Pro 
            </button>
          </div>

          {loadingCourses ? (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-sm text-slate-500">
              Đang tải khóa học...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {displayedFeaturedCourses.map((course) => (
                <UserCourseCard
                  key={course.id || course.course_id}
                  course={course}
                  onClick={() => navigate(`/courses/${course.id || course.course_id}`)}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Tiếp tục học</h2>
            <button
              onClick={() => navigate("/all-courses")}
              className="text-[#044794] text-sm font-medium hover:underline flex items-center gap-1"
            >
              Xem tất cả <FiChevronRight />
            </button>
          </div>

          {continueLearningCourses.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-sm text-slate-500">
              Bạn chưa có khóa học nào đang học. Hãy đăng ký một khóa học để bắt đầu.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(continueLearningCourses || []).slice(0, 2).map((course) => (
                <div
                  key={course.courseId}
                  className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition"
                  onClick={() => navigate(`/learn/${course.courseId}`)}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-xl overflow-hidden flex items-center justify-center text-sm font-bold text-[#002B5B]">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (course.title || "").slice(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm line-clamp-2">{course.title}</h4>
                    <p className="text-xs text-gray-400 mb-2">
                      Tiến độ hiện tại: {course.progress}%
                    </p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/learn/${course.courseId}`);
                    }}
                    className="bg-blue-600 p-2.5 rounded-full text-white"
                  >
                    <FiPlay fill="currentColor" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="w-full lg:w-80 space-y-8">
        <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Tiến độ học tập</h3>
            <select className="text-xs bg-gray-50 p-1 rounded border-none outline-none">
              <option>Hiện tại</option>
            </select>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full border-10 border-gray-100 border-t-blue-600 flex items-center justify-center relative">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{averageProgress}%</p>
                <p className="text-xs text-gray-400">Trung bình</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Đang học</span>
              <span className="font-semibold">
                {(myCourses || []).filter((c) => c?.status === "Đang học")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hoàn thành</span>
              <span className="font-semibold">
                {myCourses.filter((c) => c.status === "Hoàn thành").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tổng khóa học</span>
              <span className="font-semibold">{myCourses.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Lộ trình học của bạn</h3>
            <button
              onClick={() => navigate("/all-courses")}
              className="text-blue-600 text-xs font-medium hover:underline"
            >
              Xem chi tiết
            </button>
          </div>

          <div className="space-y-5">
            {roadmapCourses.length === 0 ? (
              <p className="text-sm text-gray-500">
                Chưa có dữ liệu lộ trình học. Hãy đăng ký khóa học để bắt đầu.
              </p>
            ) : (
              roadmapCourses.map((course, index) => {
                const isCompleted = Number(course.progress) === 100;

                return (
                  <div key={course.courseId} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full ${isCompleted
                          ? "bg-blue-600"
                          : "bg-white border-2 border-gray-400"
                          }`}
                      ></div>
                      {index < roadmapCourses.length - 1 && (
                        <div className="w-0.5 h-16 bg-blue-200"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{course.title}</h4>
                      <p className="text-xs text-gray-500">
                        {isCompleted ? "Đã hoàn thành" : "Đang học"} • {course.progress}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeStudent = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    return <GuestHome />;
  }

  return <UserDashboard currentUser={currentUser} />;
};

export default HomeStudent;