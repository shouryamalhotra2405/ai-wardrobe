import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from database.db import db
from routes.auth_routes import auth_bp
from routes.wardrobe_routes import wardrobe_bp
from routes.suggestion_routes import suggestion_bp

# Path to local compiled React build folder
frontend_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'build')

def create_app():
    app = Flask(__name__, static_folder=frontend_folder, static_url_path='')
    
    db_url = os.getenv('DATABASE_URL', 'sqlite:///wardrobe.db')
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
    
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    CORS(app)
    db.init_app(app)
    
    # API Routes
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(wardrobe_bp, url_prefix='/api/wardrobe')
    app.register_blueprint(suggestion_bp, url_prefix='/api/suggestions')
    
    # Serve React SPA Frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    with app.app_context():
        db.create_all()
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)