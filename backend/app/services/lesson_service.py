from datetime import datetime
from app.configs.db import db
from app.models import LessonProgress, Lesson, CourseProgress
from sqlalchemy import func

def get_lessons_by_course(course_id):
    """Get all lessons for a course, sorted by order_index"""
    lessons = Lesson.query.filter_by(course_id=course_id).order_by(Lesson.order_index.asc()).all()
    return [lesson.to_dict() for lesson in lessons]

def create_lesson(course_id, data):
    """Create a new lesson for a course"""
    # Get max order_index
    max_order = db.session.query(func.max(Lesson.order_index)).filter_by(course_id=course_id).scalar()
    new_order = (max_order or 0) + 1
    
    lesson = Lesson(
        course_id=course_id,
        title=data.get('title'),
        description=data.get('description'),
        content=data.get('content'),
        video_url=data.get('video_url'),
        document_url=data.get('document_url'),
        order_index=data.get('order_index', new_order)
    )
    
    db.session.add(lesson)
    db.session.commit()
    
    return lesson.to_dict()

def update_lesson(lesson_id, data):
    """Update an existing lesson"""
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return None
    
    if 'title' in data and data['title']:
        lesson.title = data['title']
    if 'description' in data:
        lesson.description = data['description']
    if 'content' in data:
        lesson.content = data['content']
    if 'video_url' in data:
        lesson.video_url = data['video_url']
    if 'document_url' in data:
        lesson.document_url = data['document_url']
    if 'order_index' in data:
        lesson.order_index = data['order_index']
    
    db.session.commit()
    return lesson.to_dict()

def delete_lesson(lesson_id):
    """Delete a lesson"""
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return False
    
    db.session.delete(lesson)
    db.session.commit()
    return True

def get_lesson_by_id(lesson_id):
    """Get a single lesson by ID"""
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return None
    return lesson.to_dict()

# ========== EXISTING FUNCTIONS ==========

def complete_lesson(student_id, lesson_id):
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return {"error": "Lesson not found"}, 404

    course_id = lesson.course_id

    lp = LessonProgress.query.filter_by(
        student_id=student_id,
        course_id=course_id,
        lesson_id=lesson_id
    ).first()

    if not lp:
        lp = LessonProgress(
            student_id=student_id,
            course_id=course_id,
            lesson_id=lesson_id
        )

    lp.is_completed = True
    lp.completion_percent = 100
    lp.completed_at = datetime.utcnow()
    lp.last_accessed_at = datetime.utcnow()

    db.session.add(lp)
    db.session.commit()

    total_lessons = db.session.query(func.count(Lesson.lesson_id)) \
        .filter(Lesson.course_id == course_id).scalar()

    completed_lessons = db.session.query(func.count(LessonProgress.lesson_id)) \
        .filter(
            LessonProgress.student_id == student_id,
            LessonProgress.course_id == course_id,
            LessonProgress.is_completed == True
        ).scalar()

    progress_percent = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0

    cp = CourseProgress.query.filter_by(
        student_id=student_id,
        course_id=course_id
    ).first()

    if not cp:
        cp = CourseProgress(
            student_id=student_id,
            course_id=course_id
        )

    cp.total_lessons = total_lessons
    cp.completed_lessons = completed_lessons
    cp.progress_percent = progress_percent
    cp.last_learned_at = datetime.utcnow()

    if progress_percent == 0:
        cp.status = 'not_started'
    elif progress_percent == 100:
        cp.status = 'completed'
    else:
        cp.status = 'in_progress'

    db.session.add(cp)
    db.session.commit()

    return {
        "message": "Lesson completed",
        "progress_percent": progress_percent
    }, 200
