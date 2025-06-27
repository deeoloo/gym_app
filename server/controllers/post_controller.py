from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.post import Post
from app import db
from models.user import User
from datetime import datetime
from sqlalchemy import or_

post_bp = Blueprint('posts', __name__)

# Get all community posts with pagination and search
@post_bp.route('/', methods=['GET'])
def get_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '').strip()
        
        base_query = Post.query.order_by(Post.created_at.desc())
        
        if search:
            base_query = base_query.join(User).filter(
                or_(
                    Post.content.ilike(f'%{search}%'),
                    User.username.ilike(f'%{search}%')
                )
            )
        
        posts = base_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'posts': [{
                'id': p.id,
                'content': p.content,
                'likes': p.likes,
                'created_at': p.created_at.isoformat(),
                'user': {
                    'id': p.user.id,
                    'username': p.user.username,
                    'avatar': p.user.avatar,
                    'bio': p.user.bio
                }
            } for p in posts.items],
            'total': posts.total,
            'pages': posts.pages,
            'current_page': posts.page
        }), 200
    except Exception as e:
        return jsonify({'message': f"Error fetching posts: {str(e)}"}), 500

# Create a new post
@post_bp.route('/', methods=['POST'])
@jwt_required()
def create_post():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'content' not in data or not data['content'].strip():
        return jsonify({'message': 'Post content is required'}), 400
    
    try:
        post = Post(
            content=data['content'].strip(),
            user_id=current_user_id,
            likes=0  # Initialize likes to 0
        )
        db.session.add(post)
        db.session.commit()
        
        user = User.query.get(current_user_id)
        return jsonify({
            'message': 'Post created successfully',
            'post': {
                'id': post.id,
                'content': post.content,
                'likes': post.likes,
                'created_at': post.created_at.isoformat(),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'avatar': user.avatar
                }
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error creating post: {str(e)}"}), 500

# Like a post
@post_bp.route('/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    current_user_id = get_jwt_identity()
    
    try:
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'message': 'Post not found'}), 404
        
        post.likes += 1
        db.session.commit()
        
        return jsonify({
            'message': 'Post liked successfully',
            'likes': post.likes
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error liking post: {str(e)}"}), 500

# Get posts by a specific user
@post_bp.route('/user/<username>', methods=['GET'])
def get_user_posts(username):
    try:
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        posts = Post.query.filter_by(
            user_id=user.id
        ).order_by(
            Post.created_at.desc()
        ).all()
        
        return jsonify([{
            'id': p.id,
            'content': p.content,
            'likes': p.likes,
            'created_at': p.created_at.isoformat()
        } for p in posts]), 200
    except Exception as e:
        return jsonify({'message': f"Error fetching user posts: {str(e)}"}), 500

# Delete a post (owner only)
@post_bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    current_user_id = get_jwt_identity()
    
    try:
        post = Post.query.filter_by(
            id=post_id,
            user_id=current_user_id
        ).first()
        
        if not post:
            return jsonify({'message': 'Post not found or unauthorized'}), 404
        
        db.session.delete(post)
        db.session.commit()
        return jsonify({'message': 'Post deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error deleting post: {str(e)}"}), 500

# Get a single post with basic details
@post_bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    try:
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'message': 'Post not found'}), 404
        
        return jsonify({
            'post': {
                'id': post.id,
                'content': post.content,
                'likes': post.likes,
                'created_at': post.created_at.isoformat(),
                'user': {
                    'id': post.user.id,
                    'username': post.user.username,
                    'avatar': post.user.avatar
                }
            }
        }), 200
    except Exception as e:
        return jsonify({'message': f"Error fetching post: {str(e)}"}), 500