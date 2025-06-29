import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(False)

    # # Cookie-based JWT configuration
    # JWT_TOKEN_LOCATION = ['cookies']
    # JWT_COOKIE_SECURE = False  # Set to True in production (requires HTTPS)
    # JWT_COOKIE_SAMESITE = 'Lax'
    # JWT_ACCESS_COOKIE_PATH = '/'
    # JWT_REFRESH_COOKIE_PATH = '/token/refresh'

    # CORS settings
    CORS_ORIGINS = ['http://localhost:5173']
    SERVER_PORT = 5000
    DEBUG = True
