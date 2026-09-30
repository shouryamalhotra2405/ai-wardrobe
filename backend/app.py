import os
from flask import Flask, jsonify
from flask_cors import CORS
from database.db import db
from routes.wardrobe_routes import wardrobe_bp
from routes.suggestion_routes import suggestion_bp

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wardrobe.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
    
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Allow all origins (Vercel, Mobile, Localhost)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(wardrobe_bp, url_prefix='/api/wardrobe')
    app.register_blueprint(suggestion_bp, url_prefix='/api/suggestions')
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'AI Wardrobe Backend Server is Live with AI Engine!'
        }), 200

    with app.app_context():
        db.create_all()
        print("✅ Database & API Blueprints loaded successfully!")
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)