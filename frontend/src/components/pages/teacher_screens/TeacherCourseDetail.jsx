import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiPlay, FiFileText, FiEdit, FiTrash2, FiSave, FiX, FiChevronDown, FiExternalLink } from "react-icons/fi";
import { courseService } from "../../../services/courseService";
import { lessonService } from "../../../services/lessonService";
import { getCurrentUser } from "../../../untils/auth";

// Helper functions
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/shorts\/([^&?/]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

const getEmbedUrl = (url) => {
  if (!url) return null;
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;
  if (url.match(/\.(mp4|webm|mov|avi)(\?|$)/i)) return url;
  return null;
};

const TeacherCourseDetail = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Forms
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "", description: "", content: "", video_url: "", order_index: 0
  });

  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editLesson, setEditLesson] = useState({});

  // Quiz form
  const [showQuizForm, setShowQuizForm] = useState(null); // lesson_id
  const [quizForm, setQuizForm] = useState({
    title: '',
    questions: [{ content: '', options: ['', '', '', ''], correct_idx: 0 }]
  });

  // States
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const currentUser = getCurrentUser();
  const isTeacher = currentUser?.role === "teacher" || currentUser?.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await lessonService.getCourseDetailWithLessons(courseId);
        if (!data.course) {
          setError("Không tìm thấy khóa học");
          return;
        }
        setCourse(data.course);
        setLessons(data.lessons || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleAddLesson = async () => {
    if (!newLesson.title.trim()) return alert("Vui lòng nhập tên bài học");
    try {
      const createdLesson = await lessonService.createLesson({
        course_id: parseInt(courseId), ...newLesson
      });
      if (createdLesson) {
        setLessons([...lessons, createdLesson]);
        setShowAddLesson(false);
        setNewLesson({ title: "", description: "", content: "", video_url: "", order_index: 0 });
        alert("Thêm bài học thành công!");
      }
    } catch (err) {
      alert("Lỗi khi thêm bài học");
    }
  };

  const handleUpdateLesson = async (lessonId) => {
    try {
      const updated = await lessonService.updateLesson(lessonId, editLesson);
      if (updated) {
        setLessons(lessons.map(l => l.lesson_id === lessonId ? { ...l, ...updated } : l));
        setEditingLessonId(null);
        setEditLesson({});
        alert("Cập nhật bài học thành công!");
      }
    } catch (err) {
      alert("Lỗi khi cập nhật bài học");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Xóa bài học?")) return;
    try {
      if (await lessonService.deleteLesson(lessonId)) {
        setLessons(lessons.filter(l => l.lesson_id !== lessonId));
        alert("Xóa thành công!");
      }
    } catch (err) {
      alert("Lỗi xóa bài học");
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

  const uploadFile = async (lessonId, file, field) => {
    setUploading(true);
    try {
      const result = await lessonService.uploadLessonFile(lessonId, file, field);
      const lessonsCopy = [...lessons];
      const lessonIdx = lessonsCopy.findIndex(l => l.lesson_id === lessonId);
      lessonsCopy[lessonIdx][field + '_url'] = result.url;
      setLessons(lessonsCopy);
      alert(`${field === 'video' ? 'Video' : 'Document'} uploaded!`);
    } catch {
      alert('Upload failed');
    }
    setUploading(false);
  };

  const handleCreateQuiz = async (lessonId) => {
    try {
      await lessonService.createQuiz(lessonId, quizForm);
      alert('Quiz created!');
      setShowQuizForm(null);
      const data = await lessonService.getCourseDetailWithLessons(courseId);
      setLessons(data.lessons);
    } catch {
      alert('Create quiz failed');
    }
  };

  const addQuizQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, { content: '', options: ['', '', '', ''], correct_idx: 0 }]
    });
  };

  const toggleLessonExpand = (lessonId) => {
    setExpandedLessonId(expandedLessonId === lesson.lesson_id ? null : lessonId);
  };

  const cancelEdit = () => {
    setEditingLessonId(null);
    setEditLesson({});
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B5CFF]" /></div>;
  if (error || !course) return (
    <div className="text-center py-10">
      <p className="text-red-500">{error || "Không tìm thấy khóa học"}</p>
      <button onClick={() => navigate("/teacher/courses")} className="mt-4 px-5 py-2 bg-[#0B5CFF] text-white rounded-xl">
        Quay lại
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/teacher/courses")} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-slate-700 hover:bg-gray-50">
            <FiArrowLeft /> Quay lại
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{course.title}</h1>
            <p className="text-slate-500">Quản lý bài học</p>
          </div>
        </div>
        {isTeacher && <button onClick={() => setShowAddLesson(true)} className="flex items-center gap-2 px-5 py-3 bg-[#0B5CFF] text-white rounded-xl font-semibold hover:bg-blue-700">
          <FiPlus /> Thêm bài học
        </button>}
      </div>

      <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-slate-800 mb-2">Thông tin khóa học</h3>
            <p className="text-slate-600">{course.description || "Chưa có mô tả"}</p>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>Giá: {course.price === 0 ? "Miễn phí" : `${course.price} VNĐ`}</p>
            <p>Danh mục: {course.category || "Chưa phân loại"}</p>
            <p>Số bài học: {lessons.length}</p>
          </div>
        </div>
      </div>

      {showAddLesson && (
        <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Thêm bài học mới</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên bài học *</label>
              <input type="text" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B5CFF]" placeholder="Nhập tên bài học" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
              <textarea value={newLesson.description} onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B5CFF]" rows={3} placeholder="Mô tả ngắn về bài học" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung chi tiết (HTML)</label>
              <textarea value={newLesson.content} onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B5CFF]" rows={5} placeholder="Nội dung bài học (hỗ trợ HTML)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Video</label>
                <input type="file" accept="video/*" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setUploading(true);
                    try {
                      const result = await lessonService.uploadLessonFile('temp', file, 'video');
                      setNewLesson({ ...newLesson, video_url: result.url });
                    } catch { }
                    setUploading(false);
                  }
                }} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#0B5CFF] file:text-white hover:file:bg-blue-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Tài liệu</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setUploading(true);
                    try {
                      const result = await lessonService.uploadLessonFile('temp', file, 'document');
                      setNewLesson({ ...newLesson, document_url: result.url });
                    } catch { }
                    setUploading(false);
                  }
                }} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAddLesson} className="flex items-center gap-2 px-5 py-3 bg-[#0B5CFF] text-white rounded-xl font-semibold hover:bg-blue-700">
                <FiSave /> Lưu
              </button>
              <button onClick={() => { setShowAddLesson(false); setNewLesson({ title: '', description: '', content: '', video_url: '', document_url: '', order_index: 0 }); }} className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-slate-700 rounded-xl font-semibold hover:bg-gray-50">
                <FiX /> Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Danh sách bài học ({lessons.length})</h3>
        {lessons.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Chưa có bài học nào</p>
            <p className="text-sm">Nhấn "Thêm bài học" để tạo bài học đầu tiên</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div key={lesson.lesson_id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                {editingLessonId === lesson.lesson_id ? (
                  <div className="space-y-3">
                    <input type="text" value={editLesson.title} onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-[#0B5CFF]" />
                    <textarea value={editLesson.description} onChange={(e) => setEditLesson({ ...editLesson, description: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-[#0B5CFF]" rows={2} />
                    <textarea value={editLesson.content} onChange={(e) => setEditLesson({ ...editLesson, content: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B5CFF]" rows={4} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="file" accept="video/*" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setUploading(true);
                          try {
                            const result = await lessonService.uploadLessonFile(lesson.lesson_id, file, 'video');
                            setEditLesson({ ...editLesson, video_url: result.url });
                          } catch { }
                          setUploading(false);
                        }
                      }} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#0B5CFF] file:text-white hover:file:bg-blue-700" />
                      <input type="file" accept=".pdf,.doc,.docx" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setUploading(true);
                          try {
                            const result = await lessonService.uploadLessonFile(lesson.lesson_id, file, 'document');
                            setEditLesson({ ...editLesson, document_url: result.url });
                          } catch { }
                          setUploading(false);
                        }
                      }} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleUpdateLesson(lesson.lesson_id)} className="flex-1 flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm">
                        <FiSave size={14} /> Lưu
                      </button>
                      <button onClick={cancelEdit} className="flex-1 flex items-center gap-1 px-3 py-2 border border-gray-200 text-slate-700 rounded-lg text-sm">
                        <FiX size={14} /> Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => toggleLessonExpand(lesson.lesson_id)} className={`rounded-xl border p-4 cursor-pointer transition-all hover:border-blue-300 ${expandedLessonId === lesson.lesson_id ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#0B5CFF] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">{lesson.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {lesson.video_url && '📹 Video | '}{lesson.document_url && '📄 Tài liệu | '}{lesson.quiz && '🧠 Quiz'}
                          </p>
                        </div>
                      </div>
                      <FiChevronDown className={`transition-transform duration-300 text-xl ${expandedLessonId === lesson.lesson_id ? "rotate-180" : ""} text-slate-400`} />
                    </div>
                    {expandedLessonId === lesson.lesson_id && (
                      <div className="space-y-4 pt-4">
                        {/* Video - FIRST */}
                        {getEmbedUrl(lesson.video_url) && (
                          <div className="space-y-3">
                            <h5 className="font-semibold text-lg text-slate-900 flex items-center gap-2">🎥 Video</h5>
                            <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
                              <iframe
                                src={getEmbedUrl(lesson.video_url)}
                                title={lesson.title}
                                className="w-full aspect-video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}

                        {/* Description - SECOND */}
                        {lesson.description && (
                          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h5 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">📝 Mô tả</h5>
                            <div className="text-slate-700 leading-relaxed prose max-h-32 overflow-y-auto">
                              {lesson.description}
                            </div>
                          </div>
                        )}

                        {/* Content - THIRD */}
                        {lesson.content && (
                          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                            <h5 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">📖 Nội dung bài học</h5>
                            <div className="prose prose-sm max-w-none max-h-64 overflow-y-auto">
                              <div className="whitespace-pre-wrap">
                                {lesson.content}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Download Links - FOURTH (if any URL exists) */}
                        {(lesson.video_url || lesson.document_url) && (
                          <div className="bg-linear-to-r from-emerald-50 to-blue-50 border border-emerald-100 rounded-2xl p-6">
                            <h5 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">🔗 Link tài liệu</h5>
                            <div className="space-y-3">
                              {lesson.video_url && (
                                <a
                                  href={lesson.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group"
                                >
                                  <FiPlay className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                  <div>
                                    <p className="font-medium text-slate-900">Video bài học</p>
                                    <p className="text-sm text-slate-500 truncate max-w-75">{lesson.video_url}</p>
                                  </div>
                                  <FiExternalLink className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
                                </a>
                              )}
                              {lesson.document_url && (
                                <a
                                  href={lesson.document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group"
                                >
                                  <FiFileText className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                                  <div>
                                    <p className="font-medium text-slate-900">Tài liệu</p>
                                    <p className="text-sm text-slate-500 truncate max-w-75">{lesson.document_url}</p>
                                  </div>
                                  <FiExternalLink className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quiz - FIFTH */}
                        <div>
                          <h5 className="font-semibold text-lg text-slate-900 mb-3 flex items-center gap-2">🧠 Quiz</h5>
                          {lesson.quiz ? (
                            <div className="bg-blue-50 p-4 rounded-xl border">
                              <p className="font-medium text-slate-800">{lesson.quiz.title}</p>
                              <p className="text-sm text-slate-500">{lesson.quiz.questions.length} câu hỏi</p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 italic">Chưa có quiz</p>
                          )}
                          <button onClick={() => setShowQuizForm(lesson.lesson_id)} className="mt-3 px-4 py-2 bg-[#0B5CFF] text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                            {lesson.quiz ? 'Sửa Quiz' : 'Tạo Quiz'}
                          </button>
                          {showQuizForm === lesson.lesson_id && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                              <input
                                value={quizForm.title}
                                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                placeholder="Tiêu đề Quiz"
                                className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-[#0B5CFF]"
                              />
                              {quizForm.questions.map((q, qIdx) => (
                                <div key={qIdx} className="mb-6 p-4 bg-white rounded-xl border">
                                  <input
                                    value={q.content}
                                    onChange={(e) => {
                                      const newQ = [...quizForm.questions];
                                      newQ[qIdx].content = e.target.value;
                                      setQuizForm({ ...quizForm, questions: newQ });
                                    }}
                                    placeholder={`Câu hỏi ${qIdx + 1}`}
                                    className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-[#0B5CFF]"
                                  />
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center mb-2">
                                      <input
                                        type="radio"
                                        id={`q${qIdx}opt${optIdx}`}
                                        checked={q.correct_idx === optIdx}
                                        onChange={() => {
                                          const newQ = [...quizForm.questions];
                                          newQ[qIdx].correct_idx = optIdx;
                                          setQuizForm({ ...quizForm, questions: newQ });
                                        }}
                                        className="mr-3"
                                      />
                                      <input
                                        value={opt}
                                        onChange={(e) => {
                                          const newQ = [...quizForm.questions];
                                          newQ[qIdx].options[optIdx] = e.target.value;
                                          setQuizForm({ ...quizForm, questions: newQ });
                                        }}
                                        placeholder={`Đáp án ${optIdx + 1}`}
                                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#0B5CFF]"
                                      />
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newQ = [...quizForm.questions];
                                      newQ.splice(qIdx, 1);
                                      setQuizForm({ ...quizForm, questions: newQ });
                                    }}
                                    className="text-red-500 text-sm hover:underline mt-2"
                                  >
                                    Xóa câu hỏi
                                  </button>
                                </div>
                              ))}
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuizForm({
                                      ...quizForm,
                                      questions: [...quizForm.questions, { content: '', options: ['', '', '', ''], correct_idx: 0 }]
                                    });
                                  }}
                                  className="px-4 py-2 bg-green Ascendant-500 text-white rounded-xl text-sm font-medium hover:bg-green-600"
                                >
                                  <FiPlus className="inline mr-1 -ml Ascendant-1" /> Câu hỏi mới
                                </button>
                                <button
                                  onClick={async () => handleCreateQuiz(lesson.lesson_id)}
                                  className="px-6 py Ascendant-2 bg-[#0B5CFF] text-white rounded-xl font-semibold hover:bg-blue Ascendant-700"
                                >
                                  Tạo Quiz
                                </button>
                                <button
                                  onClick={() => setShowQuizForm(null)}
                                  className=" Ascendant-6 py Ascendant-2 border text-slate Ascendant-700 rounded-xl font-semibold hover:bg-gray Ascendant-50"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions - bottom */}
                        {isTeacher && (
                          <div className="flex gap-3 pt-6 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditLesson(lesson);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                            >
                              <FiEdit className="w-4 h-4" />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLesson(lesson.lesson_id);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white font-semibold rounded-2xl hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Xóa bài học
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseDetail;
