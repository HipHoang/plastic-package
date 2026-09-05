from app.configs.db import db
from datetime import datetime

class Lesson(db.Model):
    __tablename__ = 'lessons'
    lesson_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'))
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    content = db.Column(db.Text)
    video_url = db.Column(db.String(255))
    document_url = db.Column(db.String(255))
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    course = db.relationship('Course', back_populates='lessons')
    documents = db.relationship('Document', backref='lessons', lazy=True)
    quizzes = db.relationship('Quiz', backref='lesson', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'lesson_id': self.lesson_id,
            'course_id': self.course_id,
            'title': self.title,
            'description': self.description,
            'content': self.content,
            'video_url': self.video_url,
            'document_url': self.document_url,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'quiz': self.quizzes[0].to_dict() if self.quizzes else None
        }
