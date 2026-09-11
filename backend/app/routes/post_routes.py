from flask import Blueprint, request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

from app.services.post_service import (
    create_post,
    get_posts_by_course,
    get_comments_by_post,
    create_comment,
)

from app.utils.response import (
    success_response,
    error_response,
)


post_bp = Blueprint(
    "post_bp",
    __name__
)


# =========================
# TẠO BÀI VIẾT
# =========================
@post_bp.route(
    "/products/<int:course_id>",
    methods=["POST"]
)
@post_bp.route(
    "/courses/<int:course_id>",
    methods=["POST"]
)
@jwt_required()
def create_post_api(course_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        content = data.get("content")
        title = data.get("title")
        image = data.get("image")

        if not content:
            return error_response(
                "Thiếu nội dung",
                400
            )

        result, status = create_post(
            user_id=user_id,
            course_id=course_id,
            content=content,
            title=title,
            image=image
        )

        if "error" in result:
            return error_response(
                result["error"],
                status
            )

        return success_response(
            data=result,
            message="Đăng bài thành công",
            status_code=status
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================
# DANH SÁCH BÀI VIẾT
# =========================
@post_bp.route(
    "/products/<int:course_id>",
    methods=["GET"]
)
@post_bp.route(
    "/courses/<int:course_id>",
    methods=["GET"]
)
def get_posts(course_id):
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

        data = get_posts_by_course(
            course_id,
            page,
            size
        )

        return success_response(
            data=data,
            message="Lấy bài viết thành công",
            status_code=200
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================
# TẠO BÌNH LUẬN
# =========================
@post_bp.route(
    "/<int:post_id>/comments",
    methods=["POST"]
)
@jwt_required()
def comment_post(post_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        content = data.get("content")

        if not content:
            return error_response(
                "Thiếu nội dung",
                400
            )

        result, status = create_comment(
            user_id,
            post_id,
            content
        )

        if "error" in result:
            return error_response(
                result["error"],
                status
            )

        return success_response(
            data=result,
            message="Bình luận thành công",
            status_code=status
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================
# DANH SÁCH BÌNH LUẬN
# =========================
@post_bp.route(
    "/<int:post_id>/comments",
    methods=["GET"]
)
def get_comments(post_id):
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

        data = get_comments_by_post(
            post_id,
            page,
            size
        )

        return success_response(
            data=data,
            message="Lấy bình luận thành công",
            status_code=200
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )