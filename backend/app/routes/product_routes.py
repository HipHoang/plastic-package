from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.product_service import (
    ProductService,
    get_product_detail_service,
    get_customer_products,
    enroll_product_service,
    check_order_status,
    get_staff_products,
    get_staff_stats,
    get_admin_products,
)
from app.models.user import User, UserRole
from app.models.product_category import ProductCategory
from app.utils.response import success_response, error_response


product_bp = Blueprint("product_bp", __name__)


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
@product_bp.route("/product-categories", methods=["GET"])
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
@product_bp.route("/admin/product-categories", methods=["GET"])
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


@product_bp.route("/admin/product-categories", methods=["POST"])
@jwt_required()
def create_product_category():
    try:
        user, error = require_admin_or_staff()
        if error:
            return error

        data = request.get_json(silent=True) or {}
        name = str(data.get("name", "")).strip()
        if not name:
            return error_response("Tên danh mục không được để trống", 400)

        category = ProductCategory(
            name=name,
            description=data.get("description"),
            image=data.get("image"),
            is_active=bool(data.get("is_active", True)),
        )
        from app.configs.db import db
        db.session.add(category)
        db.session.commit()

        return success_response(
            data=category.to_dict(),
            message="Tạo danh mục thành công",
            status_code=201,
        )
    except Exception as e:
        from app.configs.db import db
        db.session.rollback()
        return error_response(str(e), 500)


@product_bp.route("/admin/product-categories/<int:category_id>", methods=["PUT", "DELETE"])
@jwt_required()
def manage_product_category(category_id):
    try:
        user, error = require_admin_or_staff()
        if error:
            return error

        category = ProductCategory.query.get(category_id)
        if not category:
            return error_response("Không tìm thấy danh mục", 404)

        if request.method == "DELETE":
            category.is_active = False
        else:
            data = request.get_json(silent=True) or {}
            if "name" in data:
                name = str(data.get("name", "")).strip()
                if not name:
                    return error_response("Tên danh mục không được để trống", 400)
                category.name = name
            for field in ["description", "image"]:
                if field in data:
                    setattr(category, field, data.get(field))
            if "is_active" in data:
                category.is_active = bool(data.get("is_active"))

        from app.configs.db import db
        db.session.commit()
        return success_response(
            data=category.to_dict(),
            message="Cập nhật danh mục thành công",
            status_code=200,
        )
    except Exception as e:
        from app.configs.db import db
        db.session.rollback()
        return error_response(str(e), 500)


# =========================
# SEARCH PRODUCTS
# =========================
@product_bp.route("/search", methods=["GET"])
def search():
    try:
        data = ProductService.search_and_sort_products(
            page=request.args.get("page", 1, type=int),
            size=min(request.args.get("size", 10, type=int), 50),
            keyword=request.args.get("q"),
            category=request.args.get("category"),
            level=request.args.get("level"),
            sort_by=request.args.get("sort_by", "newest"),
            min_price=request.args.get("min_price", type=float),
            max_price=request.args.get("max_price", type=float),
            rating=request.args.get("rating", type=float),
            material=request.args.get("material"),
            color=request.args.get("color"),
            category_id=request.args.get("category_id", type=int),
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
@product_bp.route("/", methods=["GET"])
def get_products():
    try:
        page = request.args.get("page", 1, type=int)
        size = min(request.args.get("size", 10, type=int), 50)

        data = ProductService.search_and_sort_products(
            page=page,
            size=size,
            keyword=request.args.get("q"),
            category=request.args.get("category"),
            level=request.args.get("level"),
            sort_by=request.args.get("sort_by", "newest"),
            min_price=request.args.get("min_price", type=float),
            max_price=request.args.get("max_price", type=float),
            rating=request.args.get("rating", type=float),
            material=request.args.get("material"),
            color=request.args.get("color"),
            category_id=request.args.get("category_id", type=int),
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
@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product_detail(product_id):
    try:
        data = get_product_detail_service(product_id)

        if (
            not data
            or not data.get("is_active", True)
            or not data.get("is_published", True)
        ):
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
@product_bp.route("/my-products", methods=["GET"])
@jwt_required()
def get_my_products():
    try:
        user_id = get_jwt_identity()

        data = get_customer_products(int(user_id))

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
@product_bp.route("/orders", methods=["POST", "OPTIONS"])
@jwt_required()
def create_product_order():
    if request.method == "OPTIONS":
        return "", 200

    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        product_id = data.get("product_id")

        if not product_id:
            return error_response(
                "Thiếu product_id",
                400
            )

        result, status = enroll_product_service(
            int(user_id),
            int(product_id)
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
@product_bp.route(
    "/<int:product_id>/check-order",
    methods=["GET"]
)
@jwt_required(optional=True)
def check_product_order(product_id):
    try:
        user_id = get_jwt_identity()

        if not user_id:
            return success_response(
                data={"isEnrolled": False},
                message="Chưa đăng nhập",
                status_code=200,
            )

        is_enrolled = check_order_status(
            int(user_id),
            product_id
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
@product_bp.route("/admin/products", methods=["GET"])
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
@product_bp.route(
    "/admin/products/<int:product_id>",
    methods=["GET"]
)
@jwt_required()
def admin_product_detail(product_id):
    try:
        user, error = require_admin_or_staff()

        if error:
            return error

        data = get_product_detail_service(product_id)

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
@product_bp.route(
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

        new_product = ProductService.add_new_product(
            user.user_id,
            data,
            image_file
        )

        return success_response(
            data=new_product.to_dict(),
            message="Tạo sản phẩm thành công",
            status_code=201,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# ADMIN UPDATE PRODUCT
# =========================
@product_bp.route(
    "/admin/products/<int:product_id>",
    methods=["PUT", "POST", "OPTIONS"]
)
@jwt_required()
def admin_update_product(product_id):
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

        product = ProductService.update_product(
            product_id,
            data,
            image_file
        )

        if not product:
            return error_response(
                "Không tìm thấy sản phẩm",
                404
            )

        return success_response(
            data=product.to_dict(),
            message="Cập nhật sản phẩm thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# ADMIN DELETE PRODUCT
# =========================
@product_bp.route(
    "/admin/products/<int:product_id>",
    methods=["DELETE", "OPTIONS"]
)
@jwt_required()
def admin_delete_product(product_id):
    if request.method == "OPTIONS":
        return "", 200

    try:
        user, error = require_admin_or_staff()

        if error:
            return error

        product = ProductService.deactivate_product(product_id)

        if not product:
            return error_response(
                "Không tìm thấy sản phẩm",
                404
            )

        return success_response(
            data=product.to_dict(),
            message="Đã ngừng bán sản phẩm",
            status_code=200,
        )

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# LEGACY ADMIN PRODUCT LIST
# =========================
@product_bp.route("/staff/products", methods=["GET"])
@jwt_required()
def get_staff_product_list():
    try:
        user, error = require_admin_or_staff()
        if error:
            return error

        user_id = get_jwt_identity()

        data = get_staff_products(int(user_id))

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
@product_bp.route("/staff/stats", methods=["GET"])
@jwt_required()
def get_staff_product_stats():
    try:
        user, error = require_admin_or_staff()
        if error:
            return error

        user_id = get_jwt_identity()

        data = get_staff_stats(int(user_id))

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
@product_bp.route("/", methods=["POST", "OPTIONS"])
@jwt_required()
def add_product():
    if request.method == "OPTIONS":
        return "", 200

    try:
        staff_id = get_jwt_identity()

        if not staff_id:
            return error_response(
                "Chưa đăng nhập",
                401
            )

        user, error = require_admin_or_staff()
        if error:
            return error

        data = request.form.to_dict()
        image_file = request.files.get("image")

        new_product = ProductService.add_new_product(
            staff_id,
            data,
            image_file
        )

        return success_response(
            data=new_product.to_dict(),
            message="Tạo sản phẩm thành công",
            status_code=201,
        )

    except Exception as e:
        return error_response(str(e), 500)