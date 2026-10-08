import os
import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from models.clothing import User
from database.db import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 400
    user = User(name=data['name'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        token = jwt.encode({'user_id': user.id, 'exp': datetime.utcnow() + timedelta(hours=24)}, 
                           os.getenv('JWT_SECRET'), algorithm="HS256")
        return jsonify({'token': token, 'user': {'name': user.name, 'email': user.email}})
    return jsonify({'message': 'Invalid credentials'}), 401