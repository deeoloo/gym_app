from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models.post import Post
from models.user import User

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404

    profile_data = {
        "completedWorkouts": [
            w.id for w in user.workouts if getattr(w, "completed", True)
        ],
        "savedRecipes": [r.id for r in user.nutrition_plans],
        "communityChallenges": [
            uc.challenge.name for uc in user.challenges
        ],
        "friends": [f.to_dict() for f in user.get_friends()],
        "completedWorkoutDetails": [
            {
                "name": w.name,
                "date": w.date.isoformat()
            } for w in user.workouts if getattr(w, "completed", True)
        ],
        "posts": [
            {
                "content": p.content,
                "time": p.created_at.isoformat()
            } for p in user.posts.order_by(Post.created_at.desc()).limit(5)
        ]
    }

    return jsonify(profile_data), 200
