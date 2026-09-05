from flask import Blueprint, request, jsonify
from app.services.review_service import get_reviews_by_course,create_or_update_review
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.response import success_response, error_response

review_bp = Blueprint('review_bp', __name__)

@review_bp.route('/courses/<int:course_id>', methods=['GET'])
def get_reviews(course_id):
    page = int(request.args.get('page', 1))
    size = int(request.args.get('size', 10))

    data = get_reviews_by_course(course_id, page, size)

    return success_response(data,"Lấy đánh giá khóa học thành công")

@review_bp.route('/courses/<int:course_id>', methods=['POST'])
@jwt_required()
def create_review(course_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        rating = data.get("rating")
        comment = data.get("comment")

        # validate
        try:
            rating = int(rating)
            if not (1 <= rating <= 5):
                return error_response("Rating phải từ 1 đến 5", 400)
        except (TypeError, ValueError):
            return error_response("Rating phải là số", 400)

        result, status = create_or_update_review(
            user_id=user_id,
            course_id=course_id,
            rating=rating,
            comment=comment
        )
        if status != 200:
            return error_response(result.get("error"), status_code=status)

        return success_response(result, "Đánh giá thành công")

    except Exception as e:
        return error_response(str(e), 500)