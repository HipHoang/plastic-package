from flask import jsonify
from app.models.user import User, UserRole
from app.configs.db import db
from flask_jwt_extended import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
import os


def register_user(username, password, name, role="customer"):
    if not username or not password or not name:
        return jsonify({
            "message": "Vui lòng nhập đầy đủ thông tin"
        }), 400

    user = User.query.filter_by(email=username).first()

    if user:
        if user.provider == "local":
            return jsonify({
                "message": "Email đã đăng ký bằng tài khoản thường"
            }), 400

        return jsonify({
            "message": "Email đã tồn tại"
        }), 400

    new_user = User(
        email=username.strip(),
        name=name.strip(),
        role=UserRole.CUSTOMER,
        provider="local",
        is_active=True,
    )

    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "Đăng ký thành công",
        "user": new_user.to_dict()
    }), 201


def login_user(username, password):
    if not username or not password:
        return jsonify({
            "message": "Vui lòng nhập email và mật khẩu"
        }), 400

    user = User.query.filter_by(email=username).first()

    if not user:
        return jsonify({
            "message": "Sai tài khoản hoặc mật khẩu"
        }), 401

    if not user.is_active:
        return jsonify({
            "message": "Tài khoản đã bị khóa"
        }), 403

    if user.provider == "google":
        return jsonify({
            "message": "Vui lòng đăng nhập bằng Google"
        }), 400

    if not user.check_password(password):
        return jsonify({
            "message": "Sai tài khoản hoặc mật khẩu"
        }), 401

    access_token = create_access_token(
        identity=str(user.user_id)
    )

    return jsonify({
        "message": "Đăng nhập thành công",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


def verify_google_token(token):
    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID")

        if not client_id:
            return None, "Chưa cấu hình GOOGLE_CLIENT_ID"

        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            client_id
        )

        email = idinfo.get("email")
        name = idinfo.get("name") or email

        if not email:
            return None, "Token không hợp lệ"

        user = User.query.filter_by(
            email=email
        ).first()

        if not user:
            user = User(
                email=email,
                name=name,
                provider="google",
                password=None,
                role=UserRole.CUSTOMER,
                is_active=True,
            )

            db.session.add(user)
            db.session.commit()

        elif not user.is_active:
            return None, "Tài khoản đã bị khóa"

        return user, None

    except Exception as e:
        return None, str(e)


def get_user_by_id(user_id):
    try:
        user = User.query.get(int(user_id))
    except (ValueError, TypeError):
        return None

    if not user:
        return None

    return user.to_dict()