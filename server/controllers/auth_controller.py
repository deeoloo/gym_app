from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token
from models.user import User
from werkzeug.exceptions import Unauthorized
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json() or {}
        required_fields = ['username', 'email', 'password', 'bio']

        # Validate required fields
        if not all(field in data and data[field] for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400

        # Check for duplicate username or email
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists'}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 400

        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            avatar=data.get('avatar', '👤'),
            bio=data['bio']
        )
        user.password = data['password']

        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=user.id, expires_delta=False)
        refresh_token = create_refresh_token(identity=user.id)

        return jsonify({
            'message': 'Registration successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Internal server error'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'Missing username or password'}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.verify_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user.id, expires_delta=False)
    refresh_token =create_refresh_token(identity=user.id)
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token':refresh_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    data = request.get_json()
    refresh_token = data.get('refresh_token')

    if not refresh_token:
        raise Unauthorized('Missing refresh token')

    try:
        decoded = decode_token(refresh_token)
        identity = decoded['sub']
    except Exception as e:
        return jsonify({'msg': 'Invalid or expired refresh token'}), 401

    new_access_token = create_access_token(identity=identity)
    return jsonify(access_token=new_access_token)
