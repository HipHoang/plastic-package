import { getCurrentUser } from "../untils/auth";

const KEY = "courseQA";

const getAllQuestions = () => {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
};

const saveAllQuestions = (data) => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const qaService = {
  getCourseQuestions(courseId) {
    const all = getAllQuestions();
    return all[courseId] || [];
  },

  askQuestion(courseId, question) {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("USER_NOT_LOGGED_IN");

    const all = getAllQuestions();
    const courseQuestions = all[courseId] || [];

    const newQuestion = {
      id: Date.now(),
      courseId: Number(courseId),
      userId: currentUser.id,
      userName: currentUser.name,
      question: question.trim(),
      answer: null,
      createdAt: new Date().toISOString(),
    };

    all[courseId] = [newQuestion, ...courseQuestions];
    saveAllQuestions(all);

    return newQuestion;
  },

  answerQuestion(courseId, questionId, answer) {
    const currentUser = getCurrentUser();
    const all = getAllQuestions();
    const courseQuestions = all[courseId] || [];

    all[courseId] = courseQuestions.map((item) =>
      Number(item.id) === Number(questionId)
        ? {
            ...item,
            answer: {
              text: answer.trim(),
              answeredBy: currentUser?.name || "Giảng viên",
              answeredAt: new Date().toISOString(),
            },
          }
        : item
    );

    saveAllQuestions(all);
  },
};