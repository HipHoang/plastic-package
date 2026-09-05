import React, { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiChevronDown,
  FiFileText,
  FiHelpCircle,
  FiLock,
  FiPlayCircle,
  FiSend,
} from "react-icons/fi";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { courseService } from "../../../services/courseService";
import { lessonService } from "../../../services/lessonService";
import { qaService } from "../../../services/qaService";
import { getCurrentUser } from "../../../untils/auth";
import { enrollmentService } from "../../../services/enrollmentService";

const LearningPage = () => {
  const { id: courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [openChapters, setOpenChapters] = useState({});
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);

        // Get course detail with lessons
        const data = await lessonService.getCourseDetailWithLessons(courseId);

        if (!data.course) {
          // Fallback to regular course detail
          const courseData = await courseService.getCourseById(courseId);
          setCourse(courseData);
          setLessons(courseData.chapters?.flatMap(ch => ch.lessons || []) || []);
        } else {
          setCourse(data.course);
          setLessons(data.lessons || []);
        }

        // Check enrollment
        const isEnrolled = await enrollmentService.checkEnrollment(courseId);
        if (!isEnrolled) {
          alert("Bạn chưa đăng ký khóa học này");
          navigate(`/courses/${courseId}`);
          return;
        }

        // Get progress
        const progressData = await enrollmentService.getLearningProgress(courseId);
        setEnrolledCourse(progressData);

        // Get current lesson from URL query param
        const lessonIdFromUrl = searchParams.get('lesson');

        // Open first chapter by default
        const initialState = {};
        if (lessons.length > 0) {
          initialState[0] = true; // First "chapter" is just all lessons
        }
        setOpenChapters(initialState);

        // Set current lesson
        let foundLesson = null;
        if (lessonIdFromUrl) {
          foundLesson = lessons.find(l => l.lesson_id === parseInt(lessonIdFromUrl));
        }

        setCurrentLesson(foundLesson || lessons[0] || null);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate, searchParams]);

  useEffect(() => {
    const loadQuiz = async () => {
      if (currentLesson?.quiz) {
        const fullQuiz = await lessonService.getQuiz(currentLesson.lesson_id);
        setQuiz(fullQuiz);
      } else {
        setQuiz(null);
        setQuizAnswers({});
        setQuizResult(null);
        setQuizSubmitted(false);
      }
    };
    loadQuiz();
  }, [currentLesson]);

  const handleSelectLesson = (lesson) => {
    setCurrentLesson(lesson);
    setSearchParams({
      lesson: lesson.lesson_id.toString()
    });
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson) return;

    try {
      await enrollmentService.updateProgress({
        courseId: courseId,
        lessonId: currentLesson.lesson_id,
      });

      const progressData = await enrollmentService.getLearningProgress(courseId);
      setEnrolledCourse(progressData);

      const completedLessons = progressData?.completedLessons || 0;

      alert(
        completedLessons >= lessons.length ?
          "Chúc mừng! Bạn đã hoàn thành khóa học." :
          "Đã hoàn thành bài học. Bài tiếp theo đã được mở khóa!"
      );
    } catch (error) {
      console.error(error);
      alert("Không thể cập nhật tiến độ.");
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || Object.keys(quizAnswers).length < quiz.questions.length) {
      alert("Vui lòng trả lời tất cả câu hỏi.");
      return;
    }

    try {
      const result = await lessonService.submitQuiz(currentLesson.lesson_id, quizAnswers);
      setQuizResult(result);
      setQuizSubmitted(true);

      if (result.passed) {
        handleCompleteLesson();
      }
    } catch (error) {
      console.error("Submit quiz error:", error);
      alert("Lỗi nộp bài.");
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson || lessons.length === 0) return;

    const currentIndex = lessons.findIndex(l => l.lesson_id === currentLesson?.lesson_id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (!currentLesson || lessons.length === 0) return;

    const currentIndex = lessons.findIndex(l => l.lesson_id === currentLesson?.lesson_id);
    if (currentIndex > 0) {
      setCurrentLesson(lessons[currentIndex - 1]);
    }
  };

  const toggleChapter = (chapterIndex) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex],
    }));
  };

  const handleAskQuestion = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      alert("Bạn cần đăng nhập để đặt câu hỏi.");
      return;
    }

    if (!questionText.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi.");
      return;
    }

    try {
      qaService.askQuestion(courseId, questionText);
      setQuestionText("");
    } catch (error) {
      console.error(error);
      alert("Không thể gửi câu hỏi.");
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải bài học...</div>;
  }

  if (!course) {
    return <div className="p-6">Không tìm thấy khóa học.</div>;
  }

  const completedLessons = enrolledCourse?.completedLessons || 0;
  const totalLessons = lessons.length;

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-2 text-slate-700 font-medium"
          >
            <FiArrowLeft />
            Quay lại
          </button>

          <div className="text-sm text-slate-500">
            {completedLessons}/{totalLessons} bài đã hoàn thành
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-[#0b1220] flex items-center justify-center overflow-auto">
          <div className="w-full h-full flex items-center justify-center p-6">
            {currentLesson?.video_url ? (
              // Video player
              <div className="w-full max-w-4xl">
                <video
                  controls
                  className="w-full rounded-2xl"
                  src={currentLesson.video_url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : currentLesson?.document_url ? (
              // Document viewer (iframe for PDF)
              <iframe
                src={currentLesson.document_url}
                className="w-full h-[70vh] rounded-2xl"
                title={currentLesson.title}
              />
            ) : currentLesson?.content || currentLesson?.description ? (
              // Text content
              <div className="w-full max-w-4xl bg-white rounded-2xl p-8 text-slate-800">
                <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content || currentLesson.description }}
                />
              </div>
            ) : (
              // Placeholder - no content
              <div className="text-center text-white">
                <FiPlayCircle size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">Nội dung đang được cập nhật...</p>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Section */}
        {quiz && !quizSubmitted && (
          <div className="px-6 py-6 border-t border-gray-200 bg-linear-to-b from-white to-slate-50">
            <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              📝 Kiểm tra kiến thức
            </h3>
            <div className="space-y-6">
              {quiz.questions.map((q, qIdx) => (
                <div key={q.question_id} className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#0B5CFF] text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                      {qIdx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-800 mb-2">{q.content}</h4>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {q.answers.map((a, aIdx) => (
                      <label
                        key={a.answer_id}
                        className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                      >
                        <input
                          type="radio"
                          name={`q_${q.question_id}`}
                          value={aIdx}
                          checked={quizAnswers[q.question_id] == aIdx}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setQuizAnswers({
                                ...quizAnswers,
                                [q.question_id]: parseInt(e.target.value)
                              });
                            }
                          }}
                          className="mr-4 w-5 h-5 text-[#0B5CFF] border-gray-300 focus:ring-[#0B5CFF] rounded-full"
                        />
                        <span className="text-slate-800 font-medium">{a.content}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(quizAnswers).length < quiz.questions.length}
              className="mt-8 w-full bg-linear-to-r from-[#0B5CFF] to-[#1e40af] text-white py-4 rounded-2xl font-bold text-lg hover:from-[#1e40af] hover:to-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              Nộp bài kiểm tra
            </button>
          </div>
        )}

        {quizResult && (
          <div className="px-6 py-8 border-t border-gray-200 bg-linear-to-r from-green-50 to-emerald-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <FiCheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-green-800 mb-4">
                {Math.round(quizResult.score * 100)}%
              </h3>
              <p className="text-xl font-semibold text-slate-700 mb-6">
                {quizResult.passed ? 'Xuất sắc! Bài học hoàn thành.' : 'Cần học lại một số phần.'}
              </p>
              {quizResult.passed && (
                <button
                  onClick={handleCompleteLesson}
                  className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg"
                >
                  Hoàn thành bài học
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button
            onClick={handlePrevLesson}
            className="px-5 py-3 rounded-full border border-gray-200 text-slate-500 font-semibold hover:bg-gray-50"
          >
            Bài trước
          </button>

          <div className="text-center">
            <h2 className="font-bold text-lg text-slate-800">{currentLesson?.title}</h2>
            <p className="text-sm text-slate-500">Bài {completedLessons + 1} / {totalLessons}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCompleteLesson}
              className="px-5 py-3 rounded-full border border-green-200 bg-green-50 text-green-700 font-semibold hover:bg-green-100"
            >
              Hoàn thành bài
            </button>

            <button
              onClick={handleNextLesson}
              className="px-5 py-3 rounded-full bg-[#0B5CFF] text-white font-semibold hover:bg-blue-700"
            >
              Bài tiếp theo
            </button>
          </div>
        </div>
      </div>

      {/* Lesson List Sidebar */}
      <div className="w-96 bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-2xl font-bold text-slate-800">Nội dung khóa học</h3>
          <p className="text-sm text-slate-500">{course?.title}</p>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="rounded-2xl border border-gray-100 p-4 bg-slate-50">
            <div className="font-semibold text-slate-800">Tiến độ học tập</div>
            <p className="text-sm text-slate-500">
              Hoàn thành bài hiện tại để mở khóa bài tiếp theo
            </p>
            <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-[#002B5B]"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((completedLessons / Math.max(totalLessons, 1)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {lessons.map((lesson, index) => (
              <button
                key={lesson.lesson_id}
                onClick={() => handleSelectLesson(lesson)}
                className={`w-full text-left px-4 py-4 flex items-center justify-between hover:bg-blue-50 ${currentLesson?.lesson_id === lesson.lesson_id ? "bg-orange-50" : ""
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${index < completedLessons ? 'text-green-600' : 'text-[#ff6b2c]'}`}>
                    {index < completedLessons ? <FiCheckCircle /> : <FiPlayCircle />}
                  </div>
                  <div>
                    <p className="text-slate-800 font-medium">
                      {index + 1}. {lesson.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {lesson.video_url ? 'Video' : lesson.document_url ? 'Tài liệu' : 'Văn bản'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* QA Section */}
        <div className="border-t border-gray-100 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 font-medium text-slate-700 hover:bg-gray-50">
              <FiFileText />
              Ghi chú
            </button>
            <button className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 font-medium text-slate-700 hover:bg-gray-50">
              <FiHelpCircle />
              Hỏi đáp
            </button>
          </div>

          <div className="rounded-2xl border border-gray-100 p-4">
            <div className="font-semibold text-slate-800 mb-3">Đặt câu hỏi</div>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Nhập câu hỏi của bạn về bài học hoặc khóa học..."
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#002B5B]"
            />
            <button
              onClick={handleAskQuestion}
              className="mt-3 w-full rounded-2xl bg-[#002B5B] text-white py-3 font-semibold flex items-center justify-center gap-2"
            >
              <FiSend />
              Gửi câu hỏi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
