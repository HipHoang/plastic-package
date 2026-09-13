from flask import Blueprint, request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from app.models import Post, Product, User
from app.models.user import UserRole

from app.services.post_service import (
    create_post,
    get_posts_by_product,
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


def require_admin_or_staff():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return None, error_response("Không tìm thấy tài khoản", 404)

    if user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        return None, error_response("Bạn không có quyền quản trị", 403)

    return user, None


@post_bp.route("/admin", methods=["GET"])
@jwt_required()
def get_admin_posts():
    try:
        _, permission_error = require_admin_or_staff()
        if permission_error:
            return permission_error

        posts = Post.query.order_by(Post.created_at.desc()).all()
        data = []
        for post in posts:
            item = post.to_dict()
            product = Product.query.get(post.product_id) if post.product_id else None
            item.update({
                "title": product.title if product else f"Bài viết #{post.post_id}",
                "product_name": product.title if product else None,
                "author_name": post.author.name if post.author else "ASIAPP",
                "status": "published" if item.get("is_published") else "draft",
            })
            data.append(item)

        return success_response(
            data=data,
            message="Lấy danh sách tin tức thành công",
            status_code=200,
        )
    except Exception as e:
        return error_response(str(e), 500)


# =========================
# TẠO BÀI VIẾT
# =========================
@post_bp.route(
    "/products/<int:product_id>",
    methods=["POST"]
)
@jwt_required()
def create_post_api(product_id):
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
            product_id=product_id,
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
    "/products/<int:product_id>",
    methods=["GET"]
)
def get_posts(product_id):
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

        data = get_posts_by_product(
            product_id,
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
