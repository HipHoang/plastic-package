from app.configs.db import db
from datetime import datetime


class ProductCategory(db.Model):
    __tablename__ = "product_categories"

    category_id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(255),
        nullable=False
    )

    description = db.Column(db.Text)

    image = db.Column(
        db.String(500)
    )

    is_active = db.Column(
        db.Boolean,
        default=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    products = db.relationship(
        "Product",
        backref="product_category",
        lazy=True
    )

    def to_dict(self):
        return {
            "category_id": self.category_id,
            "id": self.category_id,
            "name": self.name,
            "description": self.description,
            "image": self.image,
            "is_active": self.is_active,
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