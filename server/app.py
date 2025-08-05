from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from flask_bcrypt import Bcrypt
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    app = Flask(__name__,
    static_url_path='/',
    static_folder='../client/dist',)
    app.config.from_object(config_class)
    app.url_map.strict_slashes = False

    CORS(app,
    resources={
        r"/api/*": {
            "origins": "http://localhost:5173",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    },
    supports_credentials=True
)

    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Import models
    from models import user, workout, post, challenge, nutrition, product
    
    # Registering blueprints
    from controllers import (
        auth_controller,
        workout_controller,
        post_controller,
        challenge_controller,
        friend_controller,
        nutrition_controller,
        product_controller,
        profile_controller,
        user_controller
    )
    
    app.register_blueprint(auth_controller.auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profile_controller.profile_bp, url_prefix='/api/profile')
    app.register_blueprint(workout_controller.workout_bp, url_prefix='/api/workouts')
    app.register_blueprint(post_controller.post_bp, url_prefix='/api/posts')
    app.register_blueprint(user_controller.user_bp, url_prefix='/api/')
    app.register_blueprint(challenge_controller.challenge_bp, url_prefix='/api/challenges')
    app.register_blueprint(friend_controller.friend_bp, url_prefix='/api/friends')
    app.register_blueprint(nutrition_controller.nutrition_bp, url_prefix='/api/nutrition')
    app.register_blueprint(product_controller.product_bp, url_prefix='/api/products')



    @app.errorhandler(404)
    def not_found(e):
        return 
    send_from_directory(app.static_folder, "index.html")
    
    return app





if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
