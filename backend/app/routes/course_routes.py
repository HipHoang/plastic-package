from flask import Blueprint, jsonify, request
from app.services.course_service import CourseService, get_courses_service, get_course_detail_service, get_course_user, enroll_course_service, check_enrollment_status, get_teacher_courses, get_teacher_stats
from app.utils.response import success_response, error_response
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.configs.db import db
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

# ✅ Khai báo 1 lần duy nhất
course_bp = Blueprint('course_bp', __name__)


# =========================
# SEARCH COURSE
# =========================
@course_bp.route('/search', methods=['GET'])
def search():
    try:
        data = CourseService.search_and_sort_courses(
            page=request.args.get('page', 1, type=int),
            size=min(request.args.get('size', 10, type=int), 50),
            keyword=request.args.get('q'),
            category=request.args.get('category'),
            level=request.args.get('level'),
            sort_by=request.args.get('sort_by', 'newest'),
            min_price=request.args.get('min_price', type=float),
            max_price=request.args.get('max_price', type=float),
            rating=request.args.get('rating', type=float),
            is_free=request.args.get('is_free', type=lambda v: v.lower() == 'true' if v else None),
        )

        return success_response(data=data)

    except Exception as e:
        return error_response(str(e), 500)

# =========================
# GET TEACHER COURSES
# =========================
@course_bp.route('/instructor', methods=['GET'])
@jwt_required()
def get_instructor_courses():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return error_response("Chưa đăng nhập", 401)

        data = get_teacher_courses(int(user_id))
        return success_response(data, "Lấy danh sách khóa học của giảng viên thành công", 200)

    except Exception as e:
        return error_response(str(e), 500)

# =========================
# GET TEACHER STATS
# =========================
@course_bp.route('/instructor/stats', methods=['GET'])
@jwt_required()
def get_instructor_stats():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return error_response("Chưa đăng nhập", 401)

        data = get_teacher_stats(int(user_id))
        return success_response(data, "Lấy thống kê giảng viên thành công", 200)

    except Exception as e:
        return error_response(str(e), 500)


# =========================
# GET ALL COURSES
# =========================
@course_bp.route('/', methods=['GET'])
def get_courses():
    try:
        page = request.args.get('page', 1, type=int)
        size = min(request.args.get('size', 10, type=int), 50)

        keyword = request.args.get('q')
        category=request.args.get('category')
        sort_by = request.args.get('sort_by', 'id')
        order = request.args.get('order', 'asc')

        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        rating = request.args.get('rating', type=float)

        is_free = request.args.get('is_free')
        if is_free is not None:
            is_free = is_free.lower() == 'true'

        has_review = request.args.get('has_review')
        if has_review is not None:
            has_review = has_review.lower() == 'true'

        data = CourseService.search_and_sort_courses(
            page=page,
            size=size,
            keyword=keyword,
            category=category,
            sort_by=sort_by,
            order=order,
            min_price=min_price,
            max_price=max_price,
            rating=rating,
            has_review=has_review,
            is_free=is_free
        )

        return success_response(data,"Lấy danh sách khóa học thành công",200)

    except Exception as e:
        return jsonify({"message": str(e)}), 500


# =========================
# GET COURSE DETAIL
# =========================
@course_bp.route('/<int:course_id>', methods=['GET'])
def get_course_detail(course_id):
    data = get_course_detail_service(course_id)

    if not data:
        return jsonify({"message": "Course not found"}), 404

    return success_response(data=data,message="Lấy chi tiết khóa học thành công",status_code=200)


@course_bp.route('/<int:course_id>/detail-with-lessons', methods=['GET'])
def get_course_detail_with_lessons(course_id):
    """Get course detail with all lessons"""
    try:
        from app.services.lesson_service import get_lessons_by_course
        
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"message": "Course not found"}), 404
        
        lessons = get_lessons_by_course(course_id)
        
        data = {
            "course": course.to_dict(),
            "lessons": lessons
        }
        
        return success_response(data=data)
    except Exception as e:
        return error_response(str(e), 500)


# =========================
# GET MY COURSES
# =========================
@course_bp.route('/my-courses', methods=['GET'])
@jwt_required()
def get_my_courses():
    user_id = get_jwt_identity()

    data = get_course_user(user_id)

    return jsonify(data), 200

@course_bp.route('/enroll', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def enroll_course():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"message": "Token missing or invalid"}), 401

        data = request.get_json()
        course_id = data.get('course_id')
        if not course_id:
            return jsonify({"message": "Missing data"}), 400

        result, status = enroll_course_service(user_id, course_id)

        return jsonify(result), status

    except Exception as e:
        return jsonify({"message": str(e)}), 500

@course_bp.route('/<int:course_id>/check-enrollment', methods=['GET'])
@jwt_required(optional=True)
def check_enrollment(course_id):
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({
                "success": True,
                "data": {
                    "isEnrolled": False
                }
            }), 200
        
        is_enrolled = check_enrollment_status(int(user_id), course_id)

        return jsonify({
            "success": True,
            "data": {
                "isEnrolled": is_enrolled
            }
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# =========================
# GET PROGRESS
# =========================
@course_bp.route('/progress/<int:course_id>', methods=['GET', 'OPTIONS'])
def get_learning_progress(course_id):
    if request.method == 'OPTIONS': return '', 200
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
    except:
        return jsonify({'msg': 'Missing token'}), 401

    # 3. Gọi service lấy data
    result = CourseService.get_progress(user_id, course_id)
    return jsonify(result), 200

# =========================
# ADD NEW COURSE
# =========================
@course_bp.route("/", methods=["POST", "OPTIONS"])
@jwt_required()
def add_course():
    if request.method == "OPTIONS":
        return "", 200

    try:
        instructor_id = get_jwt_identity()
        if not instructor_id:
            return error_response("Chưa đăng nhập", 401)

        # Lấy dữ liệu từ form-data (bao gồm cả file ảnh)
        data = request.form.to_dict()
        image_file = request.files.get("image")

        # Bổ sung instructor_id từ JWT

        new_course = CourseService.add_new_course(instructor_id, data, image_file)
        return success_response(new_course.to_dict(), "Tạo khóa học thành công", 201)

    except Exception as e:
        return error_response(str(e), 500)
