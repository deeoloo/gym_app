from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User, user_friends
from app import db

user_bp = Blueprint('users', __name__)

# ✅ Friend suggestion endpoint wrapped in `data.users`
@user_bp.route('/users/suggestions', methods=['GET'])
@jwt_required()
def suggest_friends():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({'message': 'User not found'}), 404

    # Get all user IDs already connected to the current user
    subquery = db.session.query(user_friends.c.friend_id).filter(user_friends.c.user_id == current_user_id)
    reverse_subquery = db.session.query(user_friends.c.user_id).filter(user_friends.c.friend_id == current_user_id)
    connected_ids = set([r[0] for r in subquery.union(reverse_subquery)])

    # Add self to the exclusion list
    connected_ids.add(current_user_id)

    # Suggest users who are not already connected
    suggestions = User.query.filter(~User.id.in_(connected_ids)).limit(10).all()

    result = [{
        'id': u.id,
        'username': u.username,
        'avatar': u.avatar,
        'mutualFriends': len(
            set(f.id for f in u.get_friends()) &
            set(f.id for f in current_user.get_friends())
        )
    } for u in suggestions]

    return jsonify({'data': {'users': result}}), 200

# (Optional) Get all users - useful for admin/testing
@user_bp.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

# (Optional) Get a specific user by ID
@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_dict(include_relationships=True)), 200
