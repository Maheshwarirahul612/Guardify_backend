# face_matching.py
import cv2
import face_recognition
import numpy as np
import requests
from io import BytesIO

def match_face(user_image_url, content_image_url):
    try:
        # Download user image
        user_img = requests.get(user_image_url).content
        user_image = face_recognition.load_image_file(BytesIO(user_img))
        user_face_encoding = face_recognition.face_encodings(user_image)

        if len(user_face_encoding) == 0:
            return False  # No face found in user's image

        user_face_encoding = user_face_encoding[0]

        # Download content image
        content_img = requests.get(content_image_url).content
        content_image = face_recognition.load_image_file(BytesIO(content_img))
        content_face_encoding = face_recognition.face_encodings(content_image)

        if len(content_face_encoding) == 0:
            return False  # No face found in content image

        content_face_encoding = content_face_encoding[0]

        # Compare faces
        results = face_recognition.compare_faces([user_face_encoding], content_face_encoding)

        return results[0]  # Returns True if faces match

    except Exception as e:
        print(f"Face Matching error: {e}")
        return False
