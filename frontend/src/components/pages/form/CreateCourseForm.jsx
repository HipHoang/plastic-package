import React, { useState } from "react";
import { FiLayers, FiTag, FiUploadCloud, FiX } from "react-icons/fi";
import { courseService } from "../../../services/courseService";
import { getAccessToken, getCurrentUserId } from "../../../untils/auth";
const SelectField = ({ label, icon, name, options, onChange, value }) => (
    <div className="space-y-3">
        <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
            {icon} {label}
        </label>
        <div className="relative group">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full appearance-none bg-white px-5 py-3.5 rounded-2xl border border-gray-200 
                     text-slate-700 outline-none transition-all duration-300
                     focus:border-[#0B5CFF] focus:ring-4 focus:ring-blue-50
                     hover:border-gray-300 cursor-pointer"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1.25rem center",
                    backgroundSize: "1.2rem",
                }}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#0B5CFF] transition-all duration-300 group-focus-within:w-1/2 rounded-full"></div>
        </div>
    </div>
);

const CreateCourseForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        level: "BEGINNER",
        price: 0,
        description: "",
    });
    const categoriesList = [
        { value: "", label: "Chọn danh mục" },
        { value: "Lập trình Web", label: "Lập trình Web" },
        { value: "Thiết kế UI/UX", label: "Thiết kế UI/UX" },
        { value: "Data Science", label: "Data Science" },
        { value: "Mobile App", label: "Mobile App" },
        { value: "Blockchain", label: "Blockchain" },
    ];

    const levelsList = [
        { value: "BEGINNER", label: "Cơ bản (Beginner)" },
        { value: "INTERMEDIATE", label: "Trung cấp (Intermediate)" },
        { value: "ADVANCED", label: "Nâng cao (Advanced)" },
    ];



    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Tạo đối tượng FormData (Bắt buộc để gửi file)
        const data = new FormData();

        // 2. Xử lý giá: nếu is_free thì price = 0
        const finalPrice = formData.is_free ? 0 : Number(formData.price || 0);

        // 3. Chỉ append các trường DB thực sự cần (không gửi discount_price, is_free, short_description)
        data.append("title", formData.title);
        data.append("description", formData.description || "");
        data.append("price", finalPrice);
        data.append("level", formData.level || "BEGINNER");
        data.append("category", formData.category || "");

        if (imageFile) {
            data.append("image", imageFile);
        }

        try {
            const res = await courseService.createCourse(data);

            if (res) {
                alert("Tạo khóa học thành công!");
                onClose();
            }
        } catch (error) {
            console.error("Lỗi khi tạo khóa học:", error);
            alert(error.message || "Có lỗi xảy ra khi tạo khóa học!");
        }
    };


   

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-center z-10 relative">
                    {/* Phần tiêu đề nằm giữa */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800">Tạo khóa học mới</h2>
                        <p className="text-slate-500 text-sm">Điền đầy đủ thông tin để bắt đầu xuất bản nội dung</p>
                    </div>

                    {/* Nút X nằm tuyệt đối bên phải */}
                    <button
                        onClick={onClose}
                        className="absolute right-8 p-2 hover:bg-slate-100 rounded-full transition"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Section 1: Thông tin cơ bản */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700">Tiêu đề khóa học *</label>
                            <input
                                type="text"
                                name="title"
                                required
                                className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-[#0B5CFF] outline-none transition"
                                placeholder="Ví dụ: Lập trình ReactJS thực chiến"
                                onChange={handleChange}
                            />
                        </div>

                        <SelectField
                            label="Danh mục"
                            icon={<FiLayers className="text-blue-500" />}
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            options={categoriesList}
                        />

                        {/* Gán dữ liệu level */}
                        <SelectField
                            label="Trình độ"
                            icon={<FiTag className="text-blue-500" />}
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            options={levelsList}
                        />
                    </div>

                    {/* Section 2: Hình ảnh Thumbnail */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700">Hình ảnh khóa học (Thumbnail)</label>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div
                                className="w-full md:w-64 h-40 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative overflow-hidden"
                                onClick={() => document.getElementById('thumb-input').click()}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <>
                                        <FiUploadCloud size={32} className="text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-500">Tải ảnh lên (JPG, PNG)</span>
                                    </>
                                )}
                                <input id="thumb-input" type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </div>
                            <div className="flex-1 text-sm text-slate-500 space-y-2 py-2">
                                <p className="font-semibold text-slate-700">Yêu cầu hình ảnh:</p>
                                <p>• Kích thước chuẩn: 1280x720 pixels (16:9)</p>
                                <p>• Dung lượng không quá 2MB</p>
                                <p>• Hình ảnh rõ nét, không chứa quá nhiều chữ</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Giá cả & Ngôn ngữ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-[28px]">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700">Giá gốc (VNĐ)</label>
                            <input
                                type="number"
                                name="price"
                                disabled={formData.is_free}
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#0B5CFF]"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700">Giá giảm (VNĐ)</label>
                            <input
                                type="number"
                                name="discount_price"
                                disabled={formData.is_free}
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#0B5CFF]"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-8">
                            <input
                                type="checkbox"
                                id="is_free"
                                name="is_free"
                                className="w-5 h-5 rounded-md accent-[#0B5CFF]"
                                onChange={handleChange}
                            />
                            <label htmlFor="is_free" className="text-sm font-bold text-slate-700">Khóa học Miễn phí</label>
                        </div>
                    </div>

                    {/* Section 4: Mô tả chi tiết */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700">Mô tả ngắn (SEO)</label>
                            <textarea
                                name="short_description"
                                rows="2"
                                className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#0B5CFF]"
                                placeholder="Tóm tắt khóa học trong 1-2 câu..."
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700">Nội dung chi tiết</label>
                            <textarea
                                name="description"
                                rows="5"
                                className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#0B5CFF]"
                                placeholder="Mô tả lộ trình, nội dung chính..."
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="px-10 py-3 rounded-2xl font-bold bg-[#0B5CFF] text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                        >
                            Tạo khóa học
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourseForm;