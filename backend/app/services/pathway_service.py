from app.configs.db import db
from app.models import Enrollment, CourseProgress, Course

def get_user_learning_pathway(user_id):
    try:
        # Fixed JOIN order: FROM Enrollment -> LEFT CourseProgress -> JOIN Course
        pathway = db.session.query(
            Course.course_id.label('id'),
            Course.title,
            Course.description,
            CourseProgress.progress_percent
        ).select_from(Enrollment).\
        outerjoin(
            CourseProgress,
            (Enrollment.user_id == CourseProgress.student_id) & 
            (Enrollment.course_id == CourseProgress.course_id)
        ).\
        join(
            Course,
            Enrollment.course_id == Course.course_id
        ).filter(
            Enrollment.user_id == user_id,
            Enrollment.status == 'active'
        ).order_by(Course.course_id.asc()).all()

        results = []
        for row in pathway:
            progress = row.progress_percent or 0.0
            status = 'completed' if progress >= 100.0 else 'current' if progress > 0 else 'locked'
            desc = (row.description or '')[:100] + '...' if len(row.description or '') > 100 else row.description or 'Learn the basics of this course.'
            results.append({
                'id': int(row.id),
                'title': row.title or 'Untitled Course',
                'status': status,
                'desc': desc
            })

        return results
    except Exception as e:
        print(f"Pathway service error: {str(e)}")
        return []
