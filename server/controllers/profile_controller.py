from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.post import Post

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"message": "User not found"}), 404

        profile_data = {
            # Basic user info
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar": user.avatar,
            "bio": user.bio,
            "created_at": user.created_at.isoformat(),
            
            # Activity data
            "completedWorkouts": [
                w.id for w in user.workouts if getattr(w, "completed", True)
            ],
            "savedRecipes": [
                {
                    "id": r.id,
                    "name": r.name,
                    "date": r.created_at.isoformat()
                } for r in user.saved_recipes
            ],
            "communityChallenges": [
                {
                    "name": uc.challenge.name,
                    "joined_at": uc.joined_at.isoformat()
                } for uc in user.challenges
            ],
            "friends": [f.to_dict() for f in user.get_friends()],
            "completedWorkoutDetails": [
                {
                    "id": w.id,
                    "name": w.name,
                    "date": w.date.isoformat()
                } for w in user.workouts if getattr(w, "completed", True)
            ],
            "posts": [
                {
                    "id": p.id,
                    "content": p.content,
                    "time": p.created_at.isoformat()
                } for p in user.posts.order_by(Post.created_at.desc()).limit(5)
            ]
        }

        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({"message": str(e)}), 500




