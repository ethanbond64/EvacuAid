from flask import Blueprint, jsonify, request

from server.models import Contract, User, Message
from server.contract_generation import generate_contract, regenerate_contract
from server.sign_contract import generate_envelope, get_contract_url
from server.image_handling import save_image, get_image

import os

main_bp = Blueprint('main', __name__)

@main_bp.route('/get/users/<user_id>', methods=['GET'])
def get_user(user_id):
    
    user = User.query.filter_by(id=user_id).first()
    
    if not user:
        return jsonify({'error': 'data not found'}), 404

    return jsonify(user.json()), 200

# Invoked from map page
@main_bp.route('/get/users/', methods=['GET', 'POST'])
def get_users():
    
    users = User.query.all()
    
    if not users:
        return jsonify({'error': 'No users found'}), 404

    return jsonify([user.json() for user in users]), 200

# Invoked from map page
@main_bp.route('/getImage/<filename>', methods=['GET', 'POST'])
def get_image_by_name(filename):
    # get image from local storage
    return get_image(filename)

# Invoked from form page
@main_bp.route('/create/user', methods=['POST'])
def create_user():
    
    data = request.form
    
    image_filename = save_image(request)
    
    needs = data.get('specificNeeds', [])
    if not isinstance(needs, list):
        needs = [needs]
    user = User(
        name=data['name'], 
        email=data['email'],
        lat=float(data.get('lat', 0.0)),
        lng=float(data.get('lng', 0.0)),
        is_helper=bool(data.get('is_helper', False)),
        specificNeeds=needs,
        additionalDetails=data.get('additionalDetails', ""),
        image=image_filename
    )
    
    user.save()
    return jsonify(user.json()), 201

# Invoked from "sign page"
@main_bp.route('/generate/contract', methods=['GET', 'POST'])
def generate_new_contract():

    data = request.get_json()
    
    user_id = data['user_id']
    helper_id = data['helper_id']
    chat_history = Message.query.filter(((Message.sender == user_id) & (Message.receiver == helper_id)) | ((Message.sender == helper_id) & (Message.receiver == user_id))).all()
    
    user = User.query.filter_by(id=user_id).first()
    helper = User.query.filter_by(id=helper_id).first()
    
    return jsonify({"contract": generate_contract(user, helper, chat_history)}), 200

# Invoked from sign page when user has comments
@main_bp.route('/updateContract', methods=['GET', 'POST'])
def update_contract():

    data = request.get_json()
    
    contract = data['contract']
    requested_changes = data['requested_changes']
    
    return regenerate_contract(contract, requested_changes)

# Invoked from sign page when user clicks "sign". Sends URL to Docusign auth.
@main_bp.route('/readyToSign', methods=['GET', 'POST'])
def ready_to_sign():
    
    return {
        "url": "https://account-d.docusign.com/oauth/auth?response_type=token&scope=signature&client_id=" + os.getenv("DOCUSIGN_INTEGRATION_KEY")
        }

# Invoked from midsign page when the access token is received
@main_bp.route('/signContract', methods=['GET', 'POST'])
def sign_contract():
    
    data = request.get_json()
    
    access_token = data['access_token']
    contract = data['contract']
    user_id = data.get('user_id')
    helper_id = data.get('helper_id')
    
    token = access_token.removesuffix("&expires_in")
    
    envelope_id = generate_envelope(token, user_id, helper_id, contract)
     
    return get_contract_url(token, envelope_id)

# Invoked from the inbox page
@main_bp.route('/getContract/<user_id>/<helper_id>', methods=['GET', 'POST'])
def get_contract(user_id, helper_id):
    
    contract = Contract.query.filter((Contract.user_id == user_id) & (Contract.helper_id == helper_id)).first()
    
    if not contract:
        return jsonify({'error': 'data not found'}), 404

    return jsonify(contract.json()), 200

# Invoked from any detail page
@main_bp.route('/sendMessage/<sender_id>/<receiver_id>', methods=['POST'])
def send_message(sender_id, receiver_id):
    
    data = request.get_json()
    
    content = data['content']
    
    message = Message(sender=sender_id,
                      receiver=receiver_id,
                      content=content)
    
    message.save()
    return jsonify(message.json()), 201

# Invoked from any detail page
@main_bp.route('/getMessages/<sender_id>/<receiver_id>', methods=['GET'])
def get_messages(sender_id, receiver_id):
    
    messages = Message.query.filter(((Message.sender == sender_id) & (Message.receiver == receiver_id)) | ((Message.sender == receiver_id) & (Message.receiver == sender_id))).all()
    
    return jsonify([message.json() for message in messages]), 200

# Invoked from inbox page
@main_bp.route('/getMessageUsers/<user_id>', methods=['GET'])
def get_users_messages(user_id):
    
    messages = Message.query.filter((Message.sender == user_id) | (Message.receiver == user_id)).all()

    other_user_ids = set()
    for message in messages:
        other_user_ids.add(message.sender)
        other_user_ids.add(message.receiver)

    if user_id in other_user_ids:
        other_user_ids.remove(user_id)

    other_users = User.query.filter(User.id.in_(list(other_user_ids)) & (User.id != user_id)).all()

    return jsonify([user.json() for user in other_users]), 200