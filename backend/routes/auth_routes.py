import os
import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from models.clothing import User
from database.db import db
from sqlalchemy.exc import OperationalError, DBAPIError

auth_bp = Blueprint('auth', __name__)
JWT_SECRET = os.getenv('JWT_SECRET', 'shourya_wardrobe_secret_9988')

def safe_db_execute(func):
    """Decorator to retry DB query if Neon dropped the connection"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except (OperationalError, DBAPIError) as e:
            print("🔄 Stale DB connection detected. Retrying...")
            db.session.rollback()
            return func(*args, **kwargs)
    return wrapper

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json() or {}
        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''

        if not name or not email or not password:
            return jsonify({'message': 'Name, email and password are required'}), 400

        if len(password) < 4:
            return jsonify({'message': 'Password must be at least 4 characters'}), 400

        # Safe lookup with fallback rollback
        try:
            existing = User.query.filter_by(email=email).first()
        except Exception:
            db.session.rollback()
            existing = User.query.filter_by(email=email).first()

        if existing:
            return jsonify({'message': 'Email already registered. Please log in.'}), 400

        user = User(name=name, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()

        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=30)
        }, JWT_SECRET, algorithm='HS256')

        if isinstance(token, bytes):
            token = token.decode('utf-8')

        return jsonify({
            'message': 'Account created successfully!',
            'token': token,
            'user': {'id': user.id, 'name': user.name, 'email': user.email}
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Register error: {e}")
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        try:
            user = User.query.filter_by(email=email).first()
        except Exception:
            db.session.rollback()
            user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({'message': 'Invalid email or password'}), 401

        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=30)
        }, JWT_SECRET, algorithm='HS256')

        if isinstance(token, bytes):
            token = token.decode('utf-8')

        return jsonify({
            'message': 'Logged in successfully!',
            'token': token,
            'user': {'id': user.id, 'name': user.name, 'email': user.email}
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Login error: {e}")
        return jsonify({'message': f'Login failed: {str(e)}'}), 500