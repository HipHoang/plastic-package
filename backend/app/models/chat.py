from app.configs.db import db
from datetime import datetime


class Conversation(db.Model):
    __tablename__ = 'conversations'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship('ConversationUser', backref='conversation', lazy=True, cascade='all, delete-orphan')
    messages = db.relationship('Message', backref='conversation', lazy=True, cascade='all, delete-orphan')


class ConversationUser(db.Model):
    __tablename__ = 'conversation_users'

    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship('User', backref='messages_sent')

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "sender_id": self.sender_id,
            "sender_name": self.sender.name if self.sender else None,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

