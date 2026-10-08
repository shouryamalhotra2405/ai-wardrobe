import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from models.clothing import ClothingItem
from database.db import db
from utils.auth import token_required
from services.image_service import upload_image_to_cloud, analyze_clothing_image

wardrobe_bp = Blueprint('wardrobe', __name__)

@wardrobe_bp.route('/add', methods=['POST'])
@token_required
def add_clothing(current_user):
    data = request.form
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        # Save temp for color detection
        temp_path = os.path.join(current_app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
        file.save(temp_path)
        color = analyze_clothing_image(temp_path)['color_primary']
        file.seek(0)
        image_url = upload_image_to_cloud(file)
        os.remove(temp_path)
    
    item = ClothingItem(user_id=current_user.id, name=data['name'], category=data['category'], 
                        color_primary=data.get('color_primary', color), image_url=image_url)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@wardrobe_bp.route('/all', methods=['GET'])
@token_required
def get_all(current_user):
    items = ClothingItem.query.filter_by(user_id=current_user.id).all()
    return jsonify({'items': [i.to_dict() for i in items]})