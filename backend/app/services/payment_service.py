import hashlib
import hmac
import urllib.parse
from datetime import datetime

from app.models.order import Order
from app.configs.db import db

class PaymentService:
    VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    VNP_TMN_CODE = "CPY00001"
    VNP_HASH_SECRET = "9756708451313410"
    VNP_RETURN_URL = "http://localhost:5000/api/payment/vnpay_return"

    @staticmethod
    def create_payment_url(user_id, course_id, amount, remote_addr):
        # 1. Tạo order
        new_order = Order(
            user_id=user_id,
            course_id=course_id,
            amount=amount,
            status='pending',
            order_desc=f"Thanh toan khoa hoc ID {course_id}"
        )

        db.session.add(new_order)
        db.session.commit()

        # 2. Params VNPay
        vnp_params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': PaymentService.VNP_TMN_CODE,
            'vnp_Amount': int(float(amount) * 100),
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': str(new_order.id),
            'vnp_OrderInfo': new_order.order_desc,
            'vnp_OrderType': 'billpayment',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': PaymentService.VNP_RETURN_URL,
            'vnp_IpAddr': remote_addr,
            'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
            'vnp_BankCode': 'NCB',
        }

        # 3. Sort + encode
        input_data = sorted(vnp_params.items())
        query_string = urllib.parse.urlencode(input_data, quote_via=urllib.parse.quote)

        # 4. Hash
        hash_value = hmac.new(
            PaymentService.VNP_HASH_SECRET.encode(),
            query_string.encode(),
            hashlib.sha512
        ).hexdigest()

        return f"{PaymentService.VNP_URL}?{query_string}&vnp_SecureHash={hash_value}"