import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const method = params.get("method");
  const isCod = method === "cod";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center">

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-5xl text-red-600">
              ×
            </span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {isCod
            ? "Không thể đặt hàng"
            : "Thanh toán chưa thành công"}
        </h1>

        <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
          {isCod
            ? "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng kiểm tra lại thông tin và thử lại."
            : "Giao dịch VNPay chưa được hoàn tất hoặc đã bị hủy. Bạn có thể thử thanh toán lại."}
        </p>

        <div className="mt-8 rounded-xl bg-gray-50 border border-gray-200 p-5 text-left">
          <h2 className="font-semibold text-gray-900 mb-3">
            Bạn có thể làm gì?
          </h2>

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Kiểm tra lại số lượng và thông tin khách hàng.
            </p>

            <p>
              • Nếu thanh toán VNPay bị gián đoạn, hãy thử lại.
            </p>

            <p>
              • Với đơn hàng số lượng lớn, vui lòng liên hệ bộ phận kinh doanh ASIAPP để được hỗ trợ.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/all-courses")}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            ← Xem lại sản phẩm
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Về trang chủ
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentFailed;