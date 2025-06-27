from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.product import Product
from app import db
from models.user import User
from datetime import datetime

product_bp = Blueprint('products', __name__)

# Get all products with filtering
@product_bp.route('/', methods=['GET'])
def get_products():
    try:
        category = request.args.get('category')
        search = request.args.get('search', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        query = Product.query

        # Apply filters
        if category:
            query = query.filter_by(category=category)
        if search:
            query = query.filter(Product.name.ilike(f'%{search}%'))

        products = query.order_by(
            Product.created_at.desc()
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return jsonify({
            'products': [{
                'id': p.id,
                'name': p.name,
                'features': p.features,
                'price': p.price,
                'category': p.category,
                'image_url': p.image_url,
                'created_at': p.created_at.isoformat()
            } for p in products.items],
            'total': products.total,
            'pages': products.pages,
            'current_page': products.page
        }), 200
    except Exception as e:
        return jsonify({'message': f"Error fetching products: {str(e)}"}), 500

# Get single product
@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        return jsonify({
            'id': product.id,
            'name': product.name,
            'features': product.features,
            'price': product.price,
            'category': product.category,
            'image_url': product.image_url,
            'created_at': product.created_at.isoformat()
        }), 200
    except Exception as e:
        return jsonify({'message': f"Error fetching product: {str(e)}"}), 500

# Create product (admin only)
@product_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    current_user_id = get_jwt_identity()
    
    # Check if user is admin (you'll need to add is_admin to your User model)
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    required_fields = ['name', 'price', 'category']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        product = Product(
            name=data['name'],
            features=data.get('features', ''),
            price=data['price'],
            category=data['category'],
            image_url=data.get('image_url', '')
        )
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': {
                'id': product.id,
                'name': product.name,
                'price': product.price
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error creating product: {str(e)}"}), 500

# Update product (admin only)
@product_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    data = request.get_json()
    try:
        if 'name' in data: product.name = data['name']
        if 'features' in data: product.features = data['features']
        if 'price' in data: product.price = data['price']
        if 'category' in data: product.category = data['category']
        if 'image_url' in data: product.image_url = data['image_url']
        
        db.session.commit()
        return jsonify({
            'message': 'Product updated successfully',
            'product': {
                'id': product.id,
                'name': product.name
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error updating product: {str(e)}"}), 500

# Delete product (admin only)
@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    current_user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Error deleting product: {str(e)}"}), 500