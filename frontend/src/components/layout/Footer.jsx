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

          {/* THÔNG TIN CÔNG TY */}
          <div className="xl:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-xl font-black text-white">
                  A
                </span>
              </div>

              <div className="leading-tight">
                <h2 className="text-2xl font-extrabold text-white">
                  ASIAPP
                </h2>

                <p className="text-sm text-slate-300">
                  Plastic Packaging
                </p>
              </div>
            </div>

            <p className="text-slate-300 leading-7 mb-5 max-w-md">
              ASIAPP chuyên cung cấp các sản phẩm bao bì nhựa
              chất lượng cao, đáp ứng nhu cầu đóng gói cho nhiều
              lĩnh vực sản xuất, thương mại và công nghiệp.
            </p>

            <div className="space-y-3 text-slate-300">
              <div className="flex items-start gap-3">
                <FiPhone className="mt-1 text-blue-400" />

                <a
                  href="tel:02873008899"
                  className="hover:text-white transition"
                >
                  Hotline: 028 7300 8899
                </a>
              </div>

              <div className="flex items-start gap-3">
                <FiMail className="mt-1 text-blue-400" />

                <a
                  href="mailto:info@asiapp.com"
                  className="hover:text-white transition"
                >
                  Email: info@asiapp.com
                </a>
              </div>

              <div className="flex items-start gap-3">
                <FiMapPin className="mt-1 text-blue-400 shrink-0" />

                <span>
                  Website: asiapp.com
                </span>
              </div>
            </div>
          </div>

          {/* VỀ ASIAPP */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              Về ASIAPP
            </h3>

            <ul className="space-y-3 text-slate-300">
              <li>
                <a
                  href="/"
                  className="hover:text-blue-400 transition"
                >
                  Giới thiệu công ty
                </a>
              </li>

              <li>
                <a
                  href="/products"
                  className="hover:text-blue-400 transition"
                >
                  Sản phẩm
                </a>
              </li>

              <li>
                <a
                  href="/products"
                  className="hover:text-blue-400 transition"
                >
                  Danh mục sản phẩm
                </a>
              </li>

              <li>
                <a
                  href="/"
                  className="hover:text-blue-400 transition"
                >
                  Tin tức
                </a>
              </li>
            </ul>
          </div>

          {/* SẢN PHẨM */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              Sản phẩm bao bì
            </h3>

            <ul className="space-y-3 text-slate-300">
              <li>
                <a
                  href="/products?q=PE"
                  className="hover:text-blue-400 transition"
                >
                  Túi PE
                </a>
              </li>

              <li>
                <a
                  href="/products?q=PP"
                  className="hover:text-blue-400 transition"
                >
                  Túi PP
                </a>
              </li>

              <li>
                <a
                  href="/products?q=HDPE"
                  className="hover:text-blue-400 transition"
                >
                  Túi HDPE
                </a>
              </li>

              <li>
                <a
                  href="/products?q=rác"
                  className="hover:text-blue-400 transition"
                >
                  Túi rác
                </a>
              </li>
            </ul>
          </div>

          {/* HỖ TRỢ */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              Hỗ trợ khách hàng
            </h3>

            <ul className="space-y-3 text-slate-300">
              <li>
                <a
                  href="tel:02873008899"
                  className="hover:text-blue-400 transition"
                >
                  Liên hệ tư vấn
                </a>
              </li>

              <li>
                <a
                  href="/settings"
                  className="hover:text-blue-400 transition"
                >
                  Thông tin tài khoản
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition"
                >
                  Chính sách bảo mật
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition"
                >
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 text-center md:text-left">
            © 2026 ASIAPP. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="YouTube"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center transition"
            >
              <FiYoutube size={18} />
            </a>

            <a
              href="#"
              aria-label="Facebook"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-blue-500 flex items-center justify-center transition"
            >
              <FiFacebook size={18} />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-pink-500 flex items-center justify-center transition"
            >
              <FiInstagram size={18} />
            </a>

            <a
              href="#"
              aria-label="TikTok"
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