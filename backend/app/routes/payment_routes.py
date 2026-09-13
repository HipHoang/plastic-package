import hashlib
import hmac
import urllib.parse
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt_identity,
)
from flask_jwt_extended.exceptions import NoAuthorizationError

from app.services.payment_service import PaymentService
from app.models.enrollment import Enrollment, Payment
from app.models.order import Order
from app.models.product import Product
from app.configs.db import db


payment_bp = Blueprint(
    "payment_bp",
    __name__
)


# =========================
# HÀM KIỂM TRA DỮ LIỆU ĐƠN HÀNG
# =========================
def validate_order_data(data):
    product_id = data.get(
        "product_id",
        data.get("product_id")
    )

    if not product_id:
        raise ValueError(
            "Thiếu mã sản phẩm"
        )

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

    try:
        raw_quantity = data.get("quantity", 1)
        quantity = int(raw_quantity)
        if str(raw_quantity).strip() != str(quantity):
            raise ValueError
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

    price = float(
        product.price or 0
    )

    if price <= 0:
        raise ValueError(
            "Sản phẩm chưa có giá bán. "
            "Vui lòng liên hệ để nhận báo giá."
        )

    customer_name = (
        data.get("customer_name")
        or ""
    ).strip()

    customer_phone = (
        data.get("customer_phone")
        or ""
    ).strip()

    customer_email = (
        data.get("customer_email")
        or ""
    ).strip()

    customer_address = (
        data.get("customer_address")
        or ""
    ).strip()

    note = (
        data.get("note")
        or ""
    ).strip()

    if not customer_name:
        raise ValueError(
            "Vui lòng nhập họ và tên"
        )

    if not customer_phone:
        raise ValueError(
            "Vui lòng nhập số điện thoại"
        )

    if not customer_email:
        raise ValueError(
            "Vui lòng nhập email"
        )

    if not customer_address:
        raise ValueError(
            "Vui lòng nhập địa chỉ giao hàng"
        )

    amount = price * quantity

    return {
        "product_id": product_id,
        "product": product,
        "quantity": quantity,
        "min_quantity": min_quantity,
        "price": price,
        "amount": amount,
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "customer_email": customer_email,
        "customer_address": customer_address,
        "note": note,
    }


# =========================
# CHECKOUT - VNPAY
# =========================
@payment_bp.route(
    "/checkout",
    methods=["POST", "OPTIONS"]
)
def checkout():
    if request.method == "OPTIONS":
        response = jsonify({
            "message": "OK"
        })

        response.headers[
            "Access-Control-Allow-Origin"
        ] = "http://localhost:5173"

        response.headers[
            "Access-Control-Allow-Headers"
        ] = "Content-Type,Authorization"

        response.headers[
            "Access-Control-Allow-Methods"
        ] = "POST,OPTIONS"

        return response, 200

    try:
        verify_jwt_in_request()

        user_id = get_jwt_identity()

        data = request.get_json(
            silent=True
        ) or {}

        order_data = validate_order_data(
            data
        )

        payment_url = (
            PaymentService.create_payment_url(
                user_id=user_id,
                product_id=order_data[
                    "product_id"
                ],
                quantity=order_data[
                    "quantity"
                ],
                customer_name=order_data[
                    "customer_name"
                ],
                customer_phone=order_data[
                    "customer_phone"
                ],
                customer_email=order_data[
                    "customer_email"
                ],
                remote_addr=request.remote_addr,
            )
        )

        # Lưu thông tin bổ sung vào order
        latest_order = (
            Order.query
            .filter_by(
                user_id=int(user_id),
                product_id=order_data[
                    "product_id"
                ]
            )
            .order_by(
                Order.id.desc()
            )
            .first()
        )

        if latest_order:
            latest_order.payment_method = "VNPay"

            latest_order.customer_name = (
                order_data["customer_name"]
            )

            latest_order.customer_phone = (
                order_data["customer_phone"]
            )

            latest_order.customer_email = (
                order_data["customer_email"]
            )

            latest_order.customer_address = (
                order_data["customer_address"]
            )

            latest_order.quantity = (
                order_data["quantity"]
            )

            if order_data["note"]:
                latest_order.order_desc = (
                    f"{latest_order.order_desc} | "
                    f"Ghi chú: {order_data['note']}"
                )

            db.session.commit()

        return jsonify({
            "message": "Tạo thanh toán VNPay thành công",
            "payment_method": "VNPay",
            "payment_url": payment_url,
        }), 200

    except NoAuthorizationError as e:
        db.session.rollback()
        return jsonify({
            "message": str(e)
        }), 401

    except ValueError as e:
        db.session.rollback()

        return jsonify({
            "message": str(e)
        }), 400

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "message": str(e)
        }), 500


# =========================
# ĐẶT HÀNG - COD
# =========================
@payment_bp.route(
    "/cod",
    methods=["POST", "OPTIONS"]
)
def create_cod_order():
    if request.method == "OPTIONS":
        response = jsonify({
            "message": "OK"
        })

        response.headers[
            "Access-Control-Allow-Origin"
        ] = "http://localhost:5173"

        response.headers[
            "Access-Control-Allow-Headers"
        ] = "Content-Type,Authorization"

        response.headers[
            "Access-Control-Allow-Methods"
        ] = "POST,OPTIONS"

        return response, 200

    try:
        verify_jwt_in_request()

        user_id = get_jwt_identity()

        data = request.get_json(
            silent=True
        ) or {}

        order_data = validate_order_data(
            data
        )

        duplicate_cutoff = datetime.utcnow() - timedelta(seconds=30)
        existing_order = (
            Order.query
            .filter_by(
                user_id=int(user_id),
                product_id=order_data["product_id"],
                quantity=order_data["quantity"],
                amount=order_data["amount"],
                status="pending_confirmation",
                customer_name=order_data["customer_name"],
                customer_phone=order_data["customer_phone"],
                customer_email=order_data["customer_email"],
                customer_address=order_data["customer_address"],
            )
            .filter(Order.created_at >= duplicate_cutoff)
            .order_by(Order.id.desc())
            .first()
        )

        if existing_order:
            return jsonify({
                "success": True,
                "message": "Đơn hàng của bạn đã được tiếp nhận.",
                "payment_method": "COD",
                "order": existing_order.to_dict(),
            }), 200

        product = order_data["product"]

        order_desc = (
            f"Đặt mua {product.title} "
            f"- SL {order_data['quantity']} "
            f"{product.unit or 'cái'}"
        )

        if order_data["note"]:
            order_desc += (
                f" | Ghi chú: "
                f"{order_data['note']}"
            )

        # =========================
        # TẠO ORDER COD
        # =========================
        new_order = Order(
            user_id=int(user_id),
            product_id=order_data[
                "product_id"
            ],
            amount=order_data[
                "amount"
            ],
            quantity=order_data[
                "quantity"
            ],
            status="pending_confirmation",
            order_desc=order_desc,
            payment_method="COD",
            customer_name=order_data[
                "customer_name"
            ],
            customer_phone=order_data[
                "customer_phone"
            ],
            customer_email=order_data[
                "customer_email"
            ],
            customer_address=order_data[
                "customer_address"
            ],
        )

        db.session.add(new_order)
        db.session.flush()

        db.session.commit()

        return jsonify({
            "success": True,
            "message": (
                "Đặt hàng thành công. "
                "Nhân viên ASIAPP sẽ liên hệ "
                "để xác nhận đơn hàng."
            ),
            "payment_method": "COD",
            "order": new_order.to_dict(),
        }), 201

    except NoAuthorizationError as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 401

    except ValueError as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# =========================
# VNPAY RETURN
# =========================
@payment_bp.route(
    "/vnpay_return",
    methods=["GET"]
)
def vnpay_return():
    vnp_params = request.args.to_dict()

    secure_hash = vnp_params.pop("vnp_SecureHash", None)
    vnp_params.pop("vnp_SecureHashType", None)
    if not secure_hash or not PaymentService.VNP_HASH_SECRET:
        return "Invalid payment signature", 400

    query_string = urllib.parse.urlencode(
        sorted(vnp_params.items()),
        quote_via=urllib.parse.quote,
    )
    expected_hash = hmac.new(
        PaymentService.VNP_HASH_SECRET.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()
    if not hmac.compare_digest(
        expected_hash.lower(),
        secure_hash.lower(),
    ):
        return "Invalid payment signature", 400

    order_id = vnp_params.get(
        "vnp_TxnRef"
    )

    response_code = vnp_params.get(
        "vnp_ResponseCode"
    )

    if not order_id:
        return "Missing order ID", 400

    try:
        order = Order.query.get(
            int(order_id)
        )
    except (ValueError, TypeError):
        order = None

    if not order:
        return "Order not found", 404

    try:
        returned_amount = int(vnp_params.get("vnp_Amount", "0"))
    except ValueError:
        return "Invalid payment amount", 400

    expected_amount = int(round(float(order.amount) * 100))
    if returned_amount != expected_amount:
        return "Invalid payment amount", 400

    # =========================
    # VNPAY THÀNH CÔNG
    # =========================
    if response_code == "00":
        try:
            existing_enrollment = (
                Enrollment.query
                .filter_by(
                    user_id=order.user_id,
                    product_id=order.product_id
                )
                .first()
            )

            order.status = "success"

            order.payment_method = "VNPay"

            order.vnp_transaction_no = (
                vnp_params.get(
                    "vnp_TransactionNo"
                )
            )

            if not existing_enrollment:
                new_enrollment = Enrollment(
                    user_id=order.user_id,
                    product_id=order.product_id,
                    status="active"
                )

                db.session.add(
                    new_enrollment
                )

                db.session.flush()

                new_payment = Payment(
                    enrollment_id=(
                        new_enrollment.enrollment_id
                    ),
                    amount=order.amount,
                    method="VNPay",
                    status="completed",
                )

                db.session.add(
                    new_payment
                )

            else:
                existing_payment = (
                    Payment.query
                    .filter_by(
                        enrollment_id=(
                            existing_enrollment.enrollment_id
                        )
                    )
                    .first()
                )

                if not existing_payment:
                    new_payment = Payment(
                        enrollment_id=(
                            existing_enrollment.enrollment_id
                        ),
                        amount=order.amount,
                        method="VNPay",
                        status="completed",
                    )

                    db.session.add(
                        new_payment
                    )

            db.session.commit()

            return redirect(
                "http://localhost:5173/"
                "payment-success"
                f"?product_id={order.product_id}"
                "&method=vnpay"
            )

        except Exception as e:
            db.session.rollback()

            print(
                "VNPay callback error:",
                e
            )

            return redirect(
                "http://localhost:5173/"
                "payment-failed"
                f"?product_id={order.product_id}"
                "&method=vnpay"
            )

    # =========================
    # VNPAY THẤT BẠI
    # =========================
    order.status = "failed"

    order.payment_method = "VNPay"

    order.vnp_transaction_no = (
        vnp_params.get(
            "vnp_TransactionNo"
        )
    )

    db.session.commit()

    return redirect(
        "http://localhost:5173/"
        "payment-failed"
        f"?product_id={order.product_id}"
        "&method=vnpay"
    )
