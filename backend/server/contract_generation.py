import os
from datetime import datetime

import openai
from openai import OpenAI
from pydantic import BaseModel


openai.api_key = os.getenv("OPEN_AI_KEY")
openai_model = "gpt-4o-mini"

client = OpenAI(api_key=os.getenv("OPEN_AI_KEY"))

contract_template = """
Evacuation Assistance Agreement

This Agreement is entered into by and between the following parties:

Volunteer: {Volunteer_Name}  
Recipient: {Recipient_Name}  

The Volunteer agrees to provide assistance to the Recipient under the terms specified in this Agreement. 

1. Items to Be Stored:
   The Volunteer agrees to store the following items and/or house the following individuals/pets:  
    - {Items_Stored}

2. Storage Duration:
   The storage period shall begin on {Start_Date} and end on {End_Date}, unless extended by mutual agreement.

3. Conditions:
   - The Volunteer agrees to handle the stored items with care and will not be responsible for any damage except in cases of negligence or intentional harm.
   - The Recipient agrees to ensure that the items are properly packed, labeled, and suitable for storage.
   - Both parties agree to notify each other in the event of any damages, incidents, or concerns regarding the stored items.

4. Miscellaneous:
   - Both parties agree to the terms and conditions as described and acknowledge that this Agreement is binding upon signatures.
   - This Agreement may be amended only in writing, signed by both parties.

Signatures:

Volunteer Signature: _______________________  
Recipient Signature: _______________________

Date: {Agreement_Date}
"""

keys_meaning = {
    "recipient_name": "the users full name",
    "helper_name": "the helpers full name",
    "needs": "a list in sentance form of what the user needs the volunteers help storing",
    "start_date": "when the volunteer will  begin storing the items/people/pets",
    "end_date": "when the user will take back the items/people/pets from the volunteer"
}

def agreement_info(user, helper, chat_history):
    return {
        "userInformation": { k: v for k, v in user.json().items() if k not in set(("created_on", "updated_on")) },
        "helperInformation": { k: v for k, v in helper.json().items() if k not in set(("created_on", "updated_on")) },
        "chatData": [message.json() for message in chat_history],
        "today": str(datetime.now().strftime('%Y-%m-%d'))
    }

class ContractTemplate(BaseModel):
    helper_name: str
    recipient_name: str
    needs: list[str]
    start_date: str
    end_date: str

def generate_contract(user, helper, chat_history):

    session_content = agreement_info(user, helper, chat_history)

    response = client.beta.chat.completions.parse(
        model=openai_model,
        messages=[
            {
                "role": "developer", 
                "content": "You are an assistant that generates JSON objects with predefined keys based on user data and chat history. The keys are as follows:"f"{keys_meaning}"
            },
            {
                "role": "user", 
                "content": str(session_content)
            }
        ],
        response_format=ContractTemplate
    )
    
    return contract_template.format(
            Volunteer_Name=response.choices[0].message.parsed.helper_name,
            Recipient_Name=response.choices[0].message.parsed.recipient_name,
            Items_Stored=", ".join(response.choices[0].message.parsed.needs),
            Start_Date=response.choices[0].message.parsed.start_date,
            End_Date=response.choices[0].message.parsed.end_date,
            Agreement_Date=str(datetime.now().strftime('%Y-%m-%d'))
        )

def contract_regeneration_info(contract, requested_changes):
    return {
        "contract": contract,
        "requested_changes": requested_changes
    }

def regenerate_contract(contract, requested_changes):
    response = openai.chat.completions.create(
        model=openai_model,
        messages=[
            {
                "role": "developer", 
                "content": "You are an assistant that updates a given contract based on the chagnes requested. The response should only return the updated contacts text. Nothing more."
            },
            {
                "role": "user", 
                "content": contract_regeneration_info(contract, requested_changes)
            }
        ]
    )
    return response.choices[0].message.content