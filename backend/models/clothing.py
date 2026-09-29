from datetime import datetime
from database.db import db

class ClothingItem(db.Model):
    __tablename__ = 'clothing_items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)      # top, bottom, shoes, outerwear, accessory, ethnic
    sub_category = db.Column(db.String(50))                  # t-shirt, jeans, sneakers, blazer
    color_primary = db.Column(db.String(30), nullable=False) # main color
    color_secondary = db.Column(db.String(30))               # secondary color
    pattern = db.Column(db.String(30), default='solid')      # solid, striped, checkered, floral
    brand = db.Column(db.String(50))
    size = db.Column(db.String(10))
    material = db.Column(db.String(50))                      # cotton, denim, polyester, silk
    season = db.Column(db.String(20), default='all-season')  # summer, winter, rainy, all-season
    occasion = db.Column(db.String(100), default='casual')   # casual, formal, party, sports, ethnic
    image_path = db.Column(db.String(255))
    price = db.Column(db.Float, default=0.0)
    times_worn = db.Column(db.Integer, default=0)
    last_worn = db.Column(db.Date)
    is_favorite = db.Column(db.Boolean, default=False)
    condition = db.Column(db.String(20), default='good')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'sub_category': self.sub_category,
            'color_primary': self.color_primary,
            'color_secondary': self.color_secondary,
            'pattern': self.pattern,
            'brand': self.brand,
            'size': self.size,
            'material': self.material,
            'season': self.season,
            'occasion': self.occasion,
            'image_path': self.image_path,
            'price': self.price,
            'times_worn': self.times_worn,
            'last_worn': str(self.last_worn) if self.last_worn else None,
            'is_favorite': self.is_favorite,
            'condition': self.condition
        }