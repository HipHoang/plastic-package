from app.configs.db import db
from app.models.user import User
from app.models.quiz import Quiz
from datetime import datetime

class QuizResult(db.Model):
    __tablename__ = 'quiz_results'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.quiz_id'), nullable=False)
    score = db.Column(db.Float, nullable=False)  # e.g., 0.75 for 75%
    passed = db.Column(db.Boolean, default=False)  # True if >= 0.7
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    student = db.relationship('User', backref='quiz_results')
    quiz = db.relationship('Quiz', backref='results')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'quiz_id': self.quiz_id,
            'score': self.score,
            'passed': self.passed,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None
        }
