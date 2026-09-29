import os
from utils.color_detection import detect_colors

def analyze_clothing_image(image_path):
    """
    Analyzes an uploaded clothing image.
    Extracts color automatically and returns defaults for metadata.
    """
    primary_color = detect_colors(image_path)
    
    return {
        'color_primary': primary_color,
        'color_secondary': '',
        'pattern': 'solid',
        'season': 'all-season',
        'occasion': 'casual'
    }