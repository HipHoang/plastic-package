from flask import Flask
from flask_cors import CORS
# SỬA Ở ĐÂY: Dùng đường dẫn tuyệt đối từ folder 'app'
from app.configs.db import db
from app.configs.settings import Config
import os
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from app.routes.post_routes import post_bp
from app.routes.review_routes import review_bp
from app.routes.ai_routes import ai_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)
    migrate = Migrate(app, db)
    # 2. Cấu hình CORS cho phép React (thường là port 5173) truy cập
    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:5173"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    app.url_map.strict_slashes = False
    # 3. Khởi tạo Database
    db.init_app(app)

    # 4. Khởi tạo JWTManager
    jwt = JWTManager(app)

    # 5. Đăng ký các Blueprints (Routes)
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.course_routes import course_bp
    from app.routes.lesson_routes import lesson_bp
    from app.routes.payment_routes import payment_bp
    from app.routes.ai_routes import ai_bp
    from app.routes.chat_routes import chat_bp
    from app.routes.pathway_routes import pathway_bp
    # ... Đăng ký thêm các route khác tương tự

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(course_bp, url_prefix='/api/courses')
    app.register_blueprint(lesson_bp, url_prefix='/api/lessons')
    app.register_blueprint(review_bp, url_prefix='/api/reviews')
    app.register_blueprint(post_bp, url_prefix='/api/posts')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(pathway_bp, url_prefix='/api/pathways')


    @app.route('/')
    def index():
        return {"message": "Server is running!"}

    return app