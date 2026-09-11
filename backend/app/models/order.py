from app.configs.db import db
from datetime import datetime


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    course_id = db.Column(
        db.Integer,
        db.ForeignKey("courses.course_id"),
        nullable=False
    )
    product_id = db.synonym("course_id")

    amount = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    status = db.Column(
        db.String(50),
        default="pending"
    )

    order_desc = db.Column(
        db.String(500)
    )

    vnp_transaction_no = db.Column(
        db.String(100)
    )

    payment_method = db.Column(
        db.String(50)
    )

    customer_name = db.Column(
        db.String(255)
    )

    customer_phone = db.Column(
        db.String(50)
    )

    customer_email = db.Column(
        db.String(255)
    )

    customer_address = db.Column(
        db.String(500)
    )

    quantity = db.Column(
        db.Integer,
        default=1
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

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "product_id": self.course_id,
            "amount": float(self.amount or 0),
            "quantity": self.quantity or 1,
            "status": self.status,
            "order_desc": self.order_desc,
            "payment_method": self.payment_method,
            "vnp_transaction_no": self.vnp_transaction_no,
            "customer_name": self.customer_name,
            "customer_phone": self.customer_phone,
            "customer_email": self.customer_email,
            "customer_address": self.customer_address,
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
