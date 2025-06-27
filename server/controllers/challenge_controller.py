from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.challenge import Challenge, UserChallenge
from models.user import User
from app import db

challenge_bp = Blueprint('challenges', __name__)

# Get all available challenges
@challenge_bp.route('/', methods=['GET'])
def get_challenges():
    challenges = Challenge.query.filter_by(is_active=True).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'description': c.description,
        'target': c.target,
        'participants_count': UserChallenge.query.filter_by(challenge_id=c.id).count()
    } for c in challenges]), 200

# Join a challenge
@challenge_bp.route('/<int:challenge_id>/join', methods=['POST'])
@jwt_required()
def join_challenge(challenge_id):
    current_user_id = get_jwt_identity()
    
    challenge = Challenge.query.get(challenge_id)
    if not challenge or not challenge.is_active:
        return jsonify({'message': 'Challenge not found or inactive'}), 404
    
    # Check if already joined
    existing = UserChallenge.query.filter_by(
        user_id=current_user_id,
        challenge_id=challenge_id
    ).first()
    
    if existing:
        return jsonify({'message': 'Already joined this challenge'}), 400
    
    try:
        user_challenge = UserChallenge(
            user_id=current_user_id,
            challenge_id=challenge_id,
            progress=0
        )
        db.session.add(user_challenge)
        db.session.commit()
        return jsonify({
            'message': 'Challenge joined successfully',
            'challenge': {
                'id': challenge.id,
                'name': challenge.name,
                'progress': 0,
                'target': challenge.target
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

# Get user's challenges
@challenge_bp.route('/my-challenges', methods=['GET'])
@jwt_required()
def get_user_challenges():
    current_user_id = get_jwt_identity()
    
    user_challenges = db.session.query(
        UserChallenge, Challenge
    ).join(
        Challenge, UserChallenge.challenge_id == Challenge.id
    ).filter(
        UserChallenge.user_id == current_user_id
    ).all()
    
    return jsonify([{
        'id': uc.Challenge.id,
        'name': uc.Challenge.name,
        'description': uc.Challenge.description,
        'progress': uc.UserChallenge.progress,
        'target': uc.Challenge.target,
        'completed': uc.UserChallenge.progress >= uc.Challenge.target,
        'joined_at': uc.UserChallenge.joined_at.isoformat()
    } for uc in user_challenges]), 200

# Update challenge progress
@challenge_bp.route('/<int:challenge_id>/progress', methods=['PUT'])
@jwt_required()
def update_progress(challenge_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'progress' not in data:
        return jsonify({'message': 'Progress value required'}), 400
    
    user_challenge = UserChallenge.query.filter_by(
        user_id=current_user_id,
        challenge_id=challenge_id
    ).first()
    
    if not user_challenge:
        return jsonify({'message': 'Challenge not found'}), 404
    
    try:
        user_challenge.progress = data['progress']
        if user_challenge.progress >= user_challenge.challenge.target:
            user_challenge.completed = True
        db.session.commit()
        return jsonify({
            'message': 'Progress updated',
            'progress': user_challenge.progress,
            'completed': user_challenge.completed
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400