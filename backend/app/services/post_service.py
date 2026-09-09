from app.models import Post, Enrollment, Comment
from app.configs.db import db


def create_post(user_id, course_id, content, title=None, image=None):
    enrollment = Enrollment.query.filter_by(
        user_id=user_id,
        course_id=course_id
    ).first()

    if not enrollment:
        return {
            "error": "Bạn chưa mua sản phẩm này"
        }, 403

    if not content:
        return {
            "error": "Nội dung không được để trống"
        }, 400

    post = Post(
        user_id=user_id,
        course_id=course_id,
        title=title,
        content=content,
        image=image,
        is_published=True
    )

    db.session.add(post)
    db.session.commit()

    return {
        "message": "Đăng bài thành công",
        "post_id": post.post_id,
        "post": post.to_dict()
    }, 201


def get_posts_by_course(course_id, page=1, size=10):
    page = max(int(page), 1)
    size = min(max(int(size), 1), 50)

    query = Post.query.filter_by(
        course_id=course_id,
        is_published=True
    )

    total = query.count()

    posts = (
        query
        .order_by(Post.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return {
        "page": page,
        "size": size,
        "total": total,
        "total_pages": (
            (total + size - 1) // size
            if total
            else 0
        ),
        "data": [
            {
                "post_id": post.post_id,
                "id": post.post_id,
                "title": post.title,
                "content": post.content,
                "image": post.image,
                "course_id": post.course_id,
                "product_id": post.course_id,
                "created_at": (
                    post.created_at.isoformat()
                    if post.created_at
                    else None
                ),
                "user": {
                    "id": post.user_id,
                    "name": (
                        post.author.name
                        if post.author
                        else "Unknown"
                    )
                },
            }
            for post in posts
        ]
    }


def create_comment(user_id, post_id, content):
    if not content:
        return {
            "error": "Nội dung bình luận không được để trống"
        }, 400

    post = Post.query.get(post_id)

    if not post:
        return {
            "error": "Bài viết không tồn tại"
        }, 404

    comment = Comment(
        user_id=user_id,
        post_id=post_id,
        content=content
    )

    db.session.add(comment)
    db.session.commit()

    return {
        "message": "Bình luận thành công",
        "comment": comment.to_dict()
    }, 201


def get_comments_by_post(post_id, page=1, size=10):
    page = max(int(page), 1)
    size = min(max(int(size), 1), 50)

    query = Comment.query.filter_by(
        post_id=post_id
    )

    total = query.count()

    comments = (
        query
        .order_by(Comment.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return {
        "page": page,
        "size": size,
        "total": total,
        "total_pages": (
            (total + size - 1) // size
            if total
            else 0
        ),
        "data": [
            comment.to_dict()
            for comment in comments
        ]
    }