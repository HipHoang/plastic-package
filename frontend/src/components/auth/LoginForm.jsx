import React, { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { loginApi, loginGoogleApi } from "../../services/authService"; //[cite: 1]
import { setStoredAuth, isTeacherRole } from "../../untils/auth"; //[cite: 3]
import { useAuth } from "../../context/AuthProvider"; //[cite: 6]

const LoginForm = ({ onSwitchType }) => {
  const { setUser } = useAuth(); //[cite: 6]
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Kiểm tra tính hợp lệ của form[cite: 3]
  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email không được để trống";
    if (!form.password.trim()) newErrors.password = "Mật khẩu không được để trống";
    return newErrors;
  };

  // Logic chung sau khi đăng nhập thành công
  const handleAuthSuccess = (data, isRemember) => {
    setStoredAuth(data, isRemember); //[cite: 3]
    setUser(data.user); //[cite: 6]

    // Điều hướng dựa trên vai trò người dùng[cite: 3, 7]
    if (isTeacherRole(data.user?.role)) {
      window.location.href = "/teacher/dashboard";
    } else {
      window.location.href = "/";
    }
  };

  // 1. Đăng nhập truyền thống[cite: 3, 7]
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    setSubmitError("");

    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const response = await loginApi({
        email: form.email.trim(),
        password: form.password.trim(),
      });
      // Response từ loginApi thường là object chứa data[cite: 1, 7]
      handleAuthSuccess(response, form.remember);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Email hoặc mật khẩu không chính xác"
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Đăng nhập bằng Google[cite: 7, 8]
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setSubmitError("");
      
      // Gửi token của Google lên Backend xác thực
      const result = await loginGoogleApi(credentialResponse.credential); 
      // Backend trả về success_response chứa data bên trong[cite: 7]
      const data = result.data; 

      handleAuthSuccess(data, true);
    } catch (error) {
      console.error("Google Auth Error:", error);
      setSubmitError("Đăng nhập Google thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="mb-2 text-center text-4xl font-extrabold text-[#002B5B]">
        Đăng nhập
      </h2>

      <p className="mx-auto text-center text-sm text-gray-500 mb-8 max-w-xs">
        Chào mừng bạn quay lại OU Education.
      </p>

      {/* Form đăng nhập chính */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={handleChange}
            className={`w-full rounded-full border px-5 py-3 outline-none transition-all ${
              errors.email ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-[#002B5B]"
            }`}
          />
          {errors.email && <p className="text-xs text-red-500 ml-4">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 ml-1">Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className={`w-full rounded-full border px-5 py-3 outline-none transition-all ${
              errors.password ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-[#002B5B]"
            }`}
          />
          {errors.password && <p className="text-xs text-red-500 ml-4">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              className="h-4 w-4 rounded accent-[#002B5B]"
            />
            Ghi nhớ
          </label>
          <button type="button" className="text-sm text-[#002B5B] font-medium hover:underline">
            Quên mật khẩu?
          </button>
        </div>

        {submitError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm text-center font-medium border border-red-100">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#002B5B] py-3.5 text-white font-bold shadow-lg hover:bg-[#003a78] transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      {/* Divider "Hoặc" */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200"></span>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-400 font-medium italic">Hoặc đăng nhập với</span>
        </div>
      </div>

      {/* Google Login Button */}
      <div className="flex justify-center mb-8">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setSubmitError("Lỗi kết nối với Google")}
          useOneTap
          theme="outline"
          shape="pill"
          width="100%"
        />
      </div>

      <div className="text-center text-sm text-gray-600">
        Bạn chưa có tài khoản?{" "}
        <button
          onClick={() => onSwitchType("register")}
          className="font-bold text-[#002B5B] hover:underline"
        >
          Đăng ký ngay
        </button>
      </div>
    </div>
  );
};

export default LoginForm;