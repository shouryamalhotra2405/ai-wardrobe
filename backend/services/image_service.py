import os
import requests
import base64
from utils.color_detection import detect_colors

def upload_image_to_cloud(file_storage):
    try:
        encoded_image = base64.b64encode(file_storage.read()).decode('utf-8')
        res = requests.post('https://api.imgbb.com/1/upload', data={
            'key': os.getenv('IMGBB_API_KEY'),
            'image': encoded_image
        })
        return res.json()['data']['url']
    except:
        return None

def analyze_clothing_image(filepath):
    return {'color_primary': detect_colors(filepath)}