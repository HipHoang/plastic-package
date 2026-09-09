from app.configs.db import db
from datetime import datetime


class Course(db.Model):
    __tablename__ = "courses"

    course_id = db.Column(db.Integer, primary_key=True)

    # =========================
    # PRODUCT BASIC INFO
    # =========================
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, default=0)
    image = db.Column(db.String(500))

    # Giữ lại để tương thích hệ thống cũ
    instructor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=True
    )

    level = db.Column(db.String(50), nullable=True)
    category = db.Column(db.String(100), nullable=True)

    total_duration = db.Column(
        db.String(50),
        default="0"
    )

    is_published = db.Column(
        db.Boolean,
        default=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # =========================
    # PRODUCT CATEGORY
    # =========================
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("product_categories.category_id"),
        nullable=True
    )

    # =========================
    # PRODUCT SPECIFICATIONS
    # =========================
    material = db.Column(db.String(255))
    thickness = db.Column(db.String(50))
    width = db.Column(db.String(50))
    height = db.Column(db.String(50))
    length = db.Column(db.String(50))

    color = db.Column(db.String(100))
    printing = db.Column(db.String(255))

    usage = db.Column(db.Text)

    min_order_quantity = db.Column(
        db.Integer,
        default=1
    )

    unit = db.Column(
        db.String(50),
        default="cái"
    )

    # =========================
    # STATUS
    # =========================
    is_active = db.Column(
        db.Boolean,
        default=True
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # =========================
    # RELATIONSHIPS
    # =========================
    instructor = db.relationship(
        "User",
        backref="courses"
    )

    # Không còn phụ thuộc Lesson
    # vì hệ thống đã chuyển sang sản phẩm.
    # =========================
    # SERIALIZATION
    # =========================
    def to_dict(self):
        return {
            "course_id": self.course_id,
            "id": self.course_id,
            "product_id": self.course_id,

            "title": self.title,
            "name": self.title,

            "description": self.description,

            "price": float(self.price or 0),

            "image": self.image,

            "category_id": self.category_id,
            "category": self.category,

            "material": self.material,
            "thickness": self.thickness,
            "width": self.width,
            "height": self.height,
            "length": self.length,

            "color": self.color,
            "printing": self.printing,
            "usage": self.usage,

            "min_order_quantity": self.min_order_quantity or 1,
            "unit": self.unit or "cái",

            "level": self.level,

            "is_published": self.is_published,
            "is_active": self.is_active,

            "instructor_id": self.instructor_id,
            "instructor_name": (
                self.instructor.name
                if self.instructor
                else "ASIAPP"
            ),

            "manufacturer": "ASIAPP",

            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),

            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            ),
        }