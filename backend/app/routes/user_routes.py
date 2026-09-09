from flask import Blueprint, request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

from app.models.user import User
from app.models.order import Order
from app.models.course import Course
from app.configs.db import db
from app.utils.response import (
    success_response,
    error_response,
)


user_bp = Blueprint(
    "user_bp",
    __name__
)


# =========================
# HÀM KIỂM TRA ADMIN / STAFF
# =========================
def get_current_user():
    user_id = get_jwt_identity()

    return User.query.get(
        int(user_id)
    )


def require_admin_or_staff():
    user = get_current_user()

    if not user:
        return None, error_response(
            "Không tìm thấy tài khoản",
            404
        )

    role = str(
        user.role.value
        if hasattr(user.role, "value")
        else user.role
    ).upper()

    if role not in ["ADMIN", "STAFF"]:
        return None, error_response(
            "Bạn không có quyền thực hiện thao tác này",
            403
        )

    return user, None


# =========================
# PROFILE
# =========================
@user_bp.route(
    "/profile",
    methods=["GET"]
)
@jwt_required()
def profile():
    try:
        user_id = get_jwt_identity()

        user = User.query.get(
            int(user_id)
        )

        if not user:
            return error_response(
                "Không tìm thấy tài khoản",
                404
            )

        return success_response(
            data=user.to_dict(),
            message="Lấy thông tin tài khoản thành công",
            status_code=200
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================
# UPDATE PROFILE
# =========================
@user_bp.route(
    "/profile",
    methods=["PUT"]
)
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()

        user = User.query.get(
            int(user_id)
        )

        if not user:
            return error_response(
                "Không tìm thấy tài khoản",
                404
            )

        data = request.get_json(
            silent=True
        ) or {}

        if data.get("name") is not None:
            user.name = data.get("name")

        if data.get("phone") is not None:
            user.phone = data.get("phone")

        if data.get("address") is not None:
            user.address = data.get("address")

        db.session.commit()

        return success_response(
            data=user.to_dict(),
            message="Cập nhật thông tin thành công",
            status_code=200
        )

    except Exception as e:
        db.session.rollback()

        return error_response(
            str(e),
            500
        )


# =========================
# MY ORDERS
# =========================
@user_bp.route(
    "/orders",
    methods=["GET"]
)
@jwt_required()
def my_orders():
    try:
        user_id = get_jwt_identity()

        orders = (
            Order.query
            .filter_by(
                user_id=int(user_id)
            )
            .order_by(
                Order.created_at.desc()
            )
            .all()
        )

        result = []

        for order in orders:
            order_data = order.to_dict()

            product = Course.query.get(
                order.course_id
            )

            if product:
                order_data["product"] = {
                    "id": product.course_id,
                    "product_id": product.course_id,
                    "course_id": product.course_id,
                    "name": product.title,
                    "title": product.title,
                    "image": product.image,
                    "price": float(
                        product.price or 0
                    ),
                    "unit": product.unit or "cái",
                    "category": product.category,
                    "material": product.material,
                }
            else:
                order_data["product"] = None

            result.append(
                order_data
            )

        return success_response(
            data=result,
            message="Lấy danh sách đơn hàng thành công",
            status_code=200
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================
# ORDER DETAIL
# =========================
@user_bp.route(
    "/orders/<int:order_id>",
    methods=["GET"]
)
@jwt_required()
def order_detail(order_id):
    try:
        user_id = get_jwt_identity()

        order = (
            Order.query
            .filter_by(
                id=order_id,
                user_id=int(user_id)
            )
            .first()
        )

        if not order:
            return error_response(
                "Không tìm thấy đơn hàng",
                404
            )

        order_data = order.to_dict()

        product = Course.query.get(
            order.course_id
        )

        if product:
            order_data["product"] = {
                "id": product.course_id,
                "product_id": product.course_id,
                "course_id": product.course_id,
                "name": product.title,
                "title": product.title,
                "description": product.description,
                "image": product.image,
                "price": float(
                    product.price or 0
                ),
                "unit": product.unit or "cái",
                "category": product.category,
                "material": product.material,
                "thickness": product.thickness,
                "width": product.width,
                "height": product.height,
                "length": product.length,
                "color": product.color,
                "printing": product.printing,
            }
        else:
            order_data["product"] = None

        return success_response(
            data=order_data,
            message="Lấy chi tiết đơn hàng thành công",
            status_code=200
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================================================
# ADMIN - DANH SÁCH TẤT CẢ ĐƠN HÀNG
# =========================================================
@user_bp.route(
    "/admin/orders",
    methods=["GET"]
)
@jwt_required()
def admin_orders():
    try:
        user, permission_error = require_admin_or_staff()

        if permission_error:
            return permission_error

        orders = (
            Order.query
            .order_by(
                Order.created_at.desc()
            )
            .all()
        )

        result = []

        for order in orders:
            order_data = order.to_dict()

            # -------------------------
            # CUSTOMER
            # -------------------------
            customer = User.query.get(
                order.user_id
            )

            if customer:
                order_data["customer"] = {
                    "id": customer.user_id,
                    "name": customer.name,
                    "email": customer.email,
                    "phone": customer.phone,
                    "address": customer.address,
                }
            else:
                order_data["customer"] = None

            # -------------------------
            # PRODUCT
            # -------------------------
            product = Course.query.get(
                order.course_id
            )

            if product:
                order_data["product"] = {
                    "id": product.course_id,
                    "product_id": product.course_id,
                    "name": product.title,
                    "title": product.title,
                    "image": product.image,
                    "price": float(
                        product.price or 0
                    ),
                    "unit": product.unit or "cái",
                    "category": product.category,
                    "material": product.material,
                }
            else:
                order_data["product"] = None

            result.append(
                order_data
            )

        return success_response(
            data=result,
            message="Lấy danh sách đơn hàng quản trị thành công",
            status_code=200
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================================================
# ADMIN - CHI TIẾT ĐƠN HÀNG
# =========================================================
@user_bp.route(
    "/admin/orders/<int:order_id>",
    methods=["GET"]
)
@jwt_required()
def admin_order_detail(order_id):
    try:
        user, permission_error = require_admin_or_staff()

        if permission_error:
            return permission_error

        order = Order.query.get(
            order_id
        )

        if not order:
            return error_response(
                "Không tìm thấy đơn hàng",
                404
            )

        order_data = order.to_dict()

        # -------------------------
        # CUSTOMER
        # -------------------------
        customer = User.query.get(
            order.user_id
        )

        if customer:
            order_data["customer"] = {
                "id": customer.user_id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "address": customer.address,
            }
        else:
            order_data["customer"] = None

        # -------------------------
        # PRODUCT
        # -------------------------
        product = Course.query.get(
            order.course_id
        )

        if product:
            order_data["product"] = {
                "id": product.course_id,
                "product_id": product.course_id,
                "name": product.title,
                "title": product.title,
                "description": product.description,
                "image": product.image,
                "price": float(
                    product.price or 0
                ),
                "unit": product.unit or "cái",
                "category": product.category,
                "material": product.material,
                "thickness": product.thickness,
                "width": product.width,
                "height": product.height,
                "length": product.length,
                "color": product.color,
                "printing": product.printing,
                "usage": product.usage,
            }
        else:
            order_data["product"] = None

        return success_response(
            data=order_data,
            message="Lấy chi tiết đơn hàng quản trị thành công",
            status_code=200
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================================================
# ADMIN - CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
# =========================================================
@user_bp.route(
    "/admin/orders/<int:order_id>/status",
    methods=["PUT"]
)
@jwt_required()
def update_order_status(order_id):
    try:
        user, permission_error = require_admin_or_staff()

        if permission_error:
            return permission_error

        order = Order.query.get(
            order_id
        )

        if not order:
            return error_response(
                "Không tìm thấy đơn hàng",
                404
            )

        data = request.get_json(
            silent=True
        ) or {}

        status = str(
            data.get("status", "")
        ).strip().lower()

        allowed_statuses = [
            "pending",
            "pending_confirmation",
            "processing",
            "confirmed",
            "shipping",
            "delivered",
            "success",
            "completed",
            "cancelled",
            "canceled",
            "failed",
        ]

        if not status:
            return error_response(
                "Vui lòng chọn trạng thái đơn hàng",
                400
            )

        if status not in allowed_statuses:
            return error_response(
                "Trạng thái đơn hàng không hợp lệ",
                400
            )

        order.status = status

        db.session.commit()

        return success_response(
            data=order.to_dict(),
            message="Cập nhật trạng thái đơn hàng thành công",
            status_code=200
        )

    except Exception as e:
        db.session.rollback()

        return error_response(
            str(e),
            500
        )