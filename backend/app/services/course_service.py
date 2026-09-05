# app/services/course_service.py
from app.models import Course, Enrollment, CourseProgress, Lesson, Review
from sqlalchemy import asc, desc, func
from app.configs.db import db
from app.services.cloudinary_service import upload_image

class CourseService:
    @staticmethod
    def search_and_sort_courses(
        page=1,
        size=10,
        keyword=None,
        category=None,
        level=None,
        sort_by='newest',
        min_price=None,
        max_price=None,
        rating=None,
        is_free=None,
        order=None,
        **kwargs
    ):
        avg_rating = func.avg(Review.rating).label("avg_rating")
        total_reviews = func.count(func.distinct(Review.review_id)).label("total_reviews")

        query = db.session.query(
            Course,
            avg_rating,
            total_reviews
        ).outerjoin(Review, Course.course_id == Review.course_id)

        query = query.group_by(Course.course_id)
        keyword = kwargs.get('q', keyword)
        # SEARCH
        if keyword:
            query = query.filter(
                (Course.title.ilike(f'%{keyword}%')) |
                (Course.description.ilike(f'%{keyword}%'))
            )

        # CATEGORY
        if category:
            query = query.filter(Course.category.ilike(f'%{category}%'))

        # LEVEL
        if level:
            query = query.filter(Course.level == level)

        # PRICE
        if min_price is not None:
            query = query.filter(Course.price >= min_price)

        if max_price is not None:
            query = query.filter(Course.price <= max_price)

        if is_free is True:
            query = query.filter(Course.price == 0)
        elif is_free is False:
            query = query.filter(Course.price > 0)

        # RATING
        if rating is not None:
            query = query.having(avg_rating >= rating)

        # SORT
        if sort_by == "price_asc":
            query = query.order_by(asc(Course.price))
        elif sort_by == "price_desc":
            query = query.order_by(desc(Course.price))
        elif sort_by == "most_popular":
            query = query.order_by(desc(total_reviews))
        else:  # newest
            query = query.order_by(desc(Course.course_id))

        # PAGINATION
        total = query.count()
        offset = (page - 1) * size
        courses = query.offset(offset).limit(size).all()

        return {
            "page": page,
            "size": size,
            "total": total,
            "results": [
                {
                    **course.to_dict(),
                    "avg_rating": round(avg, 1) if avg else 0,
                    "total_reviews": count
                }
                for course, avg, count in courses
            ]
        }

    @staticmethod
    def get_progress(student_id, course_id):
        progress = CourseProgress.query.filter_by(
            student_id=student_id,
            course_id=course_id
        ).first()

        if not progress:
            return {
                "progress": 0,
                "completedLessons": 0,
                "currentLessonId": None
            }

        return {
            "progress": progress.progress_percent,
            "completedLessons": progress.completed_lessons,
            "currentLessonId": None
        }

    @staticmethod
    def add_new_course(instructor_id, data, image_file=None):
        # Xử lý upload ảnh nếu có
        if image_file:
            image_url = upload_image(image_file)
            data["image"] = image_url

        # Parse price an toàn — tránh crash khi giá trị là "" hoặc None
        raw_price = data.get("price", 0)
        try:
            price_val = float(raw_price) if raw_price not in (None, "", "null", "undefined") else 0.0
        except (ValueError, TypeError):
            price_val = 0.0

        # Ép kiểu instructor_id từ JWT (thường là str) sang int
        try:
            inst_id = int(instructor_id)
        except (ValueError, TypeError):
            inst_id = None

        # Tạo đối tượng Course mới
        new_course = Course(
            title=data.get("title", ""),
            description=data.get("description", ""),
            price=price_val,
            image=data.get("image", None),
            instructor_id=inst_id,
            level=data.get("level", ""),
            category=data.get("category", ""),
        )

        db.session.add(new_course)
        db.session.commit()

        return new_course


def get_courses_service(page=1, size=10, keyword=None, sort='id'):
    query = db.session.query(
        Course,
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.review_id).label("total_reviews")
    ).outerjoin(Review, Course.course_id == Review.course_id)
    
    # Search
    if keyword:
        query = query.filter(Course.title.contains(keyword))
    
    # Sort
    if hasattr(Course, sort):
        query = query.order_by(getattr(Course, sort))
    
    # Pagination logic
    total = query.count()
    courses = query.offset((page - 1) * size).limit(size).all()

    results = []
    for course, avg, count in courses:
        data = course.to_dict()
        data["avg_rating"] = round(avg, 1) if avg else 0
        data["total_reviews"] = count
        results.append(data)

    return {
        "page": page,
        "size": size,
        "total": total,
        "total_pages": (total + size - 1) // size,
        "results": results
    }


def get_course_detail_service(course_id):
    course = Course.query.get(course_id)
    if not course:
        return None

    avg = db.session.query(func.avg(Review.rating)) \
        .filter(Review.course_id == course_id) \
        .scalar()
    count = Review.query.filter_by(course_id=course_id).count()

    return {
        "course_id": course.course_id,
        "title": course.title,
        "description": course.description,
        "price": course.price,
        "image": course.image,
        "avg_rating": round(avg, 1) if avg else 0,
        "total_reviews": count,
        "instructor": {
            "id": course.instructor_id,
            "name": course.instructor.name if course.instructor else "Unknown"
        },
        "lessons": [
            {
                "lesson_id": lesson.lesson_id,
                "title": lesson.title,
                "content": lesson.content,
                "video_url": lesson.video_url,
                "documents": [
                    {
                        "document_id": doc.document_id,
                        "file_url": doc.file_url
                    }
                    for doc in lesson.documents
                ]
            }
            for lesson in course.lessons
        ]
    }


def get_course_user(user_id):
    enrollments = Enrollment.query.filter_by(user_id=user_id).all()
    result = []

    for enroll in enrollments:
        course = enroll.course
        progress = CourseProgress.query.filter_by(
            student_id=user_id,
            course_id=course.course_id
        ).first()

        result.append({
            "id": course.course_id,
            "title": course.title,
            "description": course.description,
            "image": course.image,
            "progress_percent": progress.progress_percent if progress else 0,
            "completed_lessons": progress.completed_lessons if progress else 0,
            "total_lessons": progress.total_lessons if progress else 0,
            "course_status": progress.status if progress else "not_started"
        })

    return result

def enroll_course_service(user_id, course_id):
    print("Enroll request:", user_id, course_id)
    existing = Enrollment.query.filter_by(
        user_id=user_id,
        course_id=course_id
    ).first()

    if existing:
        return {"message": "Already enrolled"}, 200

    new_enroll = Enrollment(
        user_id=user_id,
        course_id=course_id,
        status="active"
    )
    db.session.add(new_enroll)

    total_lessons = Lesson.query.filter_by(course_id=course_id).count()

    new_progress = CourseProgress(
        student_id=user_id,
        course_id=course_id,
        total_lessons=total_lessons,
        completed_lessons=0,
        progress_percent=0,
        status="not_started"
    )
    db.session.add(new_progress)
    db.session.commit()

    return {"message": "Enroll success"}, 200

def check_enrollment_status(user_id, course_id):
    enrollment = Enrollment.query.filter_by(
        user_id=user_id,
        course_id=course_id
    ).first()

    return enrollment is not None


def get_teacher_courses(user_id):
    courses = Course.query.filter_by(instructor_id=user_id).all()
    result = []
    for course in courses:
        student_count = Enrollment.query.filter_by(course_id=course.course_id).count()
        result.append({
            "id": course.course_id,
            "title": course.title,
            "students": student_count,
            "price": course.price,
            "status": "Đã xuất bản",
            "image": course.image,
        })
    return result


def get_teacher_stats(user_id):
    courses = Course.query.filter_by(instructor_id=user_id).all()
    total_courses = len(courses)
    total_students = 0
    total_revenue = 0
    total_rating = 0
    rated_courses = 0

    for course in courses:
        student_count = Enrollment.query.filter_by(course_id=course.course_id).count()
        total_students += student_count
        total_revenue += course.price * student_count

        avg = db.session.query(func.avg(Review.rating)) \
            .filter(Review.course_id == course.course_id) \
            .scalar()
        if avg:
            total_rating += avg
            rated_courses += 1

    avg_rating = round(total_rating / rated_courses, 1) if rated_courses > 0 else 0

    return {
        "total_courses": total_courses,
        "total_students": total_students,
        "total_revenue": total_revenue,
        "avg_rating": avg_rating,
    }
