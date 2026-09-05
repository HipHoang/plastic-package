import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FiCheck, FiLock, FiPlay } from "react-icons/fi";
import { HiMapPin } from "react-icons/hi2";
import { getMyLearningPathway } from "../../../services/pathwayService";

const PathwayStudent = () => {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPathway = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyLearningPathway();
        setMilestones(data);
      } catch (err) {
        console.error('Failed to fetch pathway:', err);
        setError(err);
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPathway();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-blue-50 text-[#0047AB] rounded-2xl">
            <HiMapPin size={32} />
          </div>
        </div>
        <div className="text-center py-12 text-slate-500">Loading your learning pathway...</div>
      </div>
    );
  }

  if (error || milestones.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-blue-50 text-[#0047AB] rounded-2xl">
            <HiMapPin size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#021e4b]">Lộ trình học tập của tôi</h1>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center space-y-6">
          <div className="space-y-2">
            <p className="text-slate-600 text-lg font-medium">
              Bạn chưa có khóa học, vui lòng đăng ký khóa học để có lộ trình
            </p>
            <p className="text-slate-500 text-sm">
              Hãy khám phá các khóa học hiện có và bắt đầu hành trình học tập của bạn!
            </p>
          </div>
          <button
            onClick={() => navigate("/all-courses")}
            className="inline-flex items-center gap-2 bg-[#0047AB] hover:bg-[#003380] text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <FiPlay />
            Khám phá khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-blue-50 text-[#0047AB] rounded-2xl">
          <HiMapPin size={32} />
        </div>
        <h1 className="text-3xl font-bold text-[#021e4b]">Lộ trình học tập của tôi</h1>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {milestones.map((m, idx) => (
          <div key={m.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${m.status === 'locked' ? 'opacity-60' : ''}`}>
            {/* Icon mốc thời gian */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 
              ${m.status === 'completed' ? 'bg-green-500 text-white' : m.status === 'current' ? 'bg-[#0047AB] text-white animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
              {m.status === 'completed' ? <FiCheck /> : m.status === 'current' ? <FiPlay /> : <FiLock />}
            </div>

            {/* Nội dung Card */}
            <div className="w-[calc(100%-4rem)] md:w-[45%] bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <time className="font-bold text-[#021e4b]">Bước {idx + 1}</time>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${m.status === 'completed' ? 'bg-green-100 text-green-700' : m.status === 'current' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  {m.status}
                </span>
              </div>
              <div className="text-slate-800 font-bold text-lg mb-1">{m.title}</div>
              <p className="text-slate-500 text-sm leading-relaxed">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PathwayStudent;
