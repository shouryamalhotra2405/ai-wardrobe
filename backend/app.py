import os
import re
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from database.db import db
from routes.auth_routes import auth_bp
from routes.wardrobe_routes import wardrobe_bp
from routes.suggestion_routes import suggestion_bp

build_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build')

def create_app():
    app = Flask(__name__, static_folder=build_folder, static_url_path='')
    
    os.makedirs(app.instance_path, exist_ok=True)
    
    # Get and sanitize DATABASE_URL
    db_url = os.getenv('DATABASE_URL', '')
    
    if db_url:
        # Convert postgres:// to postgresql+psycopg2://
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif db_url.startswith("postgresql://") and "+psycopg" not in db_url:
            db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        
        # 🛠️ CRITICAL FIX: Remove '-pooler' from Neon host so SQLAlchemy uses Direct SSL Connection
        db_url = db_url.replace("-pooler.", ".")
        
        # Remove unsupported channel_binding params
        db_url = re.sub(r'[&?]channel_binding=[^&]*', '', db_url)
        
        # Ensure sslmode=require
        if 'sslmode=' not in db_url:
            sep = '&' if '?' in db_url else '?'
            db_url = f"{db_url}{sep}sslmode=require"
        
        # Engine config for Neon Direct Connection
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            'pool_pre_ping': True,    # Test connection before running query
            'pool_recycle': 60,       # Recycle connections every 60s
            'pool_timeout': 30,
            'max_overflow': 10
        }
    else:
        db_url = f"sqlite:///{os.path.join(app.instance_path, 'wardrobe.db')}"
        
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
    
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    CORS(app)
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(wardrobe_bp, url_prefix='/api/wardrobe')
    app.register_blueprint(suggestion_bp, url_prefix='/api/suggestions')
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'AI Wardrobe SaaS Server is Active!'}), 200

    # Serve React Frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            index_path = os.path.join(app.static_folder, 'index.html')
            if os.path.exists(index_path):
                return send_from_directory(app.static_folder, 'index.html')
            return jsonify({'message': 'API running.'}), 200

    with app.app_context():
        try:
            db.create_all()
            print("✅ Neon PostgreSQL Direct Connection established!")
        except Exception as e:
            print(f"⚠️ Database init notice: {e}")
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)