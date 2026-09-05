import React from "react";

const TeacherProfile = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const user = currentUser?.user || currentUser;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Hồ sơ giảng viên</h1>
        <p className="text-slate-500 mt-2">
          Thông tin cá nhân và tài khoản của bạn
        </p>
      </div>

      <div className="bg-white rounded-[28px] border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-[#002B5B] text-white flex items-center justify-center text-3xl font-bold">
            {(user?.name || user?.fullName || "U").charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-slate-500">Họ và tên</p>
              <p className="text-lg font-semibold text-slate-800">
                {user?.name || user?.fullName || "Chưa cập nhật"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-lg font-semibold text-slate-800">
                {user?.email || "Chưa cập nhật"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Vai trò</p>
              <p className="text-lg font-semibold text-slate-800">
                {user?.role || "teacher"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;