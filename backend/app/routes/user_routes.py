from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.response import success_response

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/profile', methods=['GET'])
def profile():
    return {"message": "User profile"}


