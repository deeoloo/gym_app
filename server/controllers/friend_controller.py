from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User, user_friends
from app import db

friend_bp = Blueprint('friends', __name__)

@friend_bp.route('/', methods=['GET'])
@jwt_required()
def get_friends():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    friends = user.get_friends()
    return jsonify([friend.to_dict() for friend in friends]), 200

@friend_bp.route('/requests', methods=['GET'])
@jwt_required()
def get_friend_requests():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    requests = user.get_pending_requests()
    return jsonify([req.to_dict() for req in requests]), 200

@friend_bp.route('/<int:friend_id>', methods=['POST', 'DELETE'])
@jwt_required()
def manage_friend(friend_id):
    current_user_id = get_jwt_identity()
    
    if current_user_id == friend_id:
        return jsonify({'message': 'Cannot add yourself'}), 400
    
    user = User.query.get(current_user_id)
    friend = User.query.get(friend_id)
    if not friend:
        return jsonify({'message': 'User not found'}), 404
    
    if request.method == 'POST':
        try:
            user.send_friend_request(friend)
            return jsonify({'message': 'Friend request sent'}), 200
        except ValueError as e:
            return jsonify({'message': str(e)}), 400
    
    elif request.method == 'DELETE':
        try:
            # Remove friendship in both directions
            db.session.execute(
                user_friends.delete().where(
                    ((user_friends.c.user_id == current_user_id) &
                     (user_friends.c.friend_id == friend_id)) |
                    ((user_friends.c.user_id == friend_id) &
                     (user_friends.c.friend_id == current_user_id))
                )
            )
            db.session.commit()
            return jsonify({'message': 'Friendship removed'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 400

@friend_bp.route('/requests/<int:friend_id>', methods=['PUT'])
@jwt_required()
def respond_to_request(friend_id):
    current_user_id = get_jwt_identity()
    action = request.args.get('action', 'accept')  # 'accept' or 'reject'
    
    if action not in ['accept', 'reject']:
        return jsonify({'message': 'Invalid action'}), 400
    
    try:
        if action == 'accept':
            user = User.query.get(current_user_id)
            user.accept_friend_request(User.query.get(friend_id))
            message = 'Friend request accepted'
        else:
            # Reject by deleting the pending request
            db.session.execute(
                user_friends.delete().where(
                    (user_friends.c.user_id == friend_id) &
                    (user_friends.c.friend_id == current_user_id) &
                    (user_friends.c.status == 'pending')
                )
            )
            db.session.commit()
            message = 'Friend request rejected'
        
        return jsonify({'message': message}), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400