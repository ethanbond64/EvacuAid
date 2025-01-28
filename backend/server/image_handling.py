from flask import jsonify, send_from_directory

import os
import uuid

LOCAL_IMAGE_PATH = 'images/'

def save_image(request):
    # make sure the folder exists that we will save the photo to
    static_folder = os.path.join(os.getcwd(), 'server', LOCAL_IMAGE_PATH)
    os.makedirs(static_folder, exist_ok=True)
    
    # Initialize filename as None in case no image is uploaded
    filename = None
    
    # Check if a image got uploaded
    if request.files:
        
        image = request.files['files']
        
        # Validate file type
        if not image.filename.endswith('.jpg'):
            return jsonify({"error": "Invalid file type. Only .jpg files are allowed. Found: " + image.filename}), 400
        
        # Generate a unique filename
        filename = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(static_folder, filename)
        
        # Save the file
        image.save(file_path)
        
    return filename

def get_image(filename):
    image_path = os.path.join(os.getcwd(), 'server', LOCAL_IMAGE_PATH, filename)
    
    if not os.path.exists(image_path):
         return jsonify({'error': 'Image not found'}), 400
    
    return send_from_directory(os.path.join(os.getcwd(), 'server', LOCAL_IMAGE_PATH), filename)