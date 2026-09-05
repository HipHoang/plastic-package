import time
from flask import current_app
from google import genai
from sqlalchemy import or_
from app.models.course import Course
from app.models.chat_message import ChatMessage

_client = None

def get_client():
    global _client

    if _client is None:
        api_key = current_app.config.get("GEMINI_API_KEY")

        if not api_key:
            raise Exception("Missing GEMINI_API_KEY")

        _client = genai.Client(api_key=api_key)

    return _client

def fallback_reply(message):
    msg = message.lower()

    if "khóa" in msg or "course" in msg:
        return "Hiện AI đang bận, bạn có thể xem danh sách khóa học trên hệ thống nhé."

    if "giá" in msg:
        return "Bạn có thể xem giá khóa học trực tiếp trên hệ thống."

    return "AI đang bận, vui lòng thử lại sau."

def search_courses(keyword):
    if not keyword:
        return Course.query.limit(5).all()

    courses = Course.query.filter(
        or_(
            Course.title.ilike(f"%{keyword}%"),
            Course.description.ilike(f"%{keyword}%")
        )
    ).limit(5).all()

    if not courses:
        courses = Course.query.limit(5).all()

    return courses

def get_chat_history(user_id, limit=5):
    messages = ChatMessage.query.filter_by(user_id=user_id) \
        .order_by(ChatMessage.created_at.desc()) \
        .limit(limit) \
        .all()
    messages.reverse()
    return messages

def build_history_text(messages):
    lines = []
    for msg in messages:
        prefix = "user" if msg.role == "user" else "ai"
        lines.append(f"{prefix}: {msg.message}")
    return "\n".join(lines)

def _call_gemini(client, prompt, model):
    return client.models.generate_content(
        model=model,
        contents=prompt
    )

def _try_generate(client, prompt):
    primary = "models/gemini-2.5-flash"
    fallback = "models/gemini-2.0-flash-lite"

    try:
        return _call_gemini(client, prompt, primary)
    except Exception as e:
        error_str = str(e)
        if "503" in error_str or "UNAVAILABLE" in error_str:
            time.sleep(2)
            try:
                return _call_gemini(client, prompt, primary)
            except Exception:
                return _call_gemini(client, prompt, fallback)
        raise

def generate_reply(message, user_id=None):
    try:
        if not message or not message.strip():
            return "Bạn chưa nhập nội dung."

        # 1. Search related courses
        courses = search_courses(message)
        print("USER:", message)
        print("COURSES FOUND:", len(courses))

        if courses:
            course_text = "\n".join([
                f"{c.title} - {c.price} VND - {c.description}"
                for c in courses
            ])
        else:
            course_text = "Có nhiều khóa học lập trình, kỹ năng và ngoại ngữ."

        # 2. Get last 5 chat history messages
        history = ""
        if user_id:
            history_messages = get_chat_history(user_id, limit=5)
            history = build_history_text(history_messages)

        # 3. Build prompt
        prompt = f"""You are an AI course advisor.

Rules:
- Always suggest courses if available
- If no exact match → suggest popular courses
- Keep answer natural and helpful

Courses:
{course_text}

User question:
{message}"""

        client = get_client()

        try:
            response = _try_generate(client, prompt)
        except Exception as e:
            print("Gemini error:", e)
            return fallback_reply(message)

        if not response or not response.text:
            return fallback_reply(message)

        return response.text

    except Exception as e:
        print("Gemini error:", e)
        return fallback_reply(message)

def get_course_recommendations(user_id):
    """Temporary data - replace with ML logic later"""
    from app.models.course import Course
    # Get top 4 courses by rating or random for demo
    courses = Course.query.order_by(Course.course_id).limit(4).all()
    recommendations = []
    for i, course in enumerate(courses, 1):
        recommendations.append({
            "id": i,
            "courseId": course.course_id,
            "title": course.title,
            "instructor": course.instructor.name if course.instructor else "Unknown Instructor",
            "image": course.image or "https://images.unsplash.com/photo-1524178232363-9330c6d9dc9e?w=500&auto=format&fit=crop&q=60",
            "level": course.level or "Cơ bản",
            "matchPercentage": 85 + i * 3,  # Demo 85-94%
            "reason": "Khóa học phù hợp với nền tảng lập trình của bạn"
        })
    return recommendations

