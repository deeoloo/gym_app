from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.nutrition import NutritionPlan
from models.user import User
from app import db
from datetime import datetime

nutrition_bp = Blueprint('nutrition', __name__)

# Get all nutrition plans (public)
@nutrition_bp.route('/', methods=['GET'])
def get_nutrition_plans():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '').strip()

        query = NutritionPlan.query

        if search:
            query = query.filter(NutritionPlan.name.ilike(f'%{search}%'))

        plans = query.order_by(
            NutritionPlan.created_at.desc()
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return jsonify({
            'plans': [{
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'calories': p.calories,
                'protein': p.protein,
                'carbs': p.carbs,
                'fats': p.fats,
                'created_at': p.created_at.isoformat(),
                'user': {
                    'id': p.user.id,
                    'username': p.user.username
                }
            } for p in plans.items],
            'total': plans.total,
            'pages': plans.pages,
            'current_page': plans.page
        }), 200
    except Exception as e:
        return jsonify({'message': f"Error fetching nutrition plans: {str(e)}"}), 500

# Get user's nutrition plans
@nutrition_bp.route('/my-plans', methods=['GET'])
@jwt_required()
def get_user_nutrition_plans():
    current_user_id = get_jwt_identity()
    
    try:
        plans = NutritionPlan.query.filter_by(
            user_id=current_user_id
        ).order_by(
            NutritionPlan.created_at.desc()
        ).all()
        
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'calories': p.calories,
            'protein': p.protein,
            'carbs': p.carbs,
            'fats': p.fats,
            'created_at': p.created_at.isoformat()
        } for p in plans]), 200
    except Exception as e:
        return jsonify({'message': f"Error fetching your nutrition plans: {str(e)}"}), 500

# Create nutrition plan
@nutrition_bp.route('/', methods=['POST'])
@jwt_required()
def create_nutrition_plan():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['name', 'calories', 'protein', 'carbs', 'fats']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        plan = NutritionPlan(
            name=data['name'],
            description=data.get('description', ''),
            calories=data['calories'],
            protein=data['protein'],
            carbs=data['carbs'],
            fats=data['fats'],
            user_id=current_user_id
        )
        db.session.add(plan)
        db.session.commit()
        
        return jsonify({
            'message': 'Nutrition plan created successfully',
            'plan': {
                'id': plan.id,
                'name': plan.name,
                'calories': plan.calories
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error creating nutrition plan: {str(e)}"}), 500

# Get single nutrition plan
@nutrition_bp.route('/<int:plan_id>', methods=['GET'])
def get_nutrition_plan(plan_id):
    try:
        plan = NutritionPlan.query.get(plan_id)
        if not plan:
            return jsonify({'message': 'Nutrition plan not found'}), 404
        
        return jsonify({
            'id': plan.id,
            'name': plan.name,
            'description': plan.description,
            'calories': plan.calories,
            'protein': plan.protein,
            'carbs': plan.carbs,
            'fats': plan.fats,
            'created_at': plan.created_at.isoformat(),
            'user': {
                'id': plan.user.id,
                'username': plan.user.username
            }
        }), 200
    except Exception as e:
        return jsonify({'message': f"Error fetching nutrition plan: {str(e)}"}), 500

# Update nutrition plan (owner only)
@nutrition_bp.route('/<int:plan_id>', methods=['PUT'])
@jwt_required()
def update_nutrition_plan(plan_id):
    current_user_id = get_jwt_identity()
    
    plan = NutritionPlan.query.filter_by(
        id=plan_id,
        user_id=current_user_id
    ).first()
    
    if not plan:
        return jsonify({'message': 'Plan not found or unauthorized'}), 404

    data = request.get_json()
    try:
        if 'name' in data: plan.name = data['name']
        if 'description' in data: plan.description = data['description']
        if 'calories' in data: plan.calories = data['calories']
        if 'protein' in data: plan.protein = data['protein']
        if 'carbs' in data: plan.carbs = data['carbs']
        if 'fats' in data: plan.fats = data['fats']
        
        db.session.commit()
        return jsonify({
            'message': 'Nutrition plan updated successfully',
            'plan': {
                'id': plan.id,
                'name': plan.name
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error updating nutrition plan: {str(e)}"}), 500

# Delete nutrition plan (owner only)
@nutrition_bp.route('/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_nutrition_plan(plan_id):
    current_user_id = get_jwt_identity()
    
    plan = NutritionPlan.query.filter_by(
        id=plan_id,
        user_id=current_user_id
    ).first()
    
    if not plan:
        return jsonify({'message': 'Plan not found or unauthorized'}), 404

    try:
        db.session.delete(plan)
        db.session.commit()
        return jsonify({'message': 'Nutrition plan deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error deleting nutrition plan: {str(e)}"}), 500