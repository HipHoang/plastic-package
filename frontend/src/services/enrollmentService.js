import apiClient from "../untils/auth";

/**
 * enrollmentService - phiên bản dùng API (KHÔNG dùng localStorage)
 * Tất cả request đều đi qua API (axios instance đã gắn JWT token)
 */
export const enrollmentService = {
    /**
     * ✅ Check user đã enroll khóa học chưa
     * GET /api/courses/{courseId}/check-enrollment
     */
    async checkEnrollment(courseId) {
        try {
            const res = await apiClient.get(`/courses/${courseId}/check-enrollment`);

            return (
                res.data?.data?.isEnrolled === true ||
                res.data?.is_enrolled === true
            );
        } catch (error) {
            console.error("checkEnrollment ERROR:", error.response?.data || error);
            return false;
        }
    },

    /**
     * ✅ Enroll khóa học
     * POST /api/courses/enroll
     */
    async enrollCourse(courseId) {
        try {
            const res = await apiClient.post(`/courses/enroll`, {
                course_id: courseId,
            });

            return res.data;
        } catch (error) {
            console.error("enrollCourse ERROR:", error.response?.data || error);
            throw error;
        }
    },

    /**
     * ✅ Lấy danh sách khóa học đã đăng ký
     * GET /api/courses/my-courses
     */
    async getMyCourses() {
        try {
            const res = await apiClient.get(`/courses/my-courses`);

            const courses = res.data?.data || [];

            // 🔥 Normalize để KHÔNG phá HomeStudent
            return courses.map((item) => ({
                courseId: item.course_id,
                title: item.title || "",
                image: item.image || "",
                instructor: item.instructor || "",
                progress: Number(item.progress || 0),
                status:
                    Number(item.progress) >= 100 ? "Hoàn thành" : "Đang học",
            }));
        } catch (error) {
            console.error("getMyCourses ERROR:", error.response?.data || error);
            return [];
        }
    },

    /**
     * ✅ Lấy tiến độ học của 1 khóa
     * GET /api/courses/progress/{courseId}
     */
    async getLearningProgress(courseId) {
        try {
            const res = await apiClient.get(`/courses/progress/${courseId}`);

            return {
                progress: Number(res.data?.data?.progress || 0),
                completedLessons:
                    Number(res.data?.data?.completedLessons || 0),
                currentLessonId: res.data?.data?.currentLessonId || null,
            };
        } catch (error) {
            console.error(
                "getLearningProgress ERROR:",
                error.response?.data || error
            );
            return {
                progress: 0,
                completedLessons: 0,
                currentLessonId: null,
            };
        }
    },
};
