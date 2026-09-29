from flask import Blueprint, request, jsonify
from services.suggestion_service import OutfitSuggestionEngine

suggestion_bp = Blueprint('suggestions', __name__)
engine = OutfitSuggestionEngine()

@suggestion_bp.route('/outfit', methods=['POST'])
def suggest_outfit():
    data = request.json or {}
    occasion = data.get('occasion', 'casual')
    season = data.get('season', 'all-season')
    
    suggestions = engine.suggest_outfits(occasion=occasion, season=season)
    
    return jsonify({
        'occasion': occasion,
        'season': season,
        'suggestions': suggestions,
        'count': len(suggestions)
    }), 200