import apiClient from "../untils/auth";

export const lessonService = {
  /**
   * Get all lessons for a course
   * GET /api/lessons/course/<course_id>
   */
  async getLessonsByCourse(courseId) {
    try {
      const res = await apiClient.get(`/lessons/course/${courseId}`);
      return res.data?.data || [];
    } catch (error) {
      console.error("getLessonsByCourse ERROR:", error.response?.data || error);
      return [];
    }
  },

  /**
   * Get a single lesson
   * GET /api/lessons/<lesson_id>
   */
  async getLesson(lessonId) {
    try {
      const res = await apiClient.get(`/lessons/${lessonId}`);
      return res.data?.data || null;
    } catch (error) {
      console.error("getLesson ERROR:", error.response?.data || error);
      return null;
    }
  },

  /**
   * Create a new lesson (teacher only)
   * POST /api/lessons/create
   */
  async createLesson(data) {
    try {
      const res = await apiClient.post("/lessons/create", data);
      return res.data?.data || null;
    } catch (error) {
      console.error("createLesson ERROR:", error.response?.data || error);
      throw error;
    }
  },

  /**
   * Update a lesson (teacher only)
   * PUT /api/lessons/<lesson_id>
   */
  async updateLesson(lessonId, data) {
    try {
      const res = await apiClient.put(`/lessons/${lessonId}`, data);
      return res.data?.data || null;
    } catch (error) {
      console.error("updateLesson ERROR:", error.response?.data || error);
      throw error;
    }
  },

  /**
   * Delete a lesson (teacher only)
   * DELETE /api/lessons/<lesson_id>
   */
  async deleteLesson(lessonId) {
    try {
      await apiClient.delete(`/lessons/${lessonId}`);
      return true;
    } catch (error) {
      console.error("deleteLesson ERROR:", error.response?.data || error);
      return false;
    }
  },

  /**
   * Get course detail with lessons
   * GET /api/courses/<course_id>/detail-with-lessons
   */
  async getCourseDetailWithLessons(courseId) {
    try {
      const res = await apiClient.get(`/courses/${courseId}/detail-with-lessons`);
      return res.data?.data || { course: null, lessons: [] };
    } catch (error) {
     console.error("getCourseDetailWithLessons ERROR:", error.response?.data || error);
    return { course: null, lessons: [] };
  }
},

/**
 * Upload file to lesson (teacher)
 * POST /api/lessons/<lesson_id>/upload
 */
async uploadLessonFile(lessonId, file, field) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('field', field);
  try {
    const res = await apiClient.post(`/lessons/${lessonId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error("uploadLessonFile ERROR:", error.response?.data || error);
    throw error;
  }
},

/**
 * Get quiz for lesson (student)
 * GET /api/lessons/<lesson_id>/quiz
 */
async getQuiz(lessonId) {
  try {
    const res = await apiClient.get(`/lessons/${lessonId}/quiz`);
    return res.data?.data || null;
  } catch (error) {
    console.error("getQuiz ERROR:", error.response?.data || error);
    return null;
  }
},

/**
 * Create quiz for lesson (teacher)
 * POST /api/lessons/<lesson_id>/quiz
 */
async createQuiz(lessonId, data) {
  try {
    const res = await apiClient.post(`/lessons/${lessonId}/quiz`, data);
    return res.data;
  } catch (error) {
    console.error("createQuiz ERROR:", error.response?.data || error);
    throw error;
  }
},

/**
 * Submit quiz answers (student)
 * POST /api/lessons/<lesson_id>/quiz/submit
 */
async submitQuiz(lessonId, answers) {
  try {
    const res = await apiClient.post(`/lessons/${lessonId}/quiz/submit`, {
      answers
    });
    return res.data?.data;
  } catch (error) {
    console.error("submitQuiz ERROR:", error.response?.data || error);
    throw error;
  }
}
};
