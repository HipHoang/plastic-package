from app.models import Review, Enrollment
from app.configs.db import db
from sqlalchemy import func


def create_or_update_review(
    user_id,
    course_id,
    rating,
    comment
):
    enrollment = Enrollment.query.filter_by(
        user_id=user_id,
        course_id=course_id
    ).first()

    if not enrollment:
        return {
            "error": "Bạn chưa mua sản phẩm này"
        }, 403

    try:
        rating = int(rating)
    except (ValueError, TypeError):
        return {
            "error": "Rating không hợp lệ"
        }, 400

    if rating < 1 or rating > 5:
        return {
            "error": "Rating phải từ 1 đến 5"
        }, 400

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
        "message": "Đánh giá thành công",
        "review": review.to_dict()
    }, 200


def get_reviews_by_course(
    course_id,
    page=1,
    size=10
):
    page = max(int(page), 1)
    size = min(max(int(size), 1), 50)

    query = Review.query.filter_by(
        course_id=course_id
    ).order_by(
        Review.created_at.desc()
    )

    total = query.count()

    reviews = (
        query
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    data = [
        r.to_dict()
        for r in reviews
    ]

    return {
        "page": page,
        "size": size,
        "total": total,
        "total_pages": (
            (total + size - 1) // size
            if total
            else 0
        ),
        "data": data
    }


def delete_review(
    user_id,
    review_id
):
    review = Review.query.get(review_id)

    if not review:
        return {
            "error": "Đánh giá không tồn tại"
        }, 404

    if review.user_id != user_id:
        return {
            "error": "Không có quyền xóa đánh giá"
        }, 403

    db.session.delete(review)
    db.session.commit()

    return {
        "message": "Xóa đánh giá thành công"
    }, 200


def get_course_rating(course_id):
    avg = (
        db.session.query(
            func.avg(Review.rating)
        )
        .filter(
            Review.course_id == course_id
        )
        .scalar()
    )

    count = Review.query.filter_by(
        course_id=course_id
    ).count()

    return {
        "avg_rating": (
            round(float(avg), 1)
            if avg
            else 0
        ),
        "total_reviews": count
    }