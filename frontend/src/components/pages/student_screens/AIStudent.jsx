import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiSparkles } from "react-icons/hi2";
import { FiArrowRight } from "react-icons/fi";
import { aiService } from '../../../services/aiService';

const mockAISuggestions = []; // Fallback

const AIStudent = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState(mockAISuggestions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await aiService.getRecommendations();
        setSuggestions(data);
      } catch (err) {
        console.error('AI Recommendations error:', err);
        setError('Failed to load recommendations');
        setSuggestions(mockAISuggestions);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-[28px] border border-gray-100 p-8 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#0047AB] font-bold">
              <HiSparkles size={24} />
              <span className="uppercase tracking-wider text-sm">AI Recommendation</span>
            </div>
            <h1 className="text-3xl font-bold text-[#021e4b]">Đề xuất cho riêng bạn</h1>
          </div>
        </div>
        <div className="text-center py-12 text-slate-500">Đang tải đề xuất AI...</div>
      </div>
    );
  }

  if (error || !suggestions.length) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-[28px] border border-gray-100 p-8 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#0047AB] font-bold">
              <HiSparkles size={24} />
              <span className="uppercase tracking-wider text-sm">AI Recommendation</span>
            </div>
            <h1 className="text-3xl font-bold text-[#021e4b]">Đề xuất cho riêng bạn</h1>
          </div>
        </div>
        <div className="text-center py-12 text-slate-500">Chưa có đề xuất phù hợp.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white rounded-[28px] border border-gray-100 p-8 shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#0047AB] font-bold">
            <HiSparkles size={24} />
            <span className="uppercase tracking-wider text-sm">AI Recommendation</span>
          </div>
          <h1 className="text-3xl font-bold text-[#021e4b]">Đề xuất cho riêng bạn</h1>
          <p className="text-slate-500">Hệ thống AI phân tích kỹ năng và mục tiêu để gợi ý lộ trình tối ưu nhất.</p>
        </div>
      </div>

      {/* Grid Danh sách gợi ý */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((item) => (
          <div key={item.id} className="group bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[#021e4b] text-xs font-bold shadow-sm">
                {item.matchPercentage}% Tương thích
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">{item.level}</span>
                <h3 className="text-xl font-bold text-[#021e4b] mt-1">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">Giảng viên: {item.instructor}</p>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "{item.reason}"
                </p>
              </div>

              <button 
                onClick={() => navigate(`/courses/${item.courseId}`)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#021e4b] text-white rounded-2xl font-semibold hover:bg-[#0047AB] transition-colors"
              >
                Xem chi tiết khóa học
                <FiArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIStudent;

