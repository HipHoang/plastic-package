from flask import Blueprint, request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from app.models import Review, User
from app.models.user import UserRole

from app.services.review_service import (
    get_reviews_by_product,
    create_or_update_review,
    delete_review,
)

from app.utils.response import (
    success_response,
    error_response,
)


review_bp = Blueprint(
    "review_bp",
    __name__
)


def require_admin_or_staff():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return None, error_response("Không tìm thấy tài khoản", 404)

    if user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        return None, error_response("Bạn không có quyền quản trị", 403)

    return user, None


@review_bp.route("/admin", methods=["GET"])
@jwt_required()
def get_admin_reviews():
    try:
        _, permission_error = require_admin_or_staff()
        if permission_error:
            return permission_error

        reviews = Review.query.order_by(Review.created_at.desc()).all()
        data = []
        for review in reviews:
            item = review.to_dict()
            item.update({
                "product_name": review.product.title if review.product else "Sản phẩm",
                "customer_name": review.user.name if review.user else "Khách hàng",
                "customer_email": review.user.email if review.user else None,
                "status": "published",
            })
            data.append(item)

        return success_response(
            data=data,
            message="Lấy danh sách đánh giá thành công",
            status_code=200,
        )
    except Exception as e:
        return error_response(str(e), 500)


# =========================
# DANH SÁCH ĐÁNH GIÁ
# =========================
@review_bp.route(
    "/products/<int:product_id>",
    methods=["GET"]
)
def get_reviews(product_id):
    try:
        page = request.args.get(
            "page",
            1,
            type=int
        )

        size = request.args.get(
            "size",
            10,
            type=int
        )

        data = get_reviews_by_product(
            product_id,
            page,
            size
        )

        return success_response(
            data=data,
            message="Lấy đánh giá sản phẩm thành công",
            status_code=200
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================
# TẠO / CẬP NHẬT ĐÁNH GIÁ
# =========================
@review_bp.route(
    "/products/<int:product_id>",
    methods=["POST"]
)
@jwt_required()
def create_review(product_id):
    try:
        user_id = get_jwt_identity()

        data = request.get_json(
            silent=True
        ) or {}

        rating = data.get("rating")
        comment = data.get("comment", "")

        try:
            rating = int(rating)

        except (TypeError, ValueError):
            return error_response(
                "Rating phải là số",
                400
            )

        if rating < 1 or rating > 5:
            return error_response(
                "Rating phải từ 1 đến 5",
                400
            )

        result, status = create_or_update_review(
            user_id=user_id,
            product_id=product_id,
            rating=rating,
            comment=comment
        )

        if status != 200:
            return error_response(
                result.get(
                    "error",
                    "Không thể đánh giá sản phẩm"
                ),
                status
            )

        return success_response(
            data=result,
            message="Đánh giá sản phẩm thành công",
            status_code=200
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


@review_bp.route(
    "/<int:review_id>",
    methods=["DELETE"]
)
@jwt_required()
def remove_review(review_id):
    try:
        user_id = get_jwt_identity()
        result, status = delete_review(user_id, review_id)

        if status != 200:
            return error_response(
                result.get("error", "Không thể xóa đánh giá"),
                status
            )

        return success_response(
            data=result,
            message=result.get("message", "Xóa đánh giá thành công"),
            status_code=200
        )
    except Exception as e:
        return error_response(str(e), 500)
