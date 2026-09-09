from app.configs.db import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from enum import Enum


class UserRole(Enum):
    ADMIN = "admin"
    STAFF = "staff"
    CUSTOMER = "customer"


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(255),
        nullable=False
    )

    email = db.Column(
        db.String(255),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=True
    )

    role = db.Column(
        db.Enum(UserRole),
        default=UserRole.CUSTOMER,
        nullable=False
    )

    provider = db.Column(
        db.String(50),
        default="local"
    )

    phone = db.Column(
        db.String(50),
        nullable=True
    )

    address = db.Column(
        db.String(500),
        nullable=True
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

    posts = db.relationship(
        "Post",
        backref="author",
        lazy=True
    )

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        if not self.password:
            return False

        return check_password_hash(
            self.password,
            password
        )

    def to_dict(self):
        return {
            "id": self.user_id,
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "role": self.role.value if self.role else "customer",
            "provider": self.provider,
            "phone": self.phone,
            "address": self.address,
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