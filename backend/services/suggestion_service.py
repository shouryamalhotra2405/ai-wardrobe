import random
from models.clothing import ClothingItem

# Color matching rules
COLOR_MATCHES = {
    'black': ['white', 'red', 'grey', 'blue', 'pink', 'yellow', 'beige', 'black'],
    'white': ['black', 'blue', 'red', 'navy', 'grey', 'green', 'white'],
    'navy': ['white', 'beige', 'grey', 'brown', 'pink', 'yellow'],
    'blue': ['white', 'grey', 'beige', 'brown', 'black'],
    'grey': ['black', 'white', 'blue', 'pink', 'red', 'navy', 'purple'],
    'brown': ['white', 'beige', 'blue', 'green'],
    'beige': ['navy', 'brown', 'black', 'white', 'blue'],
    'red': ['black', 'white', 'grey', 'navy'],
    'green': ['white', 'beige', 'brown', 'black'],
    'pink': ['grey', 'navy', 'white', 'black'],
    'yellow': ['navy', 'grey', 'blue', 'black'],
    'purple': ['white', 'grey', 'black'],
    'maroon': ['white', 'beige', 'grey', 'black'],
    'olive': ['white', 'beige', 'brown', 'black']
}

def are_colors_compatible(c1, c2):
    if c1 == c2:
        return True
    compatible = COLOR_MATCHES.get(c1, [])
    return c2 in compatible or c1 in COLOR_MATCHES.get(c2, [])

class OutfitSuggestionEngine:
    def suggest_outfits(self, occasion='casual', season='all-season'):
        # Get all clothing items from DB
        items = ClothingItem.query.all()
        
        tops = [i for i in items if i.category in ['top', 'tops']]
        bottoms = [i for i in items if i.category in ['bottom', 'bottoms']]
        shoes = [i for i in items if i.category in ['shoes', 'footwear']]
        outerwear = [i for i in items if i.category in ['outerwear', 'jacket']]
        
        # Filter by occasion if possible
        filtered_tops = [t for t in tops if occasion in t.occasion] or tops
        filtered_bottoms = [b for b in bottoms if occasion in b.occasion] or bottoms
        filtered_shoes = [s for s in shoes if occasion in s.occasion] or shoes
        
        suggestions = []
        
        for top in filtered_tops:
            for bottom in filtered_bottoms:
                if are_colors_compatible(top.color_primary, bottom.color_primary):
                    matching_shoes = [
                        s for s in filtered_shoes 
                        if are_colors_compatible(s.color_primary, top.color_primary) or 
                           are_colors_compatible(s.color_primary, bottom.color_primary)
                    ] or filtered_shoes
                    
                    shoe = random.choice(matching_shoes) if matching_shoes else None
                    
                    outfit = {
                        'top': top.to_dict(),
                        'bottom': bottom.to_dict(),
                        'shoes': shoe.to_dict() if shoe else None,
                        'score': 85 if top.is_favorite or bottom.is_favorite else 75
                    }
                    
                    if season == 'winter' and outerwear:
                        outfit['outerwear'] = random.choice(outerwear).to_dict()
                        
                    suggestions.append(outfit)
                    
        # Sort by score and return top 5
        suggestions.sort(key=lambda x: x['score'], reverse=True)
        return suggestions[:5]