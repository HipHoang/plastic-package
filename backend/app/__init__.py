from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from sqlalchemy import text

from app.configs.db import db
from app.configs.settings import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    Migrate(app, db)
    JWTManager(app)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "http://localhost:5173"
            }
        },
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    app.url_map.strict_slashes = False

    # =========================
    # ROUTES
    # =========================
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.product_routes import product_bp
    from app.routes.payment_routes import payment_bp
    from app.routes.review_routes import review_bp
    from app.routes.post_routes import post_bp
    from app.routes.ai_routes import ai_bp
    from app.routes.chat_routes import chat_bp

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth"
    )

    app.register_blueprint(
        user_bp,
        url_prefix="/api/users"
    )

    app.register_blueprint(
        product_bp,
        url_prefix="/api/products"
    )

    app.register_blueprint(
        payment_bp,
        url_prefix="/api/payment"
    )

    app.register_blueprint(
        review_bp,
        url_prefix="/api/reviews"
    )

    app.register_blueprint(
        post_bp,
        url_prefix="/api/posts"
    )

    app.register_blueprint(
        ai_bp,
        url_prefix="/api/ai"
    )

    app.register_blueprint(
        chat_bp,
        url_prefix="/api/chat"
    )

    @app.route("/")
    def index():
        return {
            "message": "ASIAPP Backend is running!"
        }

    @app.route("/api/health")
    def health():
        return {
            "status": "ok",
            "database": db.session.execute(
                text("SELECT DATABASE()")
            ).scalar_one()
        }

    return app