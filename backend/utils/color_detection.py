from colorthief import ColorThief

# Named color profiles with RGB thresholds
COLOR_NAMES = {
    'black': (0, 0, 0),
    'white': (255, 255, 255),
    'grey': (128, 128, 128),
    'navy': (0, 0, 128),
    'blue': (0, 102, 204),
    'red': (204, 0, 0),
    'green': (0, 153, 76),
    'brown': (102, 51, 0),
    'beige': (245, 245, 220),
    'pink': (255, 153, 204),
    'yellow': (255, 204, 0),
    'purple': (128, 0, 128),
    'maroon': (128, 0, 0),
    'olive': (128, 128, 0),
}

def get_closest_color_name(rgb):
    """Calculates nearest named color from RGB values"""
    r, g, b = rgb
    min_distance = float('inf')
    closest_color = 'grey'
    
    for name, (cr, cg, cb) in COLOR_NAMES.items():
        distance = ((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2) ** 0.5
        if distance < min_distance:
            min_distance = distance
            closest_color = name
            
    return closest_color

def detect_colors(image_path):
    """Extracts primary dominant color from image"""
    try:
        color_thief = ColorThief(image_path)
        dominant_rgb = color_thief.get_color(quality=1)
        primary_color = get_closest_color_name(dominant_rgb)
        return primary_color
    except Exception as e:
        print(f"Color extraction error: {e}")
        return 'unknown'