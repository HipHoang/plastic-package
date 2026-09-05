from app.configs.db import db
from datetime import datetime

class LessonProgress(db.Model):
    __tablename__ = 'lesson_progress'

    lesson_progress_id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.lesson_id'), nullable=False)

    is_completed = db.Column(db.Boolean, default=False)
    completion_percent = db.Column(db.Float, default=0)

    last_accessed_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('student_id', 'lesson_id', name='unique_student_lesson'),
    )

    def __repr__(self):
        return f"<LessonProgress student={self.student_id} lesson={self.lesson_id}>"