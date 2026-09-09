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

    course_id = db.Column(
        db.Integer,
        db.ForeignKey("courses.course_id"),
        nullable=True
    )

    title = db.Column(
        db.String(255),
        nullable=True
    )

    content = db.Column(
        db.Text
    )

    image = db.Column(
        db.String(500),
        nullable=True
    )

    is_published = db.Column(
        db.Boolean,
        default=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
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
            "title": self.title,
            "content": self.content,
            "image": self.image,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "product_id": self.course_id,
            "is_published": self.is_published,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            ),
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

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
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
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            ),
        }