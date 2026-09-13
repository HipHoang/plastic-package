import hashlib
import hmac
import os
import urllib.parse
from datetime import datetime

from app.models.order import Order
from app.models.product import Product
from app.configs.db import db


class PaymentService:
    VNP_URL = (
        "https://sandbox.vnpayment.vn/"
        "paymentv2/vpcpay.html"
    )

    # VNPay Sandbox
    VNP_TMN_CODE = os.getenv("VNP_TMN_CODE")
    VNP_HASH_SECRET = os.getenv("VNP_HASH_SECRET")

    VNP_RETURN_URL = os.getenv(
        "VNP_RETURN_URL",
        "http://localhost:5000/api/payment/vnpay_return",
    )

    @staticmethod
    def create_payment_url(
        user_id,
        product_id,
        quantity=1,
        customer_name=None,
        customer_phone=None,
        customer_email=None,
        remote_addr=None,
    ):
        if not PaymentService.VNP_TMN_CODE or not PaymentService.VNP_HASH_SECRET:
            raise RuntimeError(
                "VNPay configuration is missing"
            )

        # =========================
        # 1. KIỂM TRA USER
        # =========================
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            raise ValueError(
                "Tài khoản không hợp lệ"
            )

        # =========================
        # 2. KIỂM TRA SẢN PHẨM
        # =========================
        try:
            product_id = int(product_id)
        except (TypeError, ValueError):
            raise ValueError(
                "Mã sản phẩm không hợp lệ"
            )

        product = Product.query.get(product_id)

        if not product:
            raise ValueError(
                "Không tìm thấy sản phẩm"
            )

        if not product.is_active:
            raise ValueError(
                "Sản phẩm hiện đang ngừng bán"
            )

        # =========================
        # 3. KIỂM TRA SỐ LƯỢNG
        # =========================
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            raise ValueError(
                "Số lượng không hợp lệ"
            )

        if quantity < 1:
            raise ValueError(
                "Số lượng phải lớn hơn 0"
            )

        min_quantity = int(
            product.min_order_quantity or 1
        )

        if quantity < min_quantity:
            raise ValueError(
                f"Số lượng tối thiểu là "
                f"{min_quantity} "
                f"{product.unit or 'cái'}"
            )

        # =========================
        # 4. TÍNH GIÁ
        # =========================
        unit_price = float(
            product.price or 0
        )

        if unit_price <= 0:
            raise ValueError(
                "Sản phẩm chưa có giá bán. "
                "Vui lòng liên hệ để nhận báo giá."
            )

        amount = unit_price * quantity

        # =========================
        # 5. TẠO MÔ TẢ ĐƠN HÀNG
        # =========================
        order_desc = (
            f"Thanh toan san pham "
            f"{product.title} "
            f"- SL {quantity}"
        )

        # =========================
        # 6. TẠO ORDER
        # =========================
        new_order = Order(
            user_id=user_id,
            product_id=product_id,
            amount=amount,
            quantity=quantity,
            status="pending",
            order_desc=order_desc,
            payment_method="VNPay",
            customer_name=(
                customer_name or ""
            ).strip(),
            customer_phone=(
                customer_phone or ""
            ).strip(),
            customer_email=(
                customer_email or ""
            ).strip(),
        )

        db.session.add(new_order)
        db.session.commit()

        # =========================
        # 7. ĐỊA CHỈ IP
        # =========================
        ip_address = (
            remote_addr
            or "127.0.0.1"
        )

        # =========================
        # 8. SỐ TIỀN GỬI VNPAY
        # =========================
        # VNPay yêu cầu số tiền x100
        vnp_amount = int(
            round(amount * 100)
        )

        # =========================
        # 9. TẠO PARAMS
        # =========================
        vnp_params = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": (
                PaymentService.VNP_TMN_CODE
            ),
            "vnp_Amount": vnp_amount,
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": str(
                new_order.id
            ),
            "vnp_OrderInfo": order_desc,
            "vnp_OrderType": "billpayment",
            "vnp_Locale": "vn",
            "vnp_ReturnUrl": (
                PaymentService.VNP_RETURN_URL
            ),
            "vnp_IpAddr": ip_address,
            "vnp_CreateDate": (
                datetime.now().strftime(
                    "%Y%m%d%H%M%S"
                )
            ),
        }

        # =========================
        # 10. SORT PARAMS
        # =========================
        input_data = sorted(
            vnp_params.items()
        )

        query_string = (
            urllib.parse.urlencode(
                input_data,
                quote_via=urllib.parse.quote
            )
        )

        # =========================
        # 11. TẠO SECURE HASH
        # =========================
        hash_value = hmac.new(
            PaymentService.VNP_HASH_SECRET.encode(
                "utf-8"
            ),
            query_string.encode(
                "utf-8"
            ),
            hashlib.sha512
        ).hexdigest()

        # =========================
        # 12. TẠO URL THANH TOÁN
        # =========================
        payment_url = (
            f"{PaymentService.VNP_URL}"
            f"?{query_string}"
            f"&vnp_SecureHash={hash_value}"
        )

        return payment_url