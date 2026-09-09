import React, { useState } from "react";
import { registerApi } from "../../services/authService";

const RegisterForm = ({ onSwitchType }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên";
    }

    if (!form.email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ email";
    }

    if (!form.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (form.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();

    setErrors(newErrors);
    setSubmitError("");
    setSuccessMessage("");

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const data = await registerApi({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        role: "customer",
      });

      setSuccessMessage(
        data.message || "Đăng ký tài khoản thành công"
      );

      setTimeout(() => {
        onSwitchType("login");
      }, 1000);
    } catch (error) {
      console.error("Register error:", error);

      setSubmitError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-center text-4xl font-extrabold text-blue-900">
        Tạo tài khoản
      </h2>

      <p className="mx-auto mb-8 max-w-130 text-center text-sm leading-6 text-gray-500">
        Đăng ký tài khoản khách hàng để xem sản phẩm và đặt hàng tại ASIAPP.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Họ và tên"
            value={form.name}
            onChange={handleChange}
            className={`w-full rounded-full border px-5 py-3 outline-none transition ${
              errors.name
                ? "border-red-400 bg-red-50 text-red-500 placeholder:text-red-300"
                : "border-gray-200 bg-white focus:border-[#002B5B]"
            }`}
          />

          {errors.name && (
            <p className="mt-2 text-sm font-medium text-red-500">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Địa chỉ email"
            value={form.email}
            onChange={handleChange}
            className={`w-full rounded-full border px-5 py-3 outline-none transition ${
              errors.email
                ? "border-red-400 bg-red-50 text-red-500 placeholder:text-red-300"
                : "border-gray-200 bg-white focus:border-[#002B5B]"
            }`}
          />

          {errors.email && (
            <p className="mt-2 text-sm font-medium text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại (không bắt buộc)"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 outline-none transition focus:border-[#002B5B]"
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            className={`w-full rounded-full border px-5 py-3 outline-none transition ${
              errors.password
                ? "border-red-400 bg-red-50 text-red-500 placeholder:text-red-300"
                : "border-gray-200 bg-white focus:border-[#002B5B]"
            }`}
          />

          {errors.password && (
            <p className="mt-2 text-sm font-medium text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`w-full rounded-full border px-5 py-3 outline-none transition ${
              errors.confirmPassword
                ? "border-red-400 bg-red-50 text-red-500 placeholder:text-red-300"
                : "border-gray-200 bg-white focus:border-[#002B5B]"
            }`}
          />

          {errors.confirmPassword && (
            <p className="mt-2 text-sm font-medium text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
            {submitError}
          </p>
        )}

        {successMessage && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-full bg-[#002B5B] py-3 text-lg font-semibold text-white shadow-md transition hover:bg-[#003a78] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-700">
        Bạn đã có tài khoản?{" "}
        <button
          type="button"
          onClick={() => onSwitchType("login")}
          className="font-semibold text-[#002B5B] hover:underline"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;