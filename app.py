import os
import re
import base64
import uuid
from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename
from flask_mail import Mail, Message
from models import db, Signature
from config import Config
from datetime import datetime

DATA_URI_RE = re.compile(
    r"^data:image/(png|jpg|jpeg);base64,(.+)", re.IGNORECASE)


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    mail = Mail(app)

    db.init_app(app)

    with app.app_context():
        db.drop_all()
        db.create_all()  # ensure DB is created

    
    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route("/api/signatures", methods=["POST"])
    def create_signature():
        if not request.is_json:
            return jsonify({"error": "Expected JSON"}), 400

        data = request.get_json()
        name = (data.get("name") or "").strip().title()
        phone_number = (data.get("phone_number") or "").strip().lower()
        email = (data.get("email") or "").strip()
        signature_data = data.get("signature")
        created_on = datetime.utcnow()

        if not name or not phone_number or not email or not signature_data:
            return jsonify({"error": "name, phone_number, email, and signature are required"}), 400

        phone_pattern = r"^(07|01)\d{8}$"
        if not re.match(phone_pattern, phone_number):
            return jsonify({"error": "Phone number must start with 07 or 01 and contain exactly 10 digits"}), 400

        # Check duplicates
        if Signature.query.filter(db.func.lower(Signature.name) == name.lower()).first():
            return jsonify({"error": f"Name '{name}' is already used"}), 409
        if Signature.query.filter(Signature.phone_number == phone_number).first():
            return jsonify({"error": f"Phone number '{phone_number}' is already used"}), 409
        if Signature.query.filter(db.func.lower(Signature.email) == email.lower()).first():
            return jsonify({"error": f"Email '{email}' is already used"}), 409

        m = DATA_URI_RE.match(signature_data)
        if not m:
            return jsonify({"error": "Invalid image data format"}), 400

        img_type = m.group(1).lower()
        b64data = m.group(2)

        try:
            binary = base64.b64decode(b64data)
        except Exception:
            return jsonify({"error": "Invalid base64 data"}), 400

        uid = uuid.uuid4().hex
        ext = "png" if img_type == "png" else "jpg"
        filename = secure_filename(f"{uid}.{ext}")
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)

        with open(filepath, "wb") as f:
            f.write(binary)

        sig = Signature(name=name, phone_number=phone_number, email=email,
                        filename=filename, created_at=created_on)
        db.session.add(sig)
        db.session.commit()

        return jsonify({"message": "Signature saved successfully",
                        "id": sig.id,
                        "filename": filename}), 201

    @app.route("/api/signatures", methods=["GET"])
    def list_signatures():
        items = Signature.query.order_by(Signature.created_at.desc()).all()
        return jsonify([item.to_dict() for item in items]), 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
