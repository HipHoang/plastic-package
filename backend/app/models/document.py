from app.configs.db import db

class Document(db.Model):
    __tablename__ = 'documents'
    document_id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.lesson_id'))
    file_url = db.Column(db.String(255))