import React, { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiLock,
  FiMonitor,
  FiPlayCircle,
  FiSmartphone,
  FiStar,
  FiUser,
  FiX,
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { courseService } from "../../../services/courseService";
import { paymentService } from "../../../services/paymentService";
import { reviewService } from "../../../services/reviewService";
import { getCurrentUser } from "../../../untils/auth";
import { enrollmentService } from "../../../services/enrollmentService";
import { lessonService } from "../../../services/lessonService";
import apiClient from "../../../untils/auth";

const formatPrice = (price) => {
  if (!price || Number(price) === 0) return "Miễn phí";
  return `${Number(price).toLocaleString("vi-VN")}VNĐ`;
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openChapters, setOpenChapters] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    note: "",
  });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
  });

// Role-based UI
  const currentUser = getCurrentUser();
  const isTeacher = currentUser?.role === "teacher" || currentUser?.role === "admin";

  // Teacher accordion state - track which lesson is expanded
  const [openLessonId, setOpenLessonId] = useState(null);

  // Lesson management states
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    content: "",
    video_url: ""
  });
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editLesson, setEditLesson] = useState({});

  const refreshReviewData = (courseId) => {
    const courseReviews = reviewService.getCourseReviews(courseId);
    const stats = reviewService.getCourseReviewStats(courseId);
    const myReview = reviewService.getMyReview(courseId);

    setReviews(courseReviews);
    setReviewStats(stats);

    if (myReview) {
      setReviewForm({
        rating: myReview.rating,
        comment: myReview.comment || "",
      });
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseService.getCourseById(id);
        setCourse(data);
        const enrolled = await enrollmentService.checkEnrollment(id);
        setIsEnrolled(enrolled);

        const initialState = {};
        data.chapters?.forEach((chapter, index) => {
          initialState[chapter.id] = index === 0;
        });
        setOpenChapters(initialState);

        refreshReviewData(data.id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setPaymentForm((prev) => ({
      ...prev,
      fullName: currentUser?.name || "",
      email: currentUser?.email || "",
    }));
  }, []);

  const isFreeCourse = useMemo(() => Number(course?.price || 0) === 0, [course]);

  const toggleChapter = (chapterId) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleRequireAuth = (type = "login", message = "") => {
    window.dispatchEvent(
      new CustomEvent("openAuthModal", {
        detail: { type, message },
      })
    );
  };

// Thêm async vào đây 
  const enrollFreeCourse = async () => {
    try {
      await enrollmentService.enrollCourse(course.id);

      setIsEnrolled(true);
      alert("Đăng ký khóa học thành công!");
      // Redirect to learning page after successful enrollment
      navigate(`/learn/${course.id}`);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi đăng ký khóa học.");
    }
  };


  const handleEnrollCourse = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      handleRequireAuth("login", "Bạn cần đăng nhập để đăng ký khóa học này.");
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${course.id}`);
      return;
    }

    if (isFreeCourse) {
      enrollFreeCourse();
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!paymentForm.fullName.trim() || !paymentForm.phone.trim() || !paymentForm.email.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Bạn cần đăng nhập");
      return;
    }

    setIsProcessingPayment(true);

    try {
      console.log("Creating payment...");

      const res = await apiClient.post(
        "/payment/checkout",
        {
          user_id: currentUser.id,
          course_id: course.id,
          amount: course.price,
        }
      );

      const paymentUrl = res.data.payment_url;

      console.log("Redirect to:", paymentUrl);

      window.location.href = paymentUrl;

    } catch (error) {
      console.error("Payment error:", error);
      alert("Không thể tạo thanh toán");
    } finally {
      setIsProcessingPayment(false);
    }
  };


  const handleLearnNow = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      handleRequireAuth("login", "Bạn cần đăng nhập để học khóa học này.");
      return;
    }

    if (!isEnrolled) {
      if (isFreeCourse) {
        enrollFreeCourse();
        navigate(`/learn/${course.id}`);
      } else {
        setShowPaymentModal(true);
      }
      return;
    }

    navigate(`/learn/${course.id}`);
  };

const handleSubmitReview = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      handleRequireAuth("login", "Bạn cần đăng nhập để đánh giá khóa học.");
      return;
    }

    if (!isEnrolled) {
      alert("Bạn cần đăng ký khóa học trước khi đánh giá.");
      return;
    }

    try {
      reviewService.addOrUpdateReview(course.id, reviewForm);
      refreshReviewData(course.id);
      alert("Đã lưu đánh giá của bạn!");
    } catch (error) {
      console.error(error);
      alert("Không thể gửi đánh giá.");
    }
  };

  // ====== LESSON MANAGEMENT HANDLERS ======
  const handleAddLesson = async () => {
    if (!newLesson.title.trim()) {
      alert("Vui lòng nhập tên bài học");
      return;
    }
    try {
      const created = await lessonService.createLesson({
        course_id: parseInt(id),
        ...newLesson
      });
      if (created) {
        alert("Thêm bài học thành công!");
        setShowAddLesson(false);
        setNewLesson({ title: "", description: "", content: "", video_url: "" });
        // Refresh course data
        window.location.reload();
      }
    } catch (err) {
      console.error("Add lesson error:", err);
      alert("Lỗi khi thêm bài học");
    }
  };

  const handleUpdateLesson = async (lessonId) => {
    try {
      const updated = await lessonService.updateLesson(lessonId, editLesson);
      if (updated) {
        alert("Cập nhật bài học thành công!");
        setEditingLessonId(null);
        setEditLesson({});
        window.location.reload();
      }
    } catch (err) {
      console.error("Update lesson error:", err);
      alert("Lỗi khi cập nhật bài học");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này?")) return;
    try {
      const success = await lessonService.deleteLesson(lessonId);
      if (success) {
        alert("Xóa bài học thành công!");
        window.location.reload();
      }
    } catch (err) {
      console.error("Delete lesson error:", err);
      alert("Lỗi khi xóa bài học");
    }
  };

  const startEditLesson = (lesson) => {
    setEditingLessonId(lesson.lesson_id);
    setEditLesson({
      title: lesson.title || "",
      description: lesson.description || "",
      content: lesson.content || "",
      video_url: lesson.video_url || ""
    });
  };

const cancelEdit = () => {
    setEditingLessonId(null);
    setEditLesson({});
  };

  // ====== TEACHER ACCORDION - Toggle lesson expand/collapse ======
  const toggleLesson = (lessonId, e) => {
    e?.stopPropagation(); // Prevent parent click
    setOpenLessonId(openLessonId === lessonId ? null : lessonId);
  };

  // Student clicks → navigate to learn page
  const handleLessonClick = (lessonId, e) => {
    e?.stopPropagation(); // Prevent teacher accordion toggle
    if (!isEnrolled) {
      alert("Bạn cần đăng ký khóa học để xem bài học");
      return;
    }
    navigate(`/learn/${course.id}?lesson=${lessonId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-gray-100 p-8">
        Đang tải chi tiết khóa học...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-white rounded-[28px] border border-gray-100 p-8">
        Không tìm thấy khóa học.
      </div>
    );
  }

  // useEffect(() => {
  //   const fetchCourse = async () => {
  //     try {
  //       setLoading(true);
  //       setCheckingEnrollment(true);

  //       const data = await courseService.getCourseById(id);
  //       setCourse(data);

  //       // ✅ GỌI API thật qua service
  //       const enrolled = await enrollmentService.checkEnrollment(id);
  //       setIsEnrolled(enrolled);

  //       // UI chapters
  //       const initialState = {};
  //       data.chapters?.forEach((chapter, index) => {
  //         initialState[chapter.id] = index === 0;
  //       });
  //       setOpenChapters(initialState);

  //       refreshReviewData(data.id);

  //     } catch (error) {
  //       console.error("fetchCourse ERROR:", error);
  //     } finally {
  //       setLoading(false);
  //       setCheckingEnrollment(false);
  //     }
  //   };

  //   if (id) fetchCourse();
  // }, [id]);



  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-slate-700 font-medium hover:bg-gray-50 transition"
          >
            <FiArrowLeft />
            Quay lại
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.8fr] gap-8 items-start">
          <div className="space-y-8">
            <div className="bg-white rounded-[28px] border border-gray-100 p-8 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase">
                  {course.category}
                </span>
                <span className="flex items-center gap-1 text-sm text-orange-500 font-semibold">
                  <FiStar fill="currentColor" />
                  {reviewStats.total > 0 ? reviewStats.average : course.rating}
                </span>
                <span className="text-sm text-slate-500">
                  ({reviewStats.total} đánh giá)
                </span>
              </div>

              <h1 className="text-4xl font-bold text-[#0F172A] leading-tight mb-4">
                {course.title}
              </h1>

              <p className="text-slate-600 text-[17px] leading-8 mb-8">
                {course.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.outcomes?.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="mt-1 text-blue-600 font-bold">✓</span>
                    <p className="text-slate-700 leading-7">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[28px] border border-gray-100 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
                    Nội dung khóa học
                  </h2>
                  <p className="text-slate-600">
                    {course.totalChapters} chương • {course.totalLessons} bài học •
                    Thời lượng {course.totalDuration}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const expanded = {};
                    course.chapters?.forEach((chapter) => {
                      expanded[chapter.id] = true;
                    });
                    setOpenChapters(expanded);
                  }}
                  className="text-blue-700 font-semibold hover:underline text-left md:text-right"
                >
                  Mở rộng tất cả
                </button>
              </div>

<div className="space-y-4">
                {/* Teacher: Add Lesson Button */}
                {isTeacher && (
                  <button
                    onClick={() => setShowAddLesson(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-[#0B5CFF] text-white rounded-xl font-semibold hover:bg-blue-700 transition mb-4"
                  >
                    <FiPlus />
                    Thêm bài học
                  </button>
                )}

                {/* Add Lesson Form */}
                {showAddLesson && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-gray-200">
                    <h4 className="font-bold text-slate-800 mb-3">Thêm bài học mới</h4>
                    <input
                      type="text"
                      placeholder="Tên bài học"
                      value={newLesson.title}
                      onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Video URL (tùy chọn)"
                      value={newLesson.video_url}
                      onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddLesson}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setShowAddLesson(false)}
                        className="px-4 py-2 border border-gray-200 text-slate-700 rounded-lg"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {(!course.chapters || course.chapters.length === 0) ? (
                  <div className="text-center py-8 text-slate-500 bg-gray-50 rounded-xl">
                    <p>Chưa có bài học nào</p>
                    {isTeacher && <p className="text-sm">Nhấn "Thêm bài học" để tạo bài học đầu tiên</p>}
                  </div>
                ) : (
                  course.chapters?.map((chapter, chapterIndex) => (
                    <div
                      key={chapter.id}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between"
                      >
                        <div className="text-left">
                          <h3 className="font-bold text-lg text-slate-800">
                            {chapterIndex + 1}. {chapter.title}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {chapter.lessonsCount} bài học
                          </p>
                        </div>
                        <FiChevronDown
                          className={`transition-transform ${openChapters[chapter.id] ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {openChapters[chapter.id] && (
                        <div className="divide-y divide-gray-100">
                          {chapter.lessons?.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition cursor-pointer"
                            >
                              {editingLessonId === lesson.lesson_id ? (
                                /* Edit Mode */
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={editLesson.title}
                                    onChange={(e) => setEditLesson({...editLesson, title: e.target.value})}
                                    className="w-full rounded-lg border border-gray-200 px-2 py-1"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateLesson(lesson.lesson_id)}
                                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="px-3 py-1 border border-gray-200 text-slate-700 rounded-lg text-sm"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                </div>
) : (
                                /* Display Mode - Different behavior for teacher vs student */
                                <>
                                  {/* Teacher: Click to expand accordion, Student: Click to navigate */}
                                  {isTeacher ? (
                                    <div 
                                      onClick={(e) => toggleLesson(lesson.lesson_id || lesson.id, e)}
                                      className={`flex items-start gap-3 flex-1 cursor-pointer rounded-xl border p-4 mb-3 hover:bg-gray-50 transition-all ${openLessonId === (lesson.lesson_id || lesson.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-100'}`}
                                    >
                                      <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        isEnrolled ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                                      }`}>
                                        {lessonIndex + 1}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-slate-800">
                                          {lesson.title}
                                        </p>
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                          {lesson.video_url && "🎥 Video"}
                                          {lesson.content && "📄 Tài liệu"}
                                          {lesson.duration || ""}
                                        </p>
                                        {/* Expanded content - show details when open */}
                                        {openLessonId === (lesson.lesson_id || lesson.id) && (
                                          <div className="mt-3 space-y-2 text-sm">
                                            {lesson.video_url && (
                                              <div className="text-blue-600">
                                                <span className="font-medium">Video:</span> {lesson.video_url.substring(0, 50)}...
                                              </div>
                                            )}
                                            {lesson.description && (
                                              <div className="text-slate-600">
                                                <span className="font-medium">Mô tả:</span> {lesson.description}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <FiChevronDown className={`transition-transform ${openLessonId === (lesson.lesson_id || lesson.id) ? "rotate-180" : ""} text-slate-400`} />
                                    </div>
                                  ) : (
                                    /* Student: Navigate to learning page */
                                    <div 
                                      onClick={(e) => handleLessonClick(lesson.lesson_id || lesson.id, e)}
                                      className="flex items-start gap-3 flex-1 cursor-pointer"
                                    >
                                      <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        isEnrolled ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                                      }`}>
                                        {lessonIndex + 1}
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-800">
                                          {lesson.title}
                                        </p>
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                          {lesson.video_url && "🎥 Video"}
                                          {lesson.content && "📄 Tài liệu"}
                                          {lesson.duration || ""}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <div className="text-slate-400 text-sm mr-2">
                                      {isEnrolled ? (
                                        <span className="text-green-600 flex items-center gap-1">
                                          <FiCheckCircle /> Đã học
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1">
                                          <FiLock /> Chưa học
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Teacher Actions - with e.stopPropagation() to prevent accordion toggle */}
                                    {isTeacher && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); startEditLesson(lesson); }}
                                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                          title="Chỉnh sửa"
                                        >
                                          <FiEdit2 size={16} />
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.lesson_id || lesson.id); }}
                                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                          title="Xóa"
                                        >
                                          <FiTrash2 size={16} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-[28px] border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <FiStar className="text-orange-500" />
                <h2 className="text-2xl font-bold text-slate-800">
                  Đánh giá khóa học
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
                <div className="rounded-3xl bg-slate-50 border border-gray-100 p-6">
                  <div className="text-5xl font-bold text-slate-800 mb-2">
                    {reviewStats.total > 0 ? reviewStats.average : "0.0"}
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 mb-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FiStar key={index} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    {reviewStats.total} lượt đánh giá từ học viên
                  </p>
                </div>

                <div className="rounded-3xl border border-gray-100 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">
                    Đánh giá của bạn
                  </h3>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setReviewForm((prev) => ({ ...prev, rating: star }))
                        }
                        className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${reviewForm.rating >= star
                          ? "bg-orange-50 border-orange-200 text-orange-500"
                          : "bg-white border-gray-200 text-gray-400"
                          }`}
                      >
                        <FiStar fill="currentColor" />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder="Nhập cảm nhận của bạn về khóa học..."
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B]"
                  />

                  <button
                    onClick={handleSubmitReview}
                    className="mt-4 px-5 py-3 rounded-2xl bg-[#002B5B] text-white font-semibold hover:opacity-90"
                  >
                    Gửi đánh giá
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-slate-500">
                    Chưa có đánh giá nào cho khóa học này.
                  </div>
                ) : (
                  reviews.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-gray-100 p-5"
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 text-slate-800 font-semibold">
                          <FiUser />
                          {item.userName}
                        </div>
                        <div className="flex items-center gap-1 text-orange-500">
                          {Array.from({ length: item.rating }).map((_, index) => (
                            <FiStar key={index} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 leading-7">
                        {item.comment || "Học viên chưa để lại nhận xét chi tiết."}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="sticky top-6">
            <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
              <div className="rounded-[22px] overflow-hidden mb-6">
                <img
                  src={course.introVideoThumbnail || course.image}
                  alt={course.title}
                  className="w-full h-56 object-cover"
                />
              </div>

              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-bold text-[#0F172A]">
                  {formatPrice(course.price)}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={handleEnrollCourse}
                  className="w-full rounded-2xl bg-[#002B5B] text-white py-3.5 font-semibold hover:opacity-90 transition"
                >
                  {isEnrolled ? "Tiếp tục học" : isFreeCourse ? "Đăng ký học" : "Thanh toán & đăng ký"}
                </button>

                <button
                  onClick={handleLearnNow}
                  className="w-full rounded-2xl border border-gray-200 py-3.5 font-semibold text-slate-700 hover:bg-gray-50 transition"
                >
                  Học ngay
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <FiClock />
                  <span>Thời lượng: {course.totalDuration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiPlayCircle />
                  <span>{course.totalLessons} bài học</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiMonitor />
                  <span>Học trên máy tính</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiSmartphone />
                  <span>Học trên điện thoại</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiCheckCircle />
                  <span>Truy cập trọn đời</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-white rounded-[30px] border border-gray-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Thanh toán khóa học
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Hoàn tất thông tin để đăng ký khóa học
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-50"
              >
                <FiX />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-0">
              <div className="p-6 border-r border-gray-100">
                <h4 className="font-bold text-slate-800 mb-4">Thông tin học viên</h4>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    value={paymentForm.fullName}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B]"
                  />

                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    value={paymentForm.phone}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B]"
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={paymentForm.email}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B]"
                  />

                  <textarea
                    rows={3}
                    placeholder="Ghi chú (không bắt buộc)"
                    value={paymentForm.note}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B]"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50">
                <div className="rounded-3xl bg-white border border-gray-100 p-5 mb-5">
                  <h4 className="font-bold text-slate-800 mb-3">
                    Thông tin đơn hàng
                  </h4>
                  <p className="text-slate-700 font-semibold leading-7">
                    {course.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Giảng viên: {course.instructor}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-slate-500">Tổng thanh toán</span>
                    <span className="text-2xl font-bold text-[#002B5B]">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod("momo")}
                    className={`w-full rounded-2xl border px-4 py-3 flex items-center gap-3 text-left ${paymentMethod === "momo"
                      ? "border-[#002B5B] bg-blue-50"
                      : "border-gray-200 bg-white"
                      }`}
                  >
                    <FiCreditCard className="text-[#002B5B]" />
                    <div>
                      <div className="font-semibold text-slate-800">Ví MoMo</div>
                      <div className="text-sm text-slate-500">
                        Phương thức đề xuất
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("banking")}
                    className={`w-full rounded-2xl border px-4 py-3 flex items-center gap-3 text-left ${paymentMethod === "banking"
                      ? "border-[#002B5B] bg-blue-50"
                      : "border-gray-200 bg-white"
                      }`}
                  >
                    <FiCreditCard className="text-[#002B5B]" />
                    <div>
                      <div className="font-semibold text-slate-800">
                        Chuyển khoản ngân hàng
                      </div>
                      <div className="text-sm text-slate-500">
                        Giả lập thanh toán thành công
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessingPayment}
                  className="w-full rounded-2xl bg-[#002B5B] text-white py-3.5 font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {isProcessingPayment ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseDetail;