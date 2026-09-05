import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const courseId = params.get("course_id");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-green-600">Thanh toán thành công!</h1>
      <p className="mt-2">Bạn đã đăng ký khóa học thành công.</p>

      <button
        onClick={() => navigate(`/learn/${courseId}`)}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Đi đến học
      </button>
    </div>
  );
};

export default PaymentSuccess;
