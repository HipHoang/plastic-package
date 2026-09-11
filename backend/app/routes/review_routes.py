from flask import Blueprint, request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

from app.services.review_service import (
    get_reviews_by_course,
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


# =========================
# DANH SÁCH ĐÁNH GIÁ
# =========================
@review_bp.route(
    "/products/<int:course_id>",
    methods=["GET"]
)
@review_bp.route(
    "/courses/<int:course_id>",
    methods=["GET"]
)
def get_reviews(course_id):
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

        data = get_reviews_by_course(
            course_id,
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
    "/products/<int:course_id>",
    methods=["POST"]
)
@review_bp.route(
    "/courses/<int:course_id>",
    methods=["POST"]
)
@jwt_required()
def create_review(course_id):
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
            course_id=course_id,
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