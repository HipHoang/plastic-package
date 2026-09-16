import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useLocation } from "react-router-dom";

import {
  loginApi,
  loginGoogleApi,
} from "../../services/authService";

import {
  setStoredAuth,
  isAdminOrStaffRole,
} from "../../untils/auth";

import { useAuth } from "../../context/AuthProvider";

const LoginForm = ({ onSwitchType }) => {
  const { setUser } = useAuth();

  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email =
        "Email không được để trống";
    }

    if (!form.password.trim()) {
      newErrors.password =
        "Mật khẩu không được để trống";
    }

    return newErrors;
  };

  /*
   * Xác định nơi cần quay lại sau khi đăng nhập.
   *
   * Nếu LoginForm được mở từ ProductDetail:
   *   window.location.pathname = /products/1
   *
   * thì giữ nguyên trang sản phẩm.
   *
   * Nếu đăng nhập bình thường:
   *   về trang chủ.
   */
  const getReturnPath = () => {
    const currentPath =
      location.pathname +
      location.search +
      location.hash;

    if (
      currentPath &&
      currentPath !== "/" &&
      currentPath !== "/login" &&
      currentPath !== "/register"
    ) {
      return currentPath;
    }

    return "/";
  };

  const handleAuthSuccess = (
    data,
    isRemember
  ) => {
    if (!data?.user) {
      setSubmitError(
        "Đăng nhập thành công nhưng không nhận được thông tin tài khoản."
      );
      return;
    }

    setStoredAuth(
      data,
      isRemember
    );

    setUser(data.user);

    /*
     * Nhân viên / quản trị viên:
     * luôn vào trang quản trị.
     */
    if (
      isAdminOrStaffRole(data.user?.role)
    ) {
      window.location.href =
        "/admin/dashboard";
      return;
    }

    /*
     * Khách hàng:
     * giữ nguyên trang hiện tại.
     *
     * Ví dụ:
     * /products/4
     * sẽ vẫn ở /products/4.
     */
    const returnPath =
      getReturnPath();

    window.location.href =
      returnPath;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors =
      validate();

    setErrors(newErrors);
    setSubmitError("");

    if (
      Object.keys(newErrors).length > 0
    ) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await loginApi({
          email:
            form.email.trim(),
          password:
            form.password.trim(),
        });

      handleAuthSuccess(
        response,
        form.remember
      );
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          "Email hoặc mật khẩu không chính xác"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    try {
      setLoading(true);
      setSubmitError("");

      if (
        !credentialResponse?.credential
      ) {
        throw new Error(
          "Không nhận được thông tin xác thực Google"
        );
      }

      const result =
        await loginGoogleApi(
          credentialResponse.credential
        );

      /*
       * authService hiện tại trả:
       * response.data
       *
       * nên result chính là dữ liệu backend.
       */
      const data =
        result?.data || result;

      handleAuthSuccess(
        data,
        true
      );
    } catch (error) {
      console.error(
        "Google Auth Error:",
        error
      );

      setSubmitError(
        error?.response?.data?.message ||
          "Đăng nhập Google thất bại. Vui lòng thử lại."
      );
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
        Chào mừng bạn quay lại ASIAPP Plastic Packaging.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={handleChange}
            className={`w-full rounded-full border px-5 py-3 outline-none transition-all ${
              errors.email
                ? "border-red-500 bg-red-50"
                : "border-gray-200 focus:border-[#002B5B]"
            }`}
          />

          {errors.email && (
            <p className="text-xs text-red-500 ml-4">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            Mật khẩu
          </label>

          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className={`w-full rounded-full border px-5 py-3 outline-none transition-all ${
              errors.password
                ? "border-red-500 bg-red-50"
                : "border-gray-200 focus:border-[#002B5B]"
            }`}
          />

          {errors.password && (
            <p className="text-xs text-red-500 ml-4">
              {errors.password}
            </p>
          )}
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

          <button
            type="button"
            className="text-sm text-[#002B5B] font-medium hover:underline"
          >
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
          {loading
            ? "Đang xử lý..."
            : "Đăng nhập"}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>

        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-400 font-medium italic">
            Hoặc đăng nhập với
          </span>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <GoogleLogin
          onSuccess={
            handleGoogleSuccess
          }
          onError={() =>
            setSubmitError(
              "Lỗi kết nối với Google"
            )
          }
          useOneTap
          theme="outline"
          shape="pill"
          width="100%"
        />
      </div>

      <div className="text-center text-sm text-gray-600">
        Bạn chưa có tài khoản?{" "}

        <button
          onClick={() =>
            onSwitchType("register")
          }
          className="font-bold text-[#002B5B] hover:underline"
        >
          Đăng ký ngay
        </button>
      </div>
    </div>
  );
};

export default LoginForm;