from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.chat import Conversation, ConversationUser, Message
from app.configs.db import db
from app.utils.response import success_response, error_response

chat_bp = Blueprint('chat_bp', __name__)


@chat_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    try:
        sender_id = int(get_jwt_identity())
        data = request.get_json()
        conversation_id = data.get('conversation_id')
        content = data.get('content')

        if not conversation_id or not content:
            return error_response('Missing conversation_id or content', 400)

        # Validate user belongs to conversation
        conv_user = ConversationUser.query.filter_by(
            conversation_id=conversation_id,
            user_id=sender_id
        ).first()

        if not conv_user:
            return error_response('You are not in this conversation', 403)

        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content
        )
        db.session.add(message)
        db.session.commit()

        return success_response(data=message.to_dict(), message='Message sent', status_code=201)
    except Exception as e:
        return error_response(str(e), 500)


@chat_bp.route('/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_messages(conversation_id):
    try:
        user_id = int(get_jwt_identity())

        # Validate user belongs to conversation
        conv_user = ConversationUser.query.filter_by(
            conversation_id=conversation_id,
            user_id=user_id
        ).first()

        if not conv_user:
            return error_response('You are not in this conversation', 403)

        messages = Message.query.filter_by(conversation_id=conversation_id) \
            .order_by(Message.created_at.asc()) \
            .all()

        return success_response(data=[m.to_dict() for m in messages])
    except Exception as e:
        return error_response(str(e), 500)

