from app.models import Product, Enrollment, Review, Order
from sqlalchemy import asc, desc, func
from app.configs.db import db
from app.services.cloudinary_service import upload_image


class ProductService:

    @staticmethod
    def search_and_sort_products(
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
        material=None,
        color=None,
        category_id=None,
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
                Product,
                avg_rating,
                total_reviews
            )
            .outerjoin(
                Review,
                Product.product_id == Review.product_id
            )
            .filter(
                Product.is_active.is_(True),
                Product.is_published.is_(True)
            )
            .group_by(Product.product_id)
        )

        if keyword:
            search = f"%{keyword}%"

            query = query.filter(
                (Product.title.ilike(search))
                | (Product.description.ilike(search))
                | (Product.material.ilike(search))
                | (Product.color.ilike(search))
                | (Product.printing.ilike(search))
                | (Product.usage.ilike(search))
            )

        if category:
            query = query.filter(
                Product.category.ilike(
                    f"%{category}%"
                )
            )

        if category_id is not None:
            query = query.filter(
                Product.category_id == int(category_id)
            )

        if material:
            query = query.filter(
                Product.material.ilike(f"%{material}%")
            )

        if color:
            query = query.filter(
                Product.color.ilike(f"%{color}%")
            )

        if level:
            query = query.filter(
                Product.level == level
            )

        if min_price is not None:
            query = query.filter(
                Product.price >= float(min_price)
            )

        if max_price is not None:
            query = query.filter(
                Product.price <= float(max_price)
            )

        if is_free is True:
            query = query.filter(
                Product.price == 0
            )

        elif is_free is False:
            query = query.filter(
                Product.price > 0
            )

        if rating is not None:
            query = query.having(
                avg_rating >= float(rating)
            )

        if sort_by == "price_asc":
            query = query.order_by(
                asc(Product.price)
            )

        elif sort_by == "price_desc":
            query = query.order_by(
                desc(Product.price)
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
                asc(Product.product_id)
            )

        else:
            query = query.order_by(
                desc(Product.product_id)
            )

        total = query.count()

        products = (
            query
            .offset((page - 1) * size)
            .limit(size)
            .all()
        )

        results = []

        for product, avg, count in products:
            data = product.to_dict()

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
    def add_new_product(
        staff_id,
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
            staff_id = int(staff_id)
        except (ValueError, TypeError):
            staff_id = None

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

        new_product = Product(
            title=data.get("title", ""),
            description=data.get(
                "description",
                ""
            ),
            price=price_val,
            image=data.get("image"),
            staff_id=staff_id,
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

        db.session.add(new_product)
        db.session.commit()

        return new_product

    # =========================
    # UPDATE PRODUCT
    # =========================
    @staticmethod
    def update_product(
        product_id,
        data,
        image_file=None
    ):
        product = Product.query.get(product_id)

        if not product:
            return None

        if image_file:
            product.image = upload_image(image_file)

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
                    product,
                    field,
                    data.get(field)
                )

        if "price" in data:
            try:
                product.price = float(
                    data.get("price")
                )
            except (ValueError, TypeError):
                pass

        if "min_order_quantity" in data:
            try:
                product.min_order_quantity = max(
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
                product.category_id = (
                    int(data.get("category_id"))
                    if data.get("category_id")
                    else None
                )
            except (ValueError, TypeError):
                pass

        if "is_active" in data:
            value = data.get("is_active")

            if isinstance(value, str):
                product.is_active = (
                    value.lower()
                    in ["true", "1", "yes", "on"]
                )
            else:
                product.is_active = bool(value)

        if "is_published" in data:
            value = data.get("is_published")

            if isinstance(value, str):
                product.is_published = (
                    value.lower()
                    in ["true", "1", "yes", "on"]
                )
            else:
                product.is_published = bool(value)

        db.session.commit()

        return product

    # =========================
    # DELETE / DEACTIVATE
    # =========================
    @staticmethod
    def deactivate_product(product_id):
        product = Product.query.get(product_id)

        if not product:
            return None

        product.is_active = False
        product.is_published = False

        db.session.commit()

        return product


# =========================
# LEGACY COMPATIBILITY
# =========================
def get_products_service(
    page=1,
    size=10,
    keyword=None,
    sort="product_id"
):
    return ProductService.search_and_sort_products(
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
def get_product_detail_service(product_id):
    product = Product.query.get(product_id)

    if not product:
        return None

    avg = (
        db.session.query(
            func.avg(Review.rating)
        )
        .filter(
            Review.product_id == product_id
        )
        .scalar()
    )

    count = (
        Review.query
        .filter_by(product_id=product_id)
        .count()
    )

    data = product.to_dict()

    data.update({
        "id": product.product_id,
        "product_id": product.product_id,
        "avg_rating": (
            round(float(avg), 1)
            if avg
            else 0
        ),
        "total_reviews": count,
        "manufacturer": "ASIAPP",
        "staff": {
            "id": product.staff_id,
            "name": (
                product.staff.name
                if product.staff
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
def get_customer_products(user_id):
    enrollments = (
        Enrollment.query
        .filter_by(user_id=user_id)
        .all()
    )

    result = []

    for enroll in enrollments:
        product = enroll.product

        if not product:
            continue

        result.append({
            "id": product.product_id,
            "product_id": product.product_id,
            "title": product.title,
            "name": product.title,
            "description": product.description,
            "image": product.image,
            "price": float(product.price or 0),
            "quantity": 1,
            "unit": product.unit or "cái",
            "status": enroll.status or "active",
            "order_status": enroll.status or "active",
            "progress_percent": 0,
            "completed_lessons": 0,
            "total_lessons": 0,
        })

    return result


# =========================
# LEGACY ORDER / PURCHASE
# =========================
def enroll_product_service(
    user_id,
    product_id
):
    existing = (
        Enrollment.query
        .filter_by(
            user_id=user_id,
            product_id=product_id
        )
        .first()
    )

    if existing:
        return {
            "message": "Sản phẩm đã được mua"
        }, 200

    product = Product.query.get(product_id)

    if not product:
        return {
            "message": "Không tìm thấy sản phẩm"
        }, 404

    new_enroll = Enrollment(
        user_id=user_id,
        product_id=product_id,
        status="active"
    )

    db.session.add(new_enroll)
    db.session.commit()

    return {
        "message": "Đặt hàng thành công"
    }, 200


def check_order_status(
    user_id,
    product_id
):
    confirmed_statuses = [
        "paid",
        "success",
        "confirmed",
        "shipping",
        "delivered",
        "completed",
    ]

    return (
        Order.query
        .filter(
            Order.user_id == user_id,
            Order.product_id == product_id,
            Order.status.in_(confirmed_statuses),
        )
        .first()
        is not None
    )


# =========================
# ADMIN PRODUCT LIST
# =========================
def get_admin_products():
    products = (
        Product.query
        .order_by(
            Product.product_id.desc()
        )
        .all()
    )

    result = []

    for product in products:
        order_count = (
            Enrollment.query
            .filter_by(
                product_id=product.product_id
            )
            .count()
        )

        result.append({
            "id": product.product_id,
            "product_id": product.product_id,
            "title": product.title,
            "name": product.title,
            "description": product.description,
            "students": order_count,
            "orders": order_count,
            "price": float(product.price or 0),
            "status": (
                "Đang bán"
                if product.is_active
                else "Ngừng bán"
            ),
            "is_active": bool(product.is_active),
            "is_published": bool(product.is_published),
            "image": product.image,
            "category": product.category,
            "category_id": product.category_id,
            "material": product.material,
            "thickness": product.thickness,
            "width": product.width,
            "height": product.height,
            "length": product.length,
            "color": product.color,
            "printing": product.printing,
            "usage": product.usage,
            "unit": product.unit or "cái",
            "min_order_quantity": (
                product.min_order_quantity or 1
            ),
            "created_at": (
                product.created_at.isoformat()
                if product.created_at
                else None
            ),
            "updated_at": (
                product.updated_at.isoformat()
                if product.updated_at
                else None
            ),
        })

    return result


# =========================
# LEGACY ADMIN PRODUCT LIST
# =========================
def get_staff_products(user_id):
    products = (
        Product.query
        .filter_by(staff_id=user_id)
        .order_by(
            Product.product_id.desc()
        )
        .all()
    )

    result = []

    for product in products:
        order_count = (
            Enrollment.query
            .filter_by(
                product_id=product.product_id
            )
            .count()
        )

        result.append({
            "id": product.product_id,
            "product_id": product.product_id,
            "title": product.title,
            "name": product.title,
            "students": order_count,
            "orders": order_count,
            "price": float(product.price or 0),
            "status": (
                "Đang bán"
                if product.is_active
                else "Ngừng bán"
            ),
            "image": product.image,
            "category": product.category,
            "material": product.material,
            "unit": product.unit or "cái",
            "min_order_quantity": (
                product.min_order_quantity or 1
            ),
        })

    return result


# =========================
# ADMIN STATISTICS
# =========================
def get_staff_stats(user_id):
    products = (
        Product.query
        .filter_by(staff_id=user_id)
        .all()
    )

    total_products = len(products)

    total_students = 0
    total_revenue = 0
    total_rating = 0
    rated_courses = 0

    for product in products:
        student_count = (
            Enrollment.query
            .filter_by(
                product_id=product.product_id
            )
            .count()
        )

        total_students += student_count

        total_revenue += (
            (product.price or 0)
            * student_count
        )

        avg = (
            db.session.query(
                func.avg(Review.rating)
            )
            .filter(
                Review.product_id
                == product.product_id
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
        "total_products": total_products,
        "total_students": total_students,
        "total_orders": total_students,
        "total_revenue": total_revenue,
        "avg_rating": avg_rating,
    }