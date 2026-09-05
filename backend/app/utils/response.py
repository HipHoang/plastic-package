# app/utils/response.py
from flask import jsonify

def success_response(data=None, message="Thành công", status_code=200):
    return jsonify({
        "status": "success",
        "message": message,
        "data": data
    }), status_code

def error_response(message="Đã xảy ra lỗi", status_code=400):
    return jsonify({
        "status": "error",
        "message": message
    }), status_code