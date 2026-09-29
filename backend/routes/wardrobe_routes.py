import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from models.clothing import ClothingItem
from database.db import db
from services.image_service import analyze_clothing_image

wardrobe_bp = Blueprint('wardrobe', __name__)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Add new clothing item
@wardrobe_bp.route('/add', methods=['POST'])
def add_clothing():
    try:
        data = request.form
        image_path = None
        auto_detected = {}
        
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                image_path = f"static/uploads/{filename}"
                auto_detected = analyze_clothing_image(filepath)

        item = ClothingItem(
            name=data.get('name', 'My Clothing Item'),
            category=data.get('category', 'top'),
            sub_category=data.get('sub_category', ''),
            color_primary=data.get('color_primary') or auto_detected.get('color_primary', 'black'),
            color_secondary=data.get('color_secondary', ''),
            pattern=data.get('pattern', 'solid'),
            brand=data.get('brand', ''),
            size=data.get('size', ''),
            material=data.get('material', ''),
            season=data.get('season', 'all-season'),
            occasion=data.get('occasion', 'casual'),
            price=float(data.get('price', 0.0)),
            image_path=image_path
        )
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify({
            'message': 'Clothing item added successfully!',
            'item': item.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get all clothes
@wardrobe_bp.route('/all', methods=['GET'])
def get_all():
    items = ClothingItem.query.all()
    return jsonify({
        'total': len(items),
        'items': [i.to_dict() for i in items]
    }), 200

# Delete an item
@wardrobe_bp.route('/delete/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = ClothingItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item deleted successfully'}), 200

# Wardrobe stats
@wardrobe_bp.route('/stats', methods=['GET'])
def get_stats():
    items = ClothingItem.query.all()
    
    categories = {}
    colors = {}
    total_value = 0.0
    
    for i in items:
        categories[i.category] = categories.get(i.category, 0) + 1
        colors[i.color_primary] = colors.get(i.color_primary, 0) + 1
        total_value += (i.price or 0.0)
        
    return jsonify({
        'total_items': len(items),
        'by_category': categories,
        'by_color': colors,
        'total_value': total_value
    }), 200