from app.models import Review, Enrollment
from sqlalchemy import asc, desc
from app.configs.db import db
from sqlalchemy import func

def create_or_update_review(user_id, course_id, rating, comment):

    enrollment = Enrollment.query.filter_by(
        user_id=user_id,
        course_id=course_id
    ).first()

    if not enrollment:
        return {"error": "Bạn chưa đăng ký khóa học này"}, 403

    review = Review.query.filter_by(
        user_id=user_id,
        course_id=course_id
    ).first()

    if review:
        review.rating = rating
        review.comment = comment
    else:
        review = Review(
            user_id=user_id,
            course_id=course_id,
            rating=rating,
            comment=comment
        )
        db.session.add(review)

    db.session.commit()

    return {
        "message": "Đánh giá thành công"
    }, 200


def get_reviews_by_course(course_id, page=1, size=10):
    query = Review.query.filter_by(course_id=course_id)
    total = query.count()
    reviews = query.offset((page - 1) * size).limit(size).all()

    data = [
        {
            "review_id": r.review_id,
            "rating": r.rating,
            "comment": r.comment,
            "user": {
                "id": r.user_id,
                "name": r.user.name if r.user else "Unknown"
            }
        }
        for r in reviews
    ]

    return {
        "page": page,
        "size": size,
        "total": total,
        "total_pages": (total + size - 1) // size,
        "data": data
    }


def delete_review(user_id, review_id):
    review = Review.query.get(review_id)

    if not review:
        return {"error": "Review không tồn tại"}, 404

    if review.user_id != user_id:
        return {"error": "Không có quyền xoá"}, 403

    db.session.delete(review)
    db.session.commit()

    return {"message": "Xoá thành công"}


def get_course_rating(course_id):
    avg = db.session.query(func.avg(Review.rating))\
        .filter(Review.course_id == course_id)\
        .scalar()

    count = Review.query.filter_by(course_id=course_id).count()

    return {
        "avg_rating": round(avg, 1) if avg else 0,
        "total_reviews": count
    }