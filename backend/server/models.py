from datetime import datetime, timezone

from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy import ForeignKey

from server.extensions import db

def get_datetime():
    return datetime.now(timezone.utc)

class BaseModel(object):
    created_on = db.Column(db.DateTime(), default=get_datetime)
    updated_on = db.Column(db.DateTime(), default=get_datetime, onupdate=get_datetime)

    def save(self):
        db.session.add(self)
        db.session.commit()
        return self

    def json(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
class User(db.Model, BaseModel):

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    lat = db.Column(db.Float(), nullable=False)
    lng = db.Column(db.Float(), nullable=False)
    is_helper = db.Column(db.Boolean(), nullable=False)
    specificNeeds = db.Column(JSON, nullable=False, default=list)
    additionalDetails = db.Column(db.String(255), nullable=False)
    image = db.Column(db.String(255), nullable=True)
    
class Contract(db.Model, BaseModel):

    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column(db.Integer(), ForeignKey(User.id))
    helper_id = db.Column(db.Integer(), ForeignKey(User.id))
    envelope_id = db.Column(db.String(255), nullable=False)
    
class Message(db.Model, BaseModel):

    id = db.Column(db.Integer(), primary_key=True)
    sender = db.Column(db.Integer(), ForeignKey(User.id))
    receiver = db.Column(db.Integer(), ForeignKey(User.id))
    content = db.Column(db.String(255), nullable=False)