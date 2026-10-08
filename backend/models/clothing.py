from datetime import datetime
from database.db import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    clothes = db.relationship('ClothingItem', backref='owner', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class ClothingItem(db.Model):
    __tablename__ = 'clothing_items'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    color_primary = db.Column(db.String(30), nullable=False)
    occasion = db.Column(db.String(100), default='casual')
    image_url = db.Column(db.String(500))  # Changed from image_path to image_url
    is_favorite = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'category': self.category,
            'color_primary': self.color_primary, 'occasion': self.occasion,
            'image_url': self.image_url, 'is_favorite': self.is_favorite
        }