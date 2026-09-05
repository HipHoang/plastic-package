from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ai_service import generate_reply, get_course_recommendations
from app.models.chat_message import ChatMessage
from app.configs.db import db
from app.utils.response import success_response, error_response

ai_bp = Blueprint('ai_bp', __name__)


@ai_bp.route('/chat', methods=['POST'])
@jwt_required(optional=True)
def chat():
    try:
        data = request.get_json()
        message = data.get('message')
        if not message:
            return error_response('Missing message', 400)

        user_id = get_jwt_identity()
        user_id_int = int(user_id) if user_id else None

        # 1. Save user message if logged in
        if user_id_int:
            user_msg = ChatMessage(
                user_id=user_id_int,
                role='user',
                message=message
            )
            db.session.add(user_msg)
            db.session.commit()

        # 2. Generate AI reply
        reply = generate_reply(message, user_id=user_id_int)

        # 3. Save AI reply if logged in
        if user_id_int:
            ai_msg = ChatMessage(
                user_id=user_id_int,
                role='ai',
                message=reply
            )
            db.session.add(ai_msg)
            db.session.commit()

        return success_response(data={'reply': reply})
    except Exception as e:
        return error_response(str(e), 500)


@ai_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return error_response('Unauthorized', 401)

        messages = ChatMessage.query.filter_by(user_id=int(user_id)) \
            .order_by(ChatMessage.created_at.desc()) \
            .limit(20) \
            .all()

        messages.reverse()

        return success_response(data=[m.to_dict() for m in messages])
    except Exception as e:
        return error_response(str(e), 500)

@ai_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    try:
        user_id = get_jwt_identity()
        data = get_course_recommendations(user_id)
        return success_response(data=data)
    except Exception as e:
        return error_response(message=str(e), status_code=500)


