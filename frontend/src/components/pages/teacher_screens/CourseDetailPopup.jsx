import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiChevronDown, FiClock, FiMonitor, FiPlayCircle, FiSmartphone, FiStar, FiUser, FiX, FiLayers } from "react-icons/fi";
import { courseService } from "../../../services/courseService";

const CourseDetailPopup = ({ id, onClose }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openChapters, setOpenChapters] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseService.getCourseById(id);
        setCourse(data);
        const initialState = {};
        data.chapters?.forEach((chapter, index) => {
          initialState[chapter.id] = index === 0; // Tự động mở chương đầu
        });
        setOpenChapters(initialState);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#021e4b]/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[85vh] overflow-hidden relative shadow-2xl flex flex-col animate-in zoom-in duration-300">
        
        {/* Header di động */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#021e4b]">
              <FiLayers size={20} />
            </div>
            <h2 className="font-bold text-slate-800 truncate max-w-md">Xem trước: {course.title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">
            
            <div className="space-y-10">
              <section>
                <div className="flex gap-2 mb-3">
                  <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">{course.category}</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4">{course.title}</h1>
                <p className="text-slate-500 leading-relaxed italic text-sm border-l-4 border-blue-100 pl-4">
                  "{course.description}"
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-600 rounded-full"></span> Cấu trúc bài giảng
                </h3>
                <div className="space-y-3">
                  {course.chapters?.map((chapter, index) => (
                    <div key={chapter.id} className="rounded-2xl border border-slate-100 overflow-hidden">
                      <button 
                        onClick={() => setOpenChapters(p => ({...p, [chapter.id]: !p[chapter.id]}))}
                        className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-all"
                      >
                        <span className="font-bold text-slate-700 text-sm">Chương {index + 1}: {chapter.title}</span>
                        <FiChevronDown className={`transition-transform ${openChapters[chapter.id] ? "rotate-180" : ""}`} />
                      </button>
                      {openChapters[chapter.id] && (
                        <div className="px-5 py-2 divide-y divide-slate-50">
                          {chapter.lessons?.map((lesson, idx) => (
                            <div key={lesson.id} className="py-3 flex items-center justify-between text-xs text-slate-600">
                              <span className="flex items-center gap-2"><FiPlayCircle size={14} className="text-blue-500"/> {idx+1}. {lesson.title}</span>
                              <span className="font-mono">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
                <img src={course.image} className="w-full h-40 object-cover rounded-2xl mb-6 shadow-sm" alt="Thumbnail" />
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
                    <FiUser className="mx-auto mb-1 text-blue-600" size={16} />
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Học viên</p>
                    <p className="font-black text-slate-800 text-lg">{course.students || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
                    <FiStar className="mx-auto mb-1 text-orange-400" size={16} />
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Đánh giá</p>
                    <p className="font-black text-slate-800 text-lg">{course.rating || "5.0"}</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs font-medium text-slate-500 px-2">
                  <div className="flex items-center gap-3"><FiClock className="text-blue-600"/> Tổng thời lượng: {course.totalDuration}</div>
                  <div className="flex items-center gap-3"><FiMonitor className="text-blue-600"/> Tương thích đa nền tảng</div>
                </div>
              </div>
              <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all">
                Đóng bản xem trước
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPopup;