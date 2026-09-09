from app.configs.db import db
from datetime import datetime


class Enrollment(db.Model):
    __tablename__ = "enrollments"

    enrollment_id = db.Column(
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

    status = db.Column(
        db.String(50),
        default="pending"
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

    payments = db.relationship(
        "Payment",
        backref="enrollment",
        lazy=True
    )

    course = db.relationship(
        "Course",
        backref="enrolled_users"
    )

    user = db.relationship(
        "User",
        backref="enrollments"
    )

    def to_dict(self):
        return {
            "enrollment_id": self.enrollment_id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "status": self.status,
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


class Payment(db.Model):
    __tablename__ = "payments"

    payment_id = db.Column(
        db.Integer,
        primary_key=True
    )

    enrollment_id = db.Column(
        db.Integer,
        db.ForeignKey("enrollments.enrollment_id"),
        nullable=False
    )

    amount = db.Column(
        db.Float,
        nullable=False
    )

    method = db.Column(
        db.String(50)
    )

    status = db.Column(
        db.String(50),
        default="pending"
    )

    transaction_code = db.Column(
        db.String(100),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "payment_id": self.payment_id,
            "enrollment_id": self.enrollment_id,
            "amount": float(self.amount or 0),
            "method": self.method,
            "status": self.status,
            "transaction_code": self.transaction_code,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }