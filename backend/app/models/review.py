from app.configs.db import db
from datetime import datetime


class Review(db.Model):
    __tablename__ = "reviews"

    review_id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.product_id"),
        nullable=False
    )

    rating = db.Column(
        db.Integer,
        nullable=False
    )

    comment = db.Column(
        db.Text
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

    __table_args__ = (
        db.UniqueConstraint(
            "product_id",
            "user_id",
            name="unique_user_review"
        ),
    )

    product = db.relationship(
        "Product",
        backref="reviews",
        lazy=True
    )

    user = db.relationship(
        "User",
        backref="reviews",
        lazy=True
    )

    def to_dict(self):
        return {
            "review_id": self.review_id,
            "id": self.review_id,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "rating": self.rating,
            "comment": self.comment,
            "user_name": (
                self.user.name
                if self.user
                else None
            ),
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