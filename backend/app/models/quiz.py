from app.configs.db import db

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    quiz_id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.lesson_id'), nullable=False)
    title = db.Column(db.String(255))
    questions = db.relationship('Question', backref='quiz', lazy=True)

    def to_dict(self):
        return {
            'quiz_id': self.quiz_id,
            'lesson_id': self.lesson_id,
            'title': self.title,
            'questions': [q.to_dict() for q in self.questions]
        }

class Question(db.Model):

    __tablename__ = 'questions'
    question_id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.quiz_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    answers = db.relationship('Answer', backref='question', lazy=True)

    def to_dict(self):
        return {
            'question_id': self.question_id,
            'content': self.content,
            'answers': [a.to_dict() for a in self.answers],
            'correct_answer_idx': next((i for i, a in enumerate(self.answers) if a.is_correct), None)
        }

class Answer(db.Model):

    __tablename__ = 'answers'
    answer_id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.question_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'answer_id': self.answer_id,
            'content': self.content,
            'is_correct': self.is_correct
        }
