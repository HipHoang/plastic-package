from app.configs.db import db
from datetime import datetime

class Course(db.Model):
    __tablename__ = 'courses'
    course_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    image = db.Column(db.String(255))
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    level = db.Column(db.String(50), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    total_duration = db.Column(db.String(50), default="0 giờ")
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


    # Relationships
    instructor = db.relationship('User', backref='courses')
    lessons = db.relationship('Lesson', back_populates='course', lazy=True, order_by='Lesson.order_index')
    
    def to_dict(self):
        return {
            "course_id": self.course_id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "image": self.image,
            "level": self.level,
            "category": self.category,
            "instructor_id": self.instructor_id,
            "instructor_name": self.instructor.name if self.instructor else "Unknown",
            "total_duration": self.total_duration,
            "is_published": self.is_published
        }
