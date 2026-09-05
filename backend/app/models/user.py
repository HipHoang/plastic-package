from app.configs.db import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from enum import Enum as EnumRole

class UserRole(EnumRole):
    GV = "GiangVien",
    HV = "student"

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(50),db.Enum(UserRole), default='student',)
    provider = db.Column(db.String(50), default="local")
    # Relationships
    enrollments = db.relationship('Enrollment', backref='user', lazy=True)
    posts = db.relationship('Post', backref='author', lazy=True)

    def set_password(self, password):
        """Hàm này dùng để băm mật khẩu và lưu vào database"""
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """Hàm này dùng để kiểm tra mật khẩu khi login"""
        return check_password_hash(self.password, password)