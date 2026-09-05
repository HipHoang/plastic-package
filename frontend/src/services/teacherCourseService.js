import apiClient from "../untils/auth";

export const teacherCourseService = {
  async getTeacherCourses() {
    try {
      const res = await apiClient.get("/courses/instructor");
      return res.data?.data || [];
    } catch (error) {
      console.error("getTeacherCourses ERROR:", error.response?.data || error);
      throw error;
    }
  },

  async getTeacherStats() {
    try {
      const res = await apiClient.get("/courses/instructor/stats");
      return res.data?.data || null;
    } catch (error) {
      console.error("getTeacherStats ERROR:", error.response?.data || error);
      throw error;
    }
  },
};

