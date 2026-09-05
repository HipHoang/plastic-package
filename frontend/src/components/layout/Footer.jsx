import React from "react";
import {
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#021e4b] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-10">
          {/* Cột 1: Logo + thông tin */}
          <div className="xl:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.2 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55zM12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
                </svg>
              </div>

              <div className="leading-tight">
                <h2 className="text-2xl font-extrabold text-white">OU Education</h2>
                <p className="text-sm text-slate-300">
                  Nền tảng học tập trực tuyến hiện đại
                </p>
              </div>
            </div>

            <p className="text-slate-300 leading-7 mb-5 max-w-md">
              OU Education mang đến môi trường học tập trực tuyến tiện lợi, giúp
              học viên tiếp cận khóa học chất lượng, theo dõi lộ trình học và phát
              triển kỹ năng hiệu quả hơn mỗi ngày.
            </p>

            <div className="space-y-3 text-slate-300">
              <div className="flex items-start gap-3">
                <FiPhone className="mt-1 text-blue-400" />
                <span>Hotline: 1900 1234</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="mt-1 text-blue-400" />
                <span>Email: support@oueducation.vn</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-1 text-blue-400" />
                <span>
                  Địa chỉ: 97 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh
                </span>
              </div>
            </div>
          </div>

          {/* Cột 2 */}
          <div>
            <h3 className="text-lg font-bold mb-4">Về OU Education</h3>
            <ul className="space-y-3 text-slate-300">
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Khóa học nổi bật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Giảng viên
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Lộ trình học
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3 */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hỗ trợ</h3>
            <ul className="space-y-3 text-slate-300">
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Trung tâm hỗ trợ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4 */}
          <div>
            <h3 className="text-lg font-bold mb-4">Dành cho học viên</h3>
            <ul className="space-y-3 text-slate-300">
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Đăng ký học
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Theo dõi tiến độ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Chứng chỉ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Liên hệ tư vấn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 text-center md:text-left">
            © 2026 OU Education. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center transition"
            >
              <FiYoutube size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-blue-500 flex items-center justify-center transition"
            >
              <FiFacebook size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-pink-500 flex items-center justify-center transition"
            >
              <FiInstagram size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-slate-700 flex items-center justify-center transition"
            >
              <FaTiktok size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;