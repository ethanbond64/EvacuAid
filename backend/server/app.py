from flask import Flask
from flask_cors import CORS
from sqlalchemy import text
import os

from server.extensions import db
from server.views import main_bp


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object("server.settings")

    db.init_app(app)

    CORS(
        app,
        resources={r"/*": {"origins": ["http://localhost:3000"]}},
        allow_headers=["Authorization", "Content-Type"],
        methods=["GET", "OPTIONS", "POST", "PUT"],
        max_age=86400,
    )

    app.register_blueprint(main_bp)

    with app.app_context():
        db.drop_all()
        db.create_all()

        # Load and execute the SQL script
        sql_file_path = os.path.join(os.path.dirname(__file__), "populate_users.sql")
        if os.path.exists(sql_file_path):
            with open(sql_file_path, "r") as sql_file:
                sql_script = sql_file.read()
            with db.engine.connect() as connection:
                # Use text() to properly execute the SQL
                connection.execute(text(sql_script))
                connection.commit()

    return app
