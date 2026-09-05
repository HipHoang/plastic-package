from app.configs.db import db

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    enrollment_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    status = db.Column(db.String(50), default='pending')
    # progress = db.Column(db.Float, default=0.0)
    payments = db.relationship('Payment', backref='enrollment', lazy=True)

    course = db.relationship('Course', backref='enrolled_users')

class Payment(db.Model):
    __tablename__ = 'payments'
    payment_id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey('enrollments.enrollment_id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.String(50))
    status = db.Column(db.String(50))