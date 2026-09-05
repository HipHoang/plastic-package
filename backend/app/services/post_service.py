from app.models import Post, Enrollment, Comment
from app.configs.db import db
from sqlalchemy import desc

def create_post(user_id, course_id, content):

    enrollment = Enrollment.query.filter_by(
        user_id=user_id,
        course_id=course_id
    ).first()

    if not enrollment:
        return {"error": "Bạn chưa đăng ký khóa học"}, 403

    post = Post(
        user_id=user_id,
        course_id=course_id,
        content=content
    )

    db.session.add(post)
    db.session.commit()

    return {
        "message": "Đăng bài thành công",
        "post_id": post.post_id
    }, 201

def get_posts_by_course(course_id, page=1, size=10):
    query = Post.query.filter_by(course_id=course_id)

    total = query.count()

    posts = query.order_by(desc(Post.created_at))\
        .offset((page - 1) * size)\
        .limit(size)\
        .all()

    data = [
        {
            "post_id": p.post_id,
            "content": p.content,
            "created_at": p.created_at,
            "user": {
                "id": p.user_id,
                "name": p.user.name if p.user else "Unknown"
            }
        }
        for p in posts
    ]

    return {
        "page": page,
        "size": size,
        "total": total,
        "total_pages": (total + size - 1) // size,
        "data": data
    }

def create_comment(user_id, post_id, content):
    comment = Comment(
        user_id=user_id,
        post_id=post_id,
        content=content
    )

    db.session.add(comment)
    db.session.commit()

    return {"message": "Comment thành công"}, 201

def get_comments_by_post(post_id, page=1, size=10):
    query = Comment.query.filter_by(post_id=post_id)

    total = query.count()

    comments = query.order_by(Comment.created_at.desc()) \
        .offset((page - 1) * size) \
        .limit(size) \
        .all()

    data = [
        {
            "comment_id": c.comment_id,
            "content": c.content,
            "created_at": c.created_at,
            "user": {
                "id": c.user_id,
                "name": c.user.name if c.user else "Unknown"
            }
        }
        for c in comments
    ]

    return {
        "page": page,
        "size": size,
        "total": total,
        "total_pages": (total + size - 1) // size,
        "data": data
    }