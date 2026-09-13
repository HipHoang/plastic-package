from app.configs.db import db
from datetime import datetime


class Post(db.Model):
    __tablename__ = "posts"

    post_id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=True
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.product_id"),
        nullable=True
    )

    content = db.Column(
        db.Text
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    comments = db.relationship(
        "Comment",
        backref="post",
        lazy=True,
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "post_id": self.post_id,
            "id": self.post_id,
            "title": None,
            "content": self.content,
            "image": None,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "is_published": True,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updated_at": None,
            "comments": [
                comment.to_dict()
                for comment in self.comments
            ],
        }


class Comment(db.Model):
    __tablename__ = "comments"

    comment_id = db.Column(
        db.Integer,
        primary_key=True
    )

    post_id = db.Column(
        db.Integer,
        db.ForeignKey("posts.post_id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=True
    )

    content = db.Column(
        db.Text,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "comment_id": self.comment_id,
            "id": self.comment_id,
            "post_id": self.post_id,
            "user_id": self.user_id,
            "content": self.content,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }