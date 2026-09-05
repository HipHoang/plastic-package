from app.configs.db import db
from datetime import datetime

class CourseProgress(db.Model):
    __tablename__ = 'course_progress'

    course_progress_id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)

    completed_lessons = db.Column(db.Integer, default=0)
    total_lessons = db.Column(db.Integer, default=0)

    progress_percent = db.Column(db.Float, default=0)

    status = db.Column(
        db.Enum('not_started', 'completed', 'in_progress', name='course_status'),
        default='not_started'
    )

    last_learned_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('student_id', 'course_id', name='unique_student_course'),
    )

    def __repr__(self):
        return f"<CourseProgress student={self.student_id} course={self.course_id}>"