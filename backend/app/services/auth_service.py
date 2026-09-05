from flask import jsonify
from zope.interface import provider

from app.models.user import User, db
from flask_jwt_extended import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv
import os

def register_user(username, password, name, role):
    user = User.query.filter_by(email=username).first()
    if user:
        if user.provider == "local":
            return None, "Email đã đăng ký bằng tài khoản thường"
        return jsonify({"message": "User đã tồn tại"}), 400

    new_user = User(email=username, name=name, password=password, role=role, provider="local")
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Đăng ký thành công"}), 201


def login_user(username, password):
    user = User.query.filter_by(email=username).first()

    if user.provider == "google":
        return jsonify({"message": "Vui lòng đăng nhập bằng Google"}), 400

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.user_id))

        return jsonify({
            "message": "Đăng nhập thành công",
            "access_token": access_token,
            "user": {
                "id": user.user_id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }), 200

    return jsonify({"message": "Sai tài khoản hoặc mật khẩu"}), 401



def verify_google_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )

        email = idinfo.get("email")
        name = idinfo.get("name")

        if not email:
            return None, "Token không hợp lệ"

        # check user
        user = User.query.filter_by(email=email).first()

        if not user:
            user = User(
                email=email,
                name=name,
                provider="google",
                password=""
            )
            db.session.add(user)
            db.session.commit()

        return user, None

    except Exception as e:
        return None, str(e)

def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if user:
        return {
            "id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    return None
