import requests
import base64

from server.models import User, Contract

from docusign_esign import Document, Signer, SignHere, Tabs, EnvelopeDefinition, Recipients, RecipientViewRequest, EnvelopesApi
from docusign_esign.client.api_client import ApiClient
from fpdf import FPDF

from server.models import Contract

def get_envelope_api(token, base_uri):
    api_client = ApiClient()
    api_client.host = base_uri + "/restapi"
    api_client.set_default_header("Authorization", f"Bearer {token}")
    
    return EnvelopesApi(api_client)
    
def generate_envelope(token, user_id, helper_id, contract):
    
    helper = User.query.filter_by(id=helper_id).first()

    user_info = get_user_info(token)
    account_info = user_info["accounts"][0]

    envelope_definition = get_envelope_definition(user_info, contract, helper.email, helper.name)
    
    envelope_id = create_envelope(token, account_info, envelope_definition)
    
    insert_contract(user_id, helper_id, envelope_id)
    
    return envelope_id

  
def get_user_info(access_token):
    docusign_url = "https://account-d.docusign.com/oauth/userinfo"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(docusign_url, headers=headers)

    return response.json()

def get_envelope_definition(user_info, contract, helper_email, helper_name):
    
    contract_with_sign = contract

    # convert our text contract to a base64 file
    base64_file_content = contract_to_pdf_base64(contract_with_sign)

    document = Document(
        document_base64=base64_file_content, 
        name="EvacuAid Community Relief Contract",
        file_extension="pdf", 
        document_id=1
    )

    signer = Signer(
        email=user_info["email"],
        name=user_info["name"],
        recipient_id="1",
        routing_order="1",
        client_user_id=user_info["accounts"][0]["account_id"]
    )

    helper_signer = Signer(
        email=helper_email,
        name=helper_name,
        recipient_id="2",
        routing_order="2",
    )
    
    signature = SignHere(
        anchor_string="Recipient Signature: ",
        anchorXOffset="3.0",
        anchorYOffset="0.0",
        anchorUnits="inches",
        anchor_horizontal_alignment=
        "right"
        
    )
    
    helper_signature = SignHere(
        anchor_string="Volunteer Signature: ",
        anchorXOffset="3.0",
        anchorYOffset="0.0",
        anchorUnits="inches",
        document_id="1",
        page_number="1",
        recipient_id="2",
        anchor_horizontal_alignment="right"
    )
    
    signer.tabs = Tabs(sign_here_tabs=[signature])
    helper_signer.tabs = Tabs(sign_here_tabs=[helper_signature])

    envelope_definition = EnvelopeDefinition(
        email_subject="Please sign this document",
        documents=[document],
        recipients=Recipients(signers=[helper_signer, signer]),
        status="sent"
    )

    return envelope_definition

def create_envelope(token, account_info, envelope_definition):
    
    envelope_api = get_envelope_api(token, account_info["base_uri"])

    results = envelope_api.create_envelope(account_id=account_info["account_id"], envelope_definition=envelope_definition)

    return results.envelope_id
    
def insert_contract(user_id, helper_id, envelope_id):
    contract = Contract(
        user_id=user_id,
        helper_id=helper_id,
        envelope_id=envelope_id
    )
    
    contract.save()

def get_recipient_view(token, user_info, envelope_id):
    
    account_info = user_info["accounts"][0]
    
    envelope_api = get_envelope_api(token, account_info["base_uri"])
    
    recipient_view_request = RecipientViewRequest(
        authentication_method="email",
        client_user_id=account_info["account_id"],
        recipient_id="1",
        return_url="http://localhost:3000/detail",
        user_name=user_info["name"],
        email=user_info["email"]
    )
    
    results = envelope_api.create_recipient_view(
        account_id=account_info["account_id"],
        envelope_id=envelope_id,
        recipient_view_request=recipient_view_request
    )
    
    return {"url": results.url}

def contract_to_pdf_base64(contract):
    
    pdf = FPDF()
    
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, contract)
    pdf_output = pdf.output(dest='S').encode('latin1')
    
    return base64.b64encode(pdf_output).decode("ascii")

def get_contract_url(token, envelope_id):
    
    user_info = get_user_info(token)
    
    return get_recipient_view(token, user_info, envelope_id)