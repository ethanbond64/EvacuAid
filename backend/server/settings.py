import os

DEBUG = False

# Flask
SECRET_KEY = os.getenv("SECRET_KEY")

# Sqlalchemy
DATABASE_FILEPATH = os.path.join(os.getcwd(), 'database.db')
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + DATABASE_FILEPATH
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_pre_ping': True,
    'pool_size': 3,
    'max_overflow': 6,
    'pool_timeout': 10,
    'pool_recycle': 3600
}