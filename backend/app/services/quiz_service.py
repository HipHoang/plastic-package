from app.configs.db import db
from app.models import Lesson, Quiz, Question, Answer, QuizResult

def create_quiz_for_lesson(lesson_id, title, questions_data):
    """questions_data = [{'content': str, 'options': [str,str,str,str], 'correct_idx': int 0-3}]"""
    lesson = Lesson.query.get(lesson_id)
    if not lesson:
        return None, 'Lesson not found'

    quiz = Quiz(lesson_id=lesson_id, title=title)
    db.session.add(quiz)
    db.session.flush()

    for q_data in questions_data:
        question = Question(quiz_id=quiz.quiz_id, content=q_data['content'])
        db.session.add(question)
        db.session.flush()

        for i, content in enumerate(q_data['options']):
            answer = Answer(
                question_id=question.question_id,
                content=content,
                is_correct=(i == q_data['correct_idx'])
            )
            db.session.add(answer)

    db.session.commit()
    return quiz.to_dict(), 'Success'

def get_quiz_by_lesson(lesson_id):
    lesson = Lesson.query.get(lesson_id)
    if lesson and lesson.quizzes:
        # Nếu lesson.quizzes là list, lấy phần tử đầu tiên
        quiz = lesson.quizzes[0] if isinstance(lesson.quizzes, list) else lesson.quizzes
        return quiz.to_dict()
    return None

def submit_quiz(student_id, quiz_id, answers):
    """answers = {question_id: selected_idx}"""
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return None, 'Quiz not found'

    total = len(quiz.questions)
    score = 0

    for q in quiz.questions:
        # Lấy đáp án đã chọn từ dict answers dựa trên ID câu hỏi
        selected_idx = answers.get(str(q.question_id))
        
        # Tìm index của đáp án đúng trong danh sách answers của câu hỏi
        correct_idx = None
        for i, ans in enumerate(q.answers):
            if ans.is_correct:
                correct_idx = i
                break
        
        if selected_idx is not None and int(selected_idx) == correct_idx:
            score += 1

    score_percent = score / total if total else 0
    passed = score_percent >= 0.7

    result = QuizResult(
        student_id=student_id,
        quiz_id=quiz_id,
        score=score_percent,
        passed=passed
    )
    db.session.add(result)
    db.session.commit()

    return {
        'score': score_percent,
        'passed': passed,
        'total_questions': total,
        'correct': score,
        'message': 'Passed!' if passed else 'Review & retry'
    }
