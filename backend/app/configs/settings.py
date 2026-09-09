import os
from datetime import timedelta

from dotenv import load_dotenv


load_dotenv()


class Config:
    # =========================
    # FLASK
    # =========================
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "asiapp-secret-key"
    )

    DEBUG = os.getenv(
        "FLASK_DEBUG",
        "True"
    ).lower() == "true"

    # =========================
    # DATABASE
    # =========================
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "SQLALCHEMY_DATABASE_URI"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # =========================
    # JWT
    # =========================
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "asiapp-jwt-secret-key"
    )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        days=7
    )

    # =========================
    # CLOUDINARY
    # =========================
    CLOUDINARY_CLOUD_NAME = os.getenv(
        "CLOUDINARY_CLOUD_NAME"
    )

    CLOUDINARY_API_KEY = os.getenv(
        "CLOUDINARY_API_KEY"
    )

    CLOUDINARY_API_SECRET = os.getenv(
        "CLOUDINARY_API_SECRET"
    )

    # =========================
    # FRONTEND
    # =========================
    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    # =========================
    # GEMINI
    # =========================
    GEMINI_API_KEY = os.getenv(
        "GEMINI_API_KEY"
    )

    # =========================
    # GOOGLE LOGIN
    # =========================
    GOOGLE_CLIENT_ID = os.getenv(
        "GOOGLE_CLIENT_ID"
    )