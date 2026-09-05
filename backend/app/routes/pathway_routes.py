from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.response import success_response, error_response
from app.services.pathway_service import get_user_learning_pathway

pathway_bp = Blueprint('pathway_bp', __name__, url_prefix='/pathways')

@pathway_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_pathway():
    try:
        user_id = get_jwt_identity()
        data = get_user_learning_pathway(user_id)
        return success_response(data=data)
    except Exception as e:
        return error_response(message=f"Failed to fetch pathway: {str(e)}", status_code=500)

