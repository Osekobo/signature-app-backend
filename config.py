import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.expanduser("~")  # /home/ColloOseko

# Ensure folders exist
DB_FOLDER = os.path.join(BASE_DIR, "mysite")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "Signature", "uploads")
os.makedirs(DB_FOLDER, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


class Config:
    # Flask secret key
    SECRET_KEY = os.getenv("SECRET_KEY", "oseko01")

    # Database (SQLite)
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(DB_FOLDER, 'signatures.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Upload settings
    UPLOAD_FOLDER = UPLOAD_FOLDER
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 5 * 1024 * 1024))

    # Email settings
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv("GMAIL_USER")
    MAIL_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
