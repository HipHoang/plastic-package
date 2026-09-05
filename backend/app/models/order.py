from app.configs.db import db

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    course_id = db.Column(db.Integer, nullable=False)

    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending')

    order_desc = db.Column(db.String(255))
    vnp_transaction_no = db.Column(db.String(100))

    created_at = db.Column(db.DateTime, server_default=db.func.now())