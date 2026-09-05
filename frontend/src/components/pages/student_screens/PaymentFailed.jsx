import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-red-600">Thanh toán thất bại!</h1>
      <p className="mt-2">Vui lòng thử lại.</p>

      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg"
      >
        Quay lại trang chủ
      </button>
    </div>
  );
};

export default PaymentFailed;
