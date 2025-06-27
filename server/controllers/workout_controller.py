from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.workout import Workout
from app import db

workout_bp = Blueprint('workouts', __name__)

@workout_bp.route('/', methods=['POST'])
@jwt_required()
def create_workout():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or 'name' not in data or 'duration' not in data:
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        workout = Workout(
            name=data['name'],
            description=data.get('description', ''),
            duration=data['duration'],
            difficulty=data.get('difficulty'),
            exercises= data.get('exercises'),
            user_id=current_user_id
        )
        db.session.add(workout)
        db.session.commit()
        return jsonify(workout.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@workout_bp.route('/', methods=['GET'])
def get_workouts():
    try:
        workouts = Workout.query.order_by(Workout.created_at.desc()).all()
        return jsonify([workout.to_dict() for workout in workouts]), 200
    except Exception as e:
        return jsonify({'message': f'Error fetching workouts: {str(e)}'}), 500


@workout_bp.route('/<int:workout_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def workout_detail(workout_id):
    current_user_id = get_jwt_identity()
    workout = Workout.query.filter_by(id=workout_id, user_id=current_user_id).first()
    if not workout:
        return jsonify({'message': 'Workout not found'}), 404
    
    if request.method == 'GET':
        return jsonify(workout.to_dict())
    
    elif request.method == 'PUT':
        data = request.get_json()
        try:
            if 'name' in data: workout.name = data['name']
            if 'description' in data: workout.description = data['description']
            if 'duration' in data: workout.duration = data['duration']
            if 'calories_burned' in data: workout.calories_burned = data['calories_burned']
            db.session.commit()
            return jsonify(workout.to_dict())
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 400
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(workout)
            db.session.commit()
            return jsonify({'message': 'Workout deleted'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 400