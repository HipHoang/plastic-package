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
  getCourseQuestions(productId) {
    const all = getAllQuestions();
    return all[productId] || [];
  },

  askQuestion(productId, question) {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("USER_NOT_LOGGED_IN");

    const all = getAllQuestions();
    const courseQuestions = all[productId] || [];

    const newQuestion = {
      id: Date.now(),
      productId: Number(productId),
      userId: currentUser.id,
      userName: currentUser.name,
      question: question.trim(),
      answer: null,
      createdAt: new Date().toISOString(),
    };

    all[productId] = [newQuestion, ...courseQuestions];
    saveAllQuestions(all);

    return newQuestion;
  },

  answerQuestion(productId, questionId, answer) {
    const currentUser = getCurrentUser();
    const all = getAllQuestions();
    const courseQuestions = all[productId] || [];

    all[productId] = courseQuestions.map((item) =>
      Number(item.id) === Number(questionId)
        ? {
            ...item,
            answer: {
              text: answer.trim(),
              answeredBy: currentUser?.name || "Nhân viên",
              answeredAt: new Date().toISOString(),
            },
          }
        : item
    );

    saveAllQuestions(all);
  },
};