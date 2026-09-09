from app.models import Course, Enrollment, Review
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
        sort_by="newest",
        min_price=None,
        max_price=None,
        rating=None,
        is_free=None,
        order=None,
        **kwargs
    ):
        page = max(int(page), 1)
        size = min(max(int(size), 1), 50)

        keyword = kwargs.get("q", keyword)

        avg_rating = func.avg(
            Review.rating
        ).label("avg_rating")

        total_reviews = func.count(
            func.distinct(Review.review_id)
        ).label("total_reviews")

        query = (
            db.session.query(
                Course,
                avg_rating,
                total_reviews
            )
            .outerjoin(
                Review,
                Course.course_id == Review.course_id
            )
            .filter(
                Course.is_active.is_(True),
                Course.is_published.is_(True)
            )
            .group_by(Course.course_id)
        )

        if keyword:
            search = f"%{keyword}%"

            query = query.filter(
                (Course.title.ilike(search))
                | (Course.description.ilike(search))
                | (Course.material.ilike(search))
                | (Course.color.ilike(search))
                | (Course.printing.ilike(search))
                | (Course.usage.ilike(search))
            )

        if category:
            query = query.filter(
                Course.category.ilike(
                    f"%{category}%"
                )
            )

        if level:
            query = query.filter(
                Course.level == level
            )

        if min_price is not None:
            query = query.filter(
                Course.price >= float(min_price)
            )

        if max_price is not None:
            query = query.filter(
                Course.price <= float(max_price)
            )

        if is_free is True:
            query = query.filter(
                Course.price == 0
            )

        elif is_free is False:
            query = query.filter(
                Course.price > 0
            )

        if rating is not None:
            query = query.having(
                avg_rating >= float(rating)
            )

        if sort_by == "price_asc":
            query = query.order_by(
                asc(Course.price)
            )

        elif sort_by == "price_desc":
            query = query.order_by(
                desc(Course.price)
            )

        elif sort_by == "most_popular":
            query = query.order_by(
                desc(total_reviews)
            )

        elif sort_by == "rating":
            query = query.order_by(
                desc(avg_rating)
            )

        elif sort_by == "oldest":
            query = query.order_by(
                asc(Course.course_id)
            )

        else:
            query = query.order_by(
                desc(Course.course_id)
            )

        total = query.count()

        courses = (
            query
            .offset((page - 1) * size)
            .limit(size)
            .all()
        )

        results = []

        for course, avg, count in courses:
            data = course.to_dict()

            data["avg_rating"] = (
                round(float(avg), 1)
                if avg
                else 0
            )

            data["total_reviews"] = count

            results.append(data)

        return {
            "page": page,
            "size": size,
            "total": total,
            "total_pages": (
                (total + size - 1) // size
                if size
                else 0
            ),
            "results": results,
        }

    # =========================
    # CREATE PRODUCT
    # =========================
    @staticmethod
    def add_new_course(
        instructor_id,
        data,
        image_file=None
    ):
        if image_file:
            image_url = upload_image(image_file)
            data["image"] = image_url

        raw_price = data.get("price", 0)

        try:
            price_val = (
                float(raw_price)
                if raw_price not in (
                    None,
                    "",
                    "null",
                    "undefined"
                )
                else 0.0
            )
        except (ValueError, TypeError):
            price_val = 0.0

        try:
            inst_id = int(instructor_id)
        except (ValueError, TypeError):
            inst_id = None

        try:
            min_quantity = int(
                data.get(
                    "min_order_quantity",
                    1
                ) or 1
            )
        except (ValueError, TypeError):
            min_quantity = 1

        min_quantity = max(min_quantity, 1)

        try:
            category_id = (
                int(data.get("category_id"))
                if data.get("category_id")
                else None
            )
        except (ValueError, TypeError):
            category_id = None

        new_course = Course(
            title=data.get("title", ""),
            description=data.get(
                "description",
                ""
            ),
            price=price_val,
            image=data.get("image"),
            instructor_id=inst_id,
            level=data.get("level", ""),
            category=data.get("category", ""),
            category_id=category_id,
            material=data.get("material"),
            thickness=data.get("thickness"),
            width=data.get("width"),
            height=data.get("height"),
            length=data.get("length"),
            color=data.get("color"),
            printing=data.get("printing"),
            usage=data.get("usage"),
            min_order_quantity=min_quantity,
            unit=data.get("unit", "cái"),
            is_active=True,
            is_published=True,
        )

        db.session.add(new_course)
        db.session.commit()

        return new_course

    # =========================
    # UPDATE PRODUCT
    # =========================
    @staticmethod
    def update_course(
        course_id,
        data,
        image_file=None
    ):
        course = Course.query.get(course_id)

        if not course:
            return None

        if image_file:
            course.image = upload_image(image_file)

        fields = [
            "title",
            "description",
            "category",
            "level",
            "material",
            "thickness",
            "width",
            "height",
            "length",
            "color",
            "printing",
            "usage",
            "unit",
        ]

        for field in fields:
            if field in data:
                setattr(
                    course,
                    field,
                    data.get(field)
                )

        if "price" in data:
            try:
                course.price = float(
                    data.get("price")
                )
            except (ValueError, TypeError):
                pass

        if "min_order_quantity" in data:
            try:
                course.min_order_quantity = max(
                    int(
                        data.get(
                            "min_order_quantity"
                        )
                    ),
                    1
                )
            except (ValueError, TypeError):
                pass

        if "category_id" in data:
            try:
                course.category_id = (
                    int(data.get("category_id"))
                    if data.get("category_id")
                    else None
                )
            except (ValueError, TypeError):
                pass

        if "is_active" in data:
            value = data.get("is_active")

            if isinstance(value, str):
                course.is_active = (
                    value.lower()
                    in ["true", "1", "yes", "on"]
                )
            else:
                course.is_active = bool(value)

        if "is_published" in data:
            value = data.get("is_published")

            if isinstance(value, str):
                course.is_published = (
                    value.lower()
                    in ["true", "1", "yes", "on"]
                )
            else:
                course.is_published = bool(value)

        db.session.commit()

        return course

    # =========================
    # DELETE / DEACTIVATE
    # =========================
    @staticmethod
    def deactivate_course(course_id):
        course = Course.query.get(course_id)

        if not course:
            return None

        course.is_active = False
        course.is_published = False

        db.session.commit()

        return course


# =========================
# LEGACY COMPATIBILITY
# =========================
def get_courses_service(
    page=1,
    size=10,
    keyword=None,
    sort="course_id"
):
    return CourseService.search_and_sort_courses(
        page=page,
        size=size,
        keyword=keyword,
        sort_by=(
            "price_asc"
            if sort == "price"
            else "newest"
        )
    )


# =========================
# PRODUCT DETAIL
# =========================
def get_course_detail_service(course_id):
    course = Course.query.get(course_id)

    if not course:
        return None

    avg = (
        db.session.query(
            func.avg(Review.rating)
        )
        .filter(
            Review.course_id == course_id
        )
        .scalar()
    )

    count = (
        Review.query
        .filter_by(course_id=course_id)
        .count()
    )

    data = course.to_dict()

    data.update({
        "course_id": course.course_id,
        "id": course.course_id,
        "product_id": course.course_id,
        "avg_rating": (
            round(float(avg), 1)
            if avg
            else 0
        ),
        "total_reviews": count,
        "manufacturer": "ASIAPP",
        "instructor": {
            "id": course.instructor_id,
            "name": (
                course.instructor.name
                if course.instructor
                else "ASIAPP"
            ),
        },
        "lessons": [],
        "chapters": [],
    })

    return data


# =========================
# USER ORDERS / PURCHASES
# =========================
def get_course_user(user_id):
    enrollments = (
        Enrollment.query
        .filter_by(user_id=user_id)
        .all()
    )

    result = []

    for enroll in enrollments:
        course = enroll.course

        if not course:
            continue

        result.append({
            "id": course.course_id,
            "course_id": course.course_id,
            "product_id": course.course_id,
            "title": course.title,
            "name": course.title,
            "description": course.description,
            "image": course.image,
            "price": float(course.price or 0),
            "quantity": 1,
            "unit": course.unit or "cái",
            "status": enroll.status or "active",
            "course_status": enroll.status or "active",
            "progress_percent": 0,
            "completed_lessons": 0,
            "total_lessons": 0,
        })

    return result


# =========================
# LEGACY ORDER / PURCHASE
# =========================
def enroll_course_service(
    user_id,
    course_id
):
    existing = (
        Enrollment.query
        .filter_by(
            user_id=user_id,
            course_id=course_id
        )
        .first()
    )

    if existing:
        return {
            "message": "Sản phẩm đã được mua"
        }, 200

    course = Course.query.get(course_id)

    if not course:
        return {
            "message": "Không tìm thấy sản phẩm"
        }, 404

    new_enroll = Enrollment(
        user_id=user_id,
        course_id=course_id,
        status="active"
    )

    db.session.add(new_enroll)
    db.session.commit()

    return {
        "message": "Đặt hàng thành công"
    }, 200


def check_enrollment_status(
    user_id,
    course_id
):
    enrollment = (
        Enrollment.query
        .filter_by(
            user_id=user_id,
            course_id=course_id
        )
        .first()
    )

    return enrollment is not None


# =========================
# ADMIN PRODUCT LIST
# =========================
def get_admin_products():
    courses = (
        Course.query
        .order_by(
            Course.course_id.desc()
        )
        .all()
    )

    result = []

    for course in courses:
        order_count = (
            Enrollment.query
            .filter_by(
                course_id=course.course_id
            )
            .count()
        )

        result.append({
            "id": course.course_id,
            "course_id": course.course_id,
            "product_id": course.course_id,
            "title": course.title,
            "name": course.title,
            "description": course.description,
            "students": order_count,
            "orders": order_count,
            "price": float(course.price or 0),
            "status": (
                "Đang bán"
                if course.is_active
                else "Ngừng bán"
            ),
            "is_active": bool(course.is_active),
            "is_published": bool(course.is_published),
            "image": course.image,
            "category": course.category,
            "category_id": course.category_id,
            "material": course.material,
            "thickness": course.thickness,
            "width": course.width,
            "height": course.height,
            "length": course.length,
            "color": course.color,
            "printing": course.printing,
            "usage": course.usage,
            "unit": course.unit or "cái",
            "min_order_quantity": (
                course.min_order_quantity or 1
            ),
            "created_at": (
                course.created_at.isoformat()
                if course.created_at
                else None
            ),
            "updated_at": (
                course.updated_at.isoformat()
                if course.updated_at
                else None
            ),
        })

    return result


# =========================
# LEGACY ADMIN PRODUCT LIST
# =========================
def get_teacher_courses(user_id):
    courses = (
        Course.query
        .filter_by(instructor_id=user_id)
        .order_by(
            Course.course_id.desc()
        )
        .all()
    )

    result = []

    for course in courses:
        order_count = (
            Enrollment.query
            .filter_by(
                course_id=course.course_id
            )
            .count()
        )

        result.append({
            "id": course.course_id,
            "course_id": course.course_id,
            "product_id": course.course_id,
            "title": course.title,
            "name": course.title,
            "students": order_count,
            "orders": order_count,
            "price": float(course.price or 0),
            "status": (
                "Đang bán"
                if course.is_active
                else "Ngừng bán"
            ),
            "image": course.image,
            "category": course.category,
            "material": course.material,
            "unit": course.unit or "cái",
            "min_order_quantity": (
                course.min_order_quantity or 1
            ),
        })

    return result


# =========================
# ADMIN STATISTICS
# =========================
def get_teacher_stats(user_id):
    courses = (
        Course.query
        .filter_by(instructor_id=user_id)
        .all()
    )

    total_courses = len(courses)

    total_students = 0
    total_revenue = 0
    total_rating = 0
    rated_courses = 0

    for course in courses:
        student_count = (
            Enrollment.query
            .filter_by(
                course_id=course.course_id
            )
            .count()
        )

        total_students += student_count

        total_revenue += (
            (course.price or 0)
            * student_count
        )

        avg = (
            db.session.query(
                func.avg(Review.rating)
            )
            .filter(
                Review.course_id
                == course.course_id
            )
            .scalar()
        )

        if avg:
            total_rating += float(avg)
            rated_courses += 1

    avg_rating = (
        round(
            total_rating / rated_courses,
            1
        )
        if rated_courses
        else 0
    )

    return {
        "total_courses": total_courses,
        "total_products": total_courses,
        "total_students": total_students,
        "total_orders": total_students,
        "total_revenue": total_revenue,
        "avg_rating": avg_rating,
    }