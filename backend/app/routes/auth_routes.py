from flask import Blueprint, request

from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

from app.services.auth_service import (
    register_user,
    login_user,
    verify_google_token,
    get_user_by_id,
)

from app.utils.response import (
    error_response,
    success_response,
)


auth_bp = Blueprint("auth_bp", __name__)


# =========================
# REGISTER
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(silent=True) or {}

        email = data.get("email")
        password = data.get("password")
        name = data.get("name")
        role = data.get("role", "customer")

        result, status = register_user(
            email,
            password,
            name,
            role
        )

        return result, status

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True) or {}

        email = data.get("email")
        password = data.get("password")

        result, status = login_user(
            email,
            password
        )

        return result, status

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================
# GOOGLE LOGIN
# =========================
@auth_bp.route("/google", methods=["POST"])
def login_google():
    try:
        data = request.get_json(silent=True) or {}

        token = data.get("token")

        if not token:
            return error_response(
                "Thiếu Google token",
                400
            )

        user, error = verify_google_token(token)

        if error:
            return error_response(
                error,
                401
            )

        access_token = create_access_token(
            identity=str(user.user_id)
        )

        return success_response(
            data={
                "access_token": access_token,
                "user": user.to_dict(),
            },
            message="Đăng nhập Google thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )


# =========================
# CURRENT USER
# =========================
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    try:
        user_id = get_jwt_identity()

        user = get_user_by_id(user_id)

        if not user:
            return error_response(
                "Không tìm thấy tài khoản",
                404
            )

        return success_response(
            data=user,
            message="Lấy thông tin tài khoản thành công",
            status_code=200,
        )

    except Exception as e:
        return error_response(
            str(e),
            500
        )