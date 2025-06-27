import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # extend duration
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    CORS_ORIGINS = ['http://localhost:5173']
    SERVER_PORT = 5000
    DEBUG=True