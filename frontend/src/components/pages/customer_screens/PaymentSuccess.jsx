import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const method = params.get("method");
  const orderId = params.get("order_id");
  const isCod = method === "cod";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center">

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-5xl text-green-600">
              ✓
            </span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {isCod
            ? "Đặt hàng thành công!"
            : "Thanh toán thành công!"}
        </h1>

        <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
          {isCod
            ? "Đơn hàng của bạn đã được tiếp nhận. Nhân viên ASIAPP sẽ liên hệ với bạn để xác nhận thông tin đơn hàng và thời gian giao hàng."
            : "Giao dịch thanh toán của bạn đã được ghi nhận thành công."}
        </p>

        <div className="mt-8 rounded-xl bg-gray-50 border border-gray-200 p-5 text-left">
          <h2 className="font-semibold text-gray-900 mb-3">
            Thông tin đơn hàng
          </h2>

          {isCod ? (
            <div className="space-y-2 text-sm text-gray-600">
              {orderId && (
                <p>
                  • Mã đơn hàng: #{orderId}
                </p>
              )}

              <p>
                • Hình thức thanh toán: COD
              </p>

              <p>
                • Đơn hàng đang chờ nhân viên xác nhận.
              </p>

              <p>
                • Nhân viên kinh doanh ASIAPP sẽ liên hệ với bạn.
              </p>

              <p>
                • Vui lòng giữ điện thoại để nhận cuộc gọi xác nhận.
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                • Hình thức thanh toán: VNPay
              </p>

              <p>
                • Giao dịch đã được ghi nhận thành công.
              </p>

              <p>
                • Đơn hàng đang được hệ thống xử lý.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            ← Tiếp tục xem sản phẩm
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Về trang chủ
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Xem đơn hàng
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;