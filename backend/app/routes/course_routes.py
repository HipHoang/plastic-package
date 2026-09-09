from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.course_service import (
    CourseService,
    get_course_detail_service,
    get_course_user,
    enroll_course_service,
    check_enrollment_status,
    get_teacher_courses,
    get_teacher_stats,
    get_admin_products,
)
from app.models.user import User, UserRole
from app.models.product_category import ProductCategory
from app.utils.response import success_response, error_response


course_bp = Blueprint("course_bp", __name__)


def require_admin_or_staff():
    user_id = get_jwt_identity()

    if not user_id:
        return None, error_response("Chưa đăng nhập", 401)

    user = User.query.get(int(user_id))

    if not user:
        return None, error_response("Không tìm thấy tài khoản", 404)

    if user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        return None, error_response(
            "Bạn không có quyền quản trị",
            403
        )

    return user, None


# =========================
# PRODUCT CATEGORIES
# =========================
@course_bp.route("/product-categories", methods=["GET"])
def get_product_categories():
    try:
        categories = ProductCategory.query.filter_by(
            is_active=True
        ).order_by(ProductCategory.category_id.asc()).all()

        return success_response(
            data=[category.to_dict() for category in categories],
            message="Lấy danh mục sản phẩm thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# ADMIN PRODUCT CATEGORIES
# =========================
@course_bp.route("/admin/product-categories", methods=["GET"])
@jwt_required()
def admin_product_categories():
    try:
        user, error = require_admin_or_staff()

        if error:
            return error

        categories = ProductCategory.query.order_by(
            ProductCategory.category_id.asc()
        ).all()

        return success_response(
            data=[category.to_dict() for category in categories],
            message="Lấy danh sách danh mục thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# SEARCH PRODUCTS
# =========================
@course_bp.route("/search", methods=["GET"])
def search():
    try:
        data = CourseService.search_and_sort_courses(
            page=request.args.get("page", 1, type=int),
            size=min(request.args.get("size", 10, type=int), 50),
            keyword=request.args.get("q"),
            category=request.args.get("category"),
            level=request.args.get("level"),
            sort_by=request.args.get("sort_by", "newest"),
            min_price=request.args.get("min_price", type=float),
            max_price=request.args.get("max_price", type=float),
            rating=request.args.get("rating", type=float),
            is_free=request.args.get(
                "is_free",
                type=lambda v: v.lower() == "true" if v else None
            ),
        )

        return success_response(
            data=data,
            message="Lấy danh sách sản phẩm thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# GET ALL PRODUCTS
# =========================
@course_bp.route("/", methods=["GET"])
def get_courses():
    try:
        page = request.args.get("page", 1, type=int)
        size = min(request.args.get("size", 10, type=int), 50)

        data = CourseService.search_and_sort_courses(
            page=page,
            size=size,
            keyword=request.args.get("q"),
            category=request.args.get("category"),
            level=request.args.get("level"),
            sort_by=request.args.get("sort_by", "newest"),
            min_price=request.args.get("min_price", type=float),
            max_price=request.args.get("max_price", type=float),
            rating=request.args.get("rating", type=float),
            is_free=request.args.get(
                "is_free",
                type=lambda v: v.lower() == "true" if v else None
            ),
        )

        return success_response(
            data=data,
            message="Lấy danh sách sản phẩm thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# GET PRODUCT DETAIL
# =========================
@course_bp.route("/<int:course_id>", methods=["GET"])
def get_course_detail(course_id):
    try:
        data = get_course_detail_service(course_id)

        if not data:
            return error_response(
                "Không tìm thấy sản phẩm",
                404
            )

        return success_response(
            data=data,
            message="Lấy chi tiết sản phẩm thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# CUSTOMER PURCHASES
# =========================
@course_bp.route("/my-courses", methods=["GET"])
@jwt_required()
def get_my_courses():
    try:
        user_id = get_jwt_identity()

        data = get_course_user(int(user_id))

        return success_response(
            data=data,
            message="Lấy danh sách đơn hàng thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# CREATE BASIC ORDER
# =========================
@course_bp.route("/enroll", methods=["POST", "OPTIONS"])
@jwt_required()
def enroll_course():
    if request.method == "OPTIONS":
        return "", 200

    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        course_id = data.get("course_id") or data.get("product_id")

        if not course_id:
            return error_response(
                "Thiếu product_id/course_id",
                400
            )

        result, status = enroll_course_service(
            int(user_id),
            int(course_id)
        )

        return success_response(
            data=result,
            message=result.get("message", "Đặt hàng thành công"),
            status_code=status,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# CHECK PURCHASE STATUS
# =========================
@course_bp.route(
    "/<int:course_id>/check-enrollment",
    methods=["GET"]
)
@jwt_required(optional=True)
def check_enrollment(course_id):
    try:
        user_id = get_jwt_identity()

        if not user_id:
            return success_response(
                data={"isEnrolled": False},
                message="Chưa đăng nhập",
                status_code=200,
            )

        is_enrolled = check_enrollment_status(
            int(user_id),
            course_id
        )

        return success_response(
            data={
                "isEnrolled": is_enrolled,
                "isPurchased": is_enrolled,
            },
            message="Kiểm tra trạng thái mua hàng thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# ADMIN PRODUCT LIST
# =========================
@course_bp.route("/admin/products", methods=["GET"])
@jwt_required()
def admin_products():
    try:
        user, error = require_admin_or_staff()

        if error:
            return error

        data = get_admin_products()

        return success_response(
            data=data,
            message="Lấy danh sách sản phẩm quản trị thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# ADMIN PRODUCT DETAIL
# =========================
@course_bp.route(
    "/admin/products/<int:course_id>",
    methods=["GET"]
)
@jwt_required()
def admin_product_detail(course_id):
    try:
        user, error = require_admin_or_staff()

        if error:
            return error

        data = get_course_detail_service(course_id)

        if not data:
            return error_response(
                "Không tìm thấy sản phẩm",
                404
            )

        return success_response(
            data=data,
            message="Lấy chi tiết sản phẩm thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# ADMIN CREATE PRODUCT
# =========================
@course_bp.route(
    "/admin/products",
    methods=["POST", "OPTIONS"]
)
@jwt_required()
def admin_create_product():
    if request.method == "OPTIONS":
        return "", 200

    try:
        user, error = require_admin_or_staff()

        if error:
            return error

        data = request.form.to_dict()
        image_file = request.files.get("image")

        new_course = CourseService.add_new_course(
            user.user_id,
            data,
            image_file
        )

        return success_response(
            data=new_course.to_dict(),
            message="Tạo sản phẩm thành công",
            status_code=201,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# ADMIN UPDATE PRODUCT
# =========================
@course_bp.route(
    "/admin/products/<int:course_id>",
    methods=["PUT", "POST", "OPTIONS"]
)
@jwt_required()
def admin_update_product(course_id):
    if request.method == "OPTIONS":
        return "", 200

    try:
        user, error = require_admin_or_staff()

        if error:
            return error

        if request.content_type and request.content_type.startswith(
            "multipart/form-data"
        ):
            data = request.form.to_dict()
            image_file = request.files.get("image")
        else:
            data = request.get_json(silent=True) or {}
            image_file = None

        course = CourseService.update_course(
            course_id,
            data,
            image_file
        )

        if not course:
            return error_response(
                "Không tìm thấy sản phẩm",
                404
            )

        return success_response(
            data=course.to_dict(),
            message="Cập nhật sản phẩm thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# ADMIN DELETE PRODUCT
# =========================
@course_bp.route(
    "/admin/products/<int:course_id>",
    methods=["DELETE", "OPTIONS"]
)
@jwt_required()
def admin_delete_product(course_id):
    if request.method == "OPTIONS":
        return "", 200

    try:
        user, error = require_admin_or_staff()

        if error:
            return error

        course = CourseService.deactivate_course(course_id)

        if not course:
            return error_response(
                "Không tìm thấy sản phẩm",
                404
            )

        return success_response(
            data=course.to_dict(),
            message="Đã ngừng bán sản phẩm",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# LEGACY ADMIN PRODUCT LIST
# =========================
@course_bp.route("/instructor", methods=["GET"])
@jwt_required()
def get_instructor_courses():
    try:
        user_id = get_jwt_identity()

        data = get_teacher_courses(int(user_id))

        return success_response(
            data=data,
            message="Lấy danh sách sản phẩm quản trị thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# ADMIN STATISTICS
# =========================
@course_bp.route("/instructor/stats", methods=["GET"])
@jwt_required()
def get_instructor_stats():
    try:
        user_id = get_jwt_identity()

        data = get_teacher_stats(int(user_id))

        return success_response(
            data=data,
            message="Lấy thống kê thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# LEGACY CREATE PRODUCT
# =========================
@course_bp.route("/", methods=["POST", "OPTIONS"])
@jwt_required()
def add_course():
    if request.method == "OPTIONS":
        return "", 200

    try:
        instructor_id = get_jwt_identity()

        if not instructor_id:
            return error_response(
                "Chưa đăng nhập",
                401
            )

        data = request.form.to_dict()
        image_file = request.files.get("image")

        new_course = CourseService.add_new_course(
            instructor_id,
            data,
            image_file
        )

        return success_response(
            data=new_course.to_dict(),
            message="Tạo sản phẩm thành công",
            status_code=201,
        )

    except Exception as e:
        return error_response(str(e), 500)