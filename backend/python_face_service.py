from flask import Flask, request, jsonify
import face_recognition
import numpy as np
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)

def read_image(base64_string):
    # Remove header if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    img_data = base64.b64decode(base64_string)
    img = Image.open(BytesIO(img_data))
    return np.array(img)

@app.route('/verify-face', methods=['POST'])
def verify_face():
    data = request.json
    img1_b64 = data.get('image1')
    img2_b64 = data.get('image2')

    if not img1_b64 or not img2_b64:
        return jsonify({'match': False, 'reason': 'Both images required'}), 400

    img1 = read_image(img1_b64)
    img2 = read_image(img2_b64)

    encodings1 = face_recognition.face_encodings(img1)
    encodings2 = face_recognition.face_encodings(img2)

    if not encodings1 or not encodings2:
        return jsonify({'match': False, 'reason': 'No face detected in one or both images'}), 400

    match = face_recognition.compare_faces([encodings1[0]], encodings2[0])[0]
    distance = np.linalg.norm(encodings1[0] - encodings2[0])
    return jsonify({'match': match, 'distance': float(distance)})

@app.route('/encode-face', methods=['POST'])
def encode_face():
    data = request.json
    img_b64 = data.get('image')
    if not img_b64:
        return jsonify({'error': 'Image required'}), 400
    img = read_image(img_b64)
    encodings = face_recognition.face_encodings(img)
    if not encodings:
        return jsonify({'error': 'No face detected'}), 400
    return jsonify({'encoding': list(encodings[0])})

@app.route('/verify-encoding', methods=['POST'])
def verify_encoding():
    data = request.json
    encoding = data.get('encoding')
    img_b64 = data.get('image')
    if not encoding or not img_b64:
        return jsonify({'match': False, 'reason': 'Encoding and image required'}), 400
    img = read_image(img_b64)
    encodings = face_recognition.face_encodings(img)
    if not encodings:
        return jsonify({'match': False, 'reason': 'No face detected in image'}), 400
    distance = np.linalg.norm(np.array(encoding) - encodings[0])
    match = bool(distance < 0.6)  # Ensure native Python bool
    return jsonify({'match': match, 'distance': float(distance)})

if __name__ == '__main__':
    app.run(port=5001)
