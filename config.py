import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv(".env.example")  

class Config:
    # General Flask settings
    SECRET_KEY = os.getenv("SECRET_KEY", "oseko01")

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:12039@localhost:5432/signatures_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Uploads
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 5 * 1024 * 1024))  # 5 MB default

    # Email settings (example for Gmail)
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() in ["true", "1", "yes"]
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "collinsboseko2005@gmail.com")  # Replace with your email
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "qbtymzcmugxtgiky")  # Gmail App Password
