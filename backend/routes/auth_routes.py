import os
import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from models.clothing import User
from database.db import db

auth_bp = Blueprint('auth', __name__)
JWT_SECRET = os.getenv('JWT_SECRET', 'shourya_wardrobe_secret_9988')

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        # Accepts both JSON body and Form data cleanly
        data = request.get_json(force=True, silent=True) or request.form or {}
        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        password = (data.get('password') or '').strip()

        if not name or not email or not password:
            return jsonify({'message': 'Name, email, and password are required.'}), 400

        if len(password) < 4:
            return jsonify({'message': 'Password must be at least 4 characters long.'}), 400

        # Check if email is already taken
        try:
            existing = User.query.filter_by(email=email).first()
        except Exception:
            db.session.rollback()
            existing = User.query.filter_by(email=email).first()

        if existing:
            return jsonify({'message': 'An account with this email already exists. Please log in.'}), 400

        # Create new user
        user = User(name=name, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()

        # Generate JWT token so user is automatically logged in upon signup
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
        print(f"❌ Register Error: {e}")
        return jsonify({'message': f'Server Error: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json(force=True, silent=True) or request.form or {}
        email = (data.get('email') or '').strip().lower()
        password = (data.get('password') or '').strip()

        if not email or not password:
            return jsonify({'message': 'Email and password are required.'}), 400

        try:
            user = User.query.filter_by(email=email).first()
        except Exception:
            db.session.rollback()
            user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({'message': 'Invalid email or password.'}), 401

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
        print(f"❌ Login Error: {e}")
        return jsonify({'message': f'Server Error: {str(e)}'}), 500