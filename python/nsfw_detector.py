# nsfw_detector.py
import requests

def nsfw_detection(image_url):
    try:
        response = requests.post(
            'https://api.deepai.org/api/nsfw-detector',
            data={'image': image_url},
            headers={'api-key': 'your_deepai_api_key'}
        )
        return response.json()
    except Exception as e:
        print(f"NSFW Detection error: {e}")
        return None
