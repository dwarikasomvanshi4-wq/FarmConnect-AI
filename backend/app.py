import os
import secrets
import time
import json
import firebase_admin
from firebase_admin import credentials, messaging

import requests
import certifi
from uuid import uuid4
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from email_service import send_email
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"), override=True)
# =========================================================
# FIREBASE ADMIN INITIALIZATION
# =========================================================

firebase_app = None

firebase_credentials_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

if firebase_credentials_json:
    try:
        service_account_info = json.loads(firebase_credentials_json)
        firebase_credentials = credentials.Certificate(service_account_info)

        if not firebase_admin._apps:
            firebase_app = firebase_admin.initialize_app(firebase_credentials)
        else:
            firebase_app = firebase_admin.get_app()

        print("Firebase Admin initialized successfully.")

    except Exception:
        app_logger_message = "Firebase Admin initialization failed."
        print(app_logger_message)
else:
    print("Firebase Admin credentials not configured.")
def notify_buyer(buyer_email, subject, message):
    if not buyer_email:
        print("Notification skipped: buyer email is missing.")
        return False

    try:
        result = send_email(
            to_email=buyer_email,
            subject=subject,
            body=message
        )

        if not result:
            print(f"Email notification failed for: {buyer_email}")

        return result

    except Exception:
        app.logger.exception("EMAIL NOTIFICATION ERROR")
        return False



app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
load_dotenv()

app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False
app.config["MAIL_USERNAME"] = os.getenv("SMTP_EMAIL")
app.config["MAIL_PASSWORD"] = os.getenv("SMTP_APP_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("SMTP_EMAIL")

mail = Mail(app)
# Temporary storage for password reset OTPs
pending_password_resets = {}

PASSWORD_RESET_OTP_EXPIRY_SECONDS = 300  # 5 minutes
# Temporary storage for pending registrations
pending_registrations = {}

OTP_EXPIRY_SECONDS = 300  # OTP expires in 5 minutes
CORS(app)

# Temporary storage for login OTPs
pending_login_otps = {}
LOGIN_OTP_EXPIRY_SECONDS = 300  # 5 minutes


# =========================================================
# CONFIGURATION
# =========================================================

 
API_KEY = os.getenv("WEATHER_API_KEY")

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# =========================================================
# DATABASE
# =========================================================


database_url = URL.create(
    drivername="mysql+pymysql",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=4000,
    database=os.getenv("DB_NAME"),
)

engine = create_engine(
    database_url,
    connect_args={
        "ssl_ca": certifi.where(),
        "ssl_verify_cert": True,
        "ssl_verify_identity": True,
    },
    pool_pre_ping=True,
)
# =========================================================
# SEND FARMER PUSH NOTIFICATIONS
# =========================================================

def send_farmer_push_notification(farmer_email, title, body, data=None):

    if not firebase_app:
        print("Push notification skipped: Firebase is not initialized.")
        return

    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT token
                    FROM device_tokens
                    WHERE LOWER(email) = :email
                    AND LOWER(role) = 'farmer'
                """),
                {"email": farmer_email.strip().lower()}
            ).fetchall()

        tokens = [row[0] for row in rows if row[0]]

        if not tokens:
            print("Push notification skipped: No registered farmer devices.")
            return

        # Firebase supports up to 500 tokens per multicast message.
        for start in range(0, len(tokens), 500):
            batch = tokens[start:start + 500]

            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data={
                    str(key): str(value)
                    for key, value in (data or {}).items()
                },
                tokens=batch
            )

            response = messaging.send_each_for_multicast(
                message,
                app=firebase_app
            )

            print(
                f"Farmer push notifications: "
                f"{response.success_count} sent, "
                f"{response.failure_count} failed."
            )

    except Exception:
        app.logger.exception("FARMER PUSH NOTIFICATION ERROR")

    


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return "FarmConnect AI Backend Running"

# =========================================================
# REGISTER FARMER DEVICE FOR PUSH NOTIFICATIONS
# =========================================================

@app.route("/register-device-token", methods=["POST"])
def register_device_token():
    import hashlib

    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    role = str(data.get("role", "")).strip().lower()
    token = str(data.get("token", "")).strip()

    if not email or not token or role != "farmer":
        return jsonify({
            "success": False,
            "message": "Valid farmer email and device token are required."
        }), 400

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()

    try:
        with engine.begin() as conn:
            farmer = conn.execute(
                text("""
                    SELECT id
                    FROM users
                    WHERE LOWER(email) = :email
                    AND LOWER(role) = 'farmer'
                """),
                {"email": email}
            ).fetchone()

            if not farmer:
                return jsonify({
                    "success": False,
                    "message": "Farmer account not found."
                }), 404

            conn.execute(
                text("""
                    INSERT INTO device_tokens
                        (email, role, token, token_hash)
                    VALUES
                        (:email, 'farmer', :token, :token_hash)
                    ON DUPLICATE KEY UPDATE
                        email = VALUES(email),
                        role = VALUES(role),
                        token = VALUES(token),
                        updated_at = CURRENT_TIMESTAMP
                """),
                {
                    "email": email,
                    "token": token,
                    "token_hash": token_hash
                }
            )

        return jsonify({
            "success": True,
            "message": "Farmer device registered for notifications."
        }), 200

    except Exception:
        app.logger.exception("DEVICE TOKEN REGISTRATION ERROR")
        return jsonify({
            "success": False,
            "message": "Unable to register device for notifications."
        }), 500



# =========================================================
# REGISTER
# =========================================================


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    required_fields = ["name", "email", "password", "role"]

    if not all(data.get(field) for field in required_fields):
        return jsonify({
            "message": "Name, email, password, and role are required"
        }), 400

    name = data["name"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    role = data["role"].strip().lower()

    if role not in ["farmer", "buyer"]:
        return jsonify({
            "message": "Role must be farmer or buyer"
        }), 400

    try:
        with engine.connect() as conn:
            existing = conn.execute(
                text("SELECT id FROM users WHERE email = :email"),
                {"email": email}
            ).fetchone()

        if existing:
            return jsonify({
                "message": "Email already registered"
            }), 400

        otp = f"{secrets.randbelow(900000) + 100000}"

        pending_registrations[email] = {
            "name": name,
            "email": email,
            "password": generate_password_hash(password),
            "phone": data.get("phone", ""),
            "address": data.get("address", ""),
            "city": data.get("city", ""),
            "role": role,
            "otp": otp,
            "expires_at": time.time() + OTP_EXPIRY_SECONDS,
            "attempts": 0
        }

        message = Message(
            subject="FarmConnect AI - Registration OTP",
            recipients=[email],
            body=(
                f"Hello {name},\n\n"
                f"Your registration OTP is: {otp}\n\n"
                "This code expires in 5 minutes."
            )
        )

        mail.send(message)

        return jsonify({
            "message": "OTP sent to your email. Verify it to complete registration.",
            "email": email
        }), 200

    except Exception:
        app.logger.exception("REGISTRATION OTP ERROR")
        pending_registrations.pop(email, None)
        return jsonify({
            "message": "Unable to send OTP or start registration"
        }), 500



@app.route("/verify-registration-otp", methods=["POST"])
def verify_registration_otp():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    submitted_otp = str(data.get("otp", "")).strip()

    if not email or not submitted_otp:
        return jsonify({
            "message": "Email and OTP are required"
        }), 400

    pending = pending_registrations.get(email)

    if not pending:
        return jsonify({
            "message": "No pending registration found. Please register again."
        }), 400

    if time.time() > pending["expires_at"]:
        pending_registrations.pop(email, None)
        return jsonify({
            "message": "OTP expired. Please register again."
        }), 400

    if pending["attempts"] >= 5:
        pending_registrations.pop(email, None)
        return jsonify({
            "message": "Too many incorrect attempts. Please register again."
        }), 429

    if not secrets.compare_digest(pending["otp"], submitted_otp):
        pending["attempts"] += 1
        return jsonify({
            "message": "Incorrect OTP. Please try again."
        }), 400

    try:
        with engine.begin() as conn:
            existing = conn.execute(
                text("SELECT id FROM users WHERE email = :email"),
                {"email": email}
            ).fetchone()

            if existing:
                pending_registrations.pop(email, None)
                return jsonify({
                    "message": "Email already registered"
                }), 400

            conn.execute(
                text("""
                    INSERT INTO users
                    (name, email, phone, address, city, password, role)
                    VALUES
                    (:name, :email, :phone, :address, :city, :password, :role)
                """),
                {
                    "name": pending["name"],
                    "email": pending["email"],
                    "phone": pending["phone"],
                    "address": pending["address"],
                    "city": pending["city"],
                    "password": pending["password"],
                    "role": pending["role"]
                }
            )

        pending_registrations.pop(email, None)

        return jsonify({
            "message": "Email verified and user registered successfully"
        }), 201

    except Exception:
        app.logger.exception("OTP VERIFICATION ERROR")
        return jsonify({
            "message": "Registration failed"
        }), 500



# =========================================================
# GET PROFILE
# =========================================================


# =========================================================
# GET USER PROFILE
# =========================================================

@app.route("/profile/<email>", methods=["GET"])
def get_profile(email):
    try:
        normalized_email = email.strip().lower()

        with engine.connect() as conn:
            user = conn.execute(
                text("""
                    SELECT id, name, email, phone, address, city, role
                    FROM users
                    WHERE LOWER(TRIM(email)) = :email
                """),
                {"email": normalized_email}
            ).mappings().first()

        if not user:
            return jsonify({"message": "User not found"}), 404

        return jsonify({
            "id": user["id"],
            "name": user["name"] or "",
            "email": user["email"],
            "phone": user["phone"] or "",
            "address": user["address"] or "",
            "city": user["city"] or "",
            "role": user["role"] or ""
        }), 200

    except Exception:
        app.logger.exception("PROFILE ERROR")
        return jsonify({"message": "Unable to fetch profile"}), 500


# =========================================================
# UPDATE USER PROFILE
# =========================================================

@app.route("/profile/<email>", methods=["PUT"])
def update_profile(email):
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    phone = "".join(
        character for character in str(data.get("phone", ""))
        if character.isdigit()
    )
    address = str(data.get("address", "")).strip()
    city = str(data.get("city", "")).strip()

    if not name:
        return jsonify({"message": "Name is required"}), 400

    if len(phone) != 10:
        return jsonify({
            "message": "Please enter a valid 10-digit phone number"
        }), 400

    try:
        normalized_email = email.strip().lower()

        with engine.begin() as conn:
            result = conn.execute(
                text("""
                    UPDATE users
                    SET
                        name = :name,
                        phone = :phone,
                        address = :address,
                        city = :city
                    WHERE LOWER(TRIM(email)) = :email
                """),
                {
                    "name": name,
                    "phone": phone,
                    "address": address,
                    "city": city,
                    "email": normalized_email
                }
            )

            if result.rowcount == 0:
                return jsonify({"message": "User not found"}), 404

        return jsonify({
            "message": "Profile updated successfully"
        }), 200

    except Exception:
        app.logger.exception("UPDATE PROFILE ERROR")
        return jsonify({"message": "Unable to update profile"}), 500

# =========================================================
# LOGIN
# =========================================================


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    try:
        with engine.begin() as conn:
            user = conn.execute(
                text("""
                    SELECT *
                    FROM users
                    WHERE email = :email
                """),
                {"email": email}
            ).fetchone()

            if not user:
                return jsonify({
                    "message": "Invalid Email or Password"
                }), 401

            stored_password = user.password
            password_valid = False

            try:
                password_valid = check_password_hash(
                    stored_password, password
                )
            except (ValueError, TypeError):
                password_valid = False

            # Migrate legacy plain-text passwords to hashes
            if not password_valid and stored_password == password:
                password_valid = True

                conn.execute(
                    text("""
                        UPDATE users
                        SET password = :password
                        WHERE id = :id
                    """),
                    {
                        "password": generate_password_hash(password),
                        "id": user.id
                    }
                )

            if not password_valid:
                return jsonify({
                    "message": "Invalid Email or Password"
                }), 401

            return jsonify({
                "message": "Login Successful",
                "role": user.role,
                "email": user.email,
                "name": user.name
            }), 200

    except Exception:
        app.logger.exception("LOGIN ERROR")
        return jsonify({
            "message": "Login failed due to a server error"
        }), 500


@app.route("/request-login-otp", methods=["POST"])
def request_login_otp():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    try:
        with engine.begin() as conn:
            user = conn.execute(
                text("""
                    SELECT *
                    FROM users
                    WHERE email = :email
                """),
                {"email": email}
            ).fetchone()

            if not user:
                return jsonify({
                    "message": "Invalid email or password"
                }), 401

            stored_password = user.password
            password_valid = False

            try:
                password_valid = check_password_hash(
                    stored_password, password
                )
            except (ValueError, TypeError):
                password_valid = False

            # Support legacy plain-text passwords as well
            if not password_valid and stored_password == password:
                password_valid = True

                conn.execute(
                    text("""
                        UPDATE users
                        SET password = :password
                        WHERE id = :id
                    """),
                    {
                        "password": generate_password_hash(password),
                        "id": user.id
                    }
                )

            if not password_valid:
                return jsonify({
                    "message": "Invalid email or password"
                }), 401

            user_name = user.name
            user_role = user.role

        otp = f"{secrets.randbelow(900000) + 100000}"

        pending_login_otps[email] = {
            "otp": otp,
            "expires_at": time.time() + LOGIN_OTP_EXPIRY_SECONDS,
            "attempts": 0,
            "name": user_name,
            "role": user_role
        }

        message = Message(
            subject="FarmConnect AI - Login OTP",
            recipients=[email],
            body=(
                f"Hello {user_name},\n\n"
                f"Your login OTP is: {otp}\n\n"
                "This code expires in 5 minutes."
            )
        )

        mail.send(message)

        return jsonify({
            "message": "Login OTP sent to your email",
            "email": email
        }), 200

    except Exception:
        app.logger.exception("LOGIN OTP REQUEST ERROR")
        pending_login_otps.pop(email, None)

        return jsonify({
            "message": "Unable to send login OTP"
        }), 500


@app.route("/verify-login-otp", methods=["POST"])
def verify_login_otp():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    submitted_otp = str(data.get("otp", "")).strip()

    if not email or not submitted_otp:
        return jsonify({
            "message": "Email and OTP are required"
        }), 400

    pending = pending_login_otps.get(email)

    if not pending:
        return jsonify({
            "message": "No pending login OTP. Please log in again."
        }), 400

    if time.time() > pending["expires_at"]:
        pending_login_otps.pop(email, None)

        return jsonify({
            "message": "OTP expired. Please log in again."
        }), 400

    if pending["attempts"] >= 5:
        pending_login_otps.pop(email, None)

        return jsonify({
            "message": "Too many incorrect attempts. Please log in again."
        }), 429

    if not secrets.compare_digest(pending["otp"], submitted_otp):
        pending["attempts"] += 1

        return jsonify({
            "message": "Incorrect OTP. Please try again."
        }), 400

    pending_login_otps.pop(email, None)

    return jsonify({
        "message": "Login successful",
        "email": email,
        "name": pending["name"],
        "role": pending["role"]
    }), 200

# =========================================================
# ADD CROP
# =========================================================


@app.route("/add-crop", methods=["POST"])
def add_crop():
    data = request.get_json(silent=True) or {}

    farmer_email = (data.get("farmer_email") or "").strip().lower()
    crop_name = (data.get("crop_name") or "").strip()

    if not farmer_email or not crop_name:
        return jsonify({
            "error": "Farmer email and crop name are required"
        }), 400

    # Location is optional, so older frontend requests still work.
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    try:
        if latitude is not None:
            latitude = float(latitude)
            if not -90 <= latitude <= 90:
                raise ValueError("Latitude is out of range")

        if longitude is not None:
            longitude = float(longitude)
            if not -180 <= longitude <= 180:
                raise ValueError("Longitude is out of range")

        # Require both coordinates together, or neither.
        if (latitude is None) != (longitude is None):
            return jsonify({
                "error": "Latitude and longitude must be provided together"
            }), 400

    except (TypeError, ValueError):
        return jsonify({
            "error": "Invalid latitude or longitude"
        }), 400

    try:
        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO crops (
                        farmer_email,
                        crop_name,
                        category,
                        quantity,
                        price,
                        description,
                        image,
                        latitude,
                        longitude
                    )
                    VALUES (
                        :farmer_email,
                        :crop_name,
                        :category,
                        :quantity,
                        :price,
                        :description,
                        :image,
                        :latitude,
                        :longitude
                    )
                """),
                {
                    "farmer_email": farmer_email,
                    "crop_name": crop_name,
                    "category": data.get("category"),
                    "quantity": data.get("quantity"),
                    "price": data.get("price"),
                    "description": data.get("description", ""),
                    "image": data.get("image", ""),
                    "latitude": latitude,
                    "longitude": longitude
                }
            )

        return jsonify({
            "message": "Crop added successfully",
            "location_saved": latitude is not None
        }), 201

    except Exception:
        app.logger.exception("ADD CROP ERROR")
        return jsonify({
            "error": "Unable to add crop"
        }), 500

# =========================================================
# VIEW CROPS
# =========================================================


@app.route("/crops", methods=["GET"])
def get_crops():
    try:
        with engine.connect() as conn:
            crops = conn.execute(
                text("""
                    SELECT
                        id,
                        farmer_email,
                        crop_name,
                        category,
                        quantity,
                        price,
                        description,
                        image,
                        latitude,
                        longitude
                    FROM crops
                    ORDER BY id DESC
                """)
            ).mappings().all()

        result = [
            {
                "id": crop["id"],
                "farmer_email": crop["farmer_email"],
                "crop_name": crop["crop_name"],
                "category": crop["category"],
                "quantity": crop["quantity"],
                "price": float(crop["price"] or 0),
                "description": crop["description"] or "",
                "image": crop["image"] or "",
                "latitude": (
                    float(crop["latitude"])
                    if crop["latitude"] is not None else None
                ),
                "longitude": (
                    float(crop["longitude"])
                    if crop["longitude"] is not None else None
                )
            }
            for crop in crops
        ]

        return jsonify(result), 200

    except Exception:
        app.logger.exception("GET CROPS ERROR")
        return jsonify({
            "error": "Unable to fetch crops"
        }), 500


@app.route("/nearby-crops", methods=["GET"])
def nearby_crops():
    try:
        latitude = float(request.args.get("lat", ""))
        longitude = float(request.args.get("lon", ""))
        radius_km = float(request.args.get("radius", "25"))

        if not (-90 <= latitude <= 90):
            raise ValueError("Invalid latitude")

        if not (-180 <= longitude <= 180):
            raise ValueError("Invalid longitude")

        if not (1 <= radius_km <= 200):
            return jsonify({
                "error": "Radius must be between 1 and 200 km"
            }), 400

    except (TypeError, ValueError):
        return jsonify({
            "error": "Valid latitude, longitude, and radius are required"
        }), 400

    try:
        with engine.connect() as conn:
            crops = conn.execute(
                text("""
                    SELECT
                        id,
                        farmer_email,
                        crop_name,
                        category,
                        quantity,
                        price,
                        description,
                        image,
                        latitude,
                        longitude,
                        (
                            6371 * ACOS(
                                LEAST(1.0, GREATEST(-1.0,
                                    COS(RADIANS(:lat))
                                    * COS(RADIANS(latitude))
                                    * COS(RADIANS(longitude) - RADIANS(:lon))
                                    + SIN(RADIANS(:lat))
                                    * SIN(RADIANS(latitude))
                                ))
                            )
                        ) AS distance_km
                    FROM crops
                    WHERE latitude IS NOT NULL
                      AND longitude IS NOT NULL
                      AND quantity > 0
                    HAVING distance_km <= :radius
                    ORDER BY distance_km ASC
                """),
                {
                    "lat": latitude,
                    "lon": longitude,
                    "radius": radius_km
                }
            ).mappings().all()

        result = [
            {
                "id": crop["id"],
                "farmer_email": crop["farmer_email"],
                "crop_name": crop["crop_name"],
                "category": crop["category"],
                "quantity": crop["quantity"],
                "price": float(crop["price"] or 0),
                "description": crop["description"] or "",
                "image": crop["image"] or "",
                "latitude": float(crop["latitude"]),
                "longitude": float(crop["longitude"]),
                "distance_km": round(float(crop["distance_km"]), 2)
            }
            for crop in crops
        ]

        return jsonify(result), 200

    except Exception:
        app.logger.exception("NEARBY CROPS ERROR")
        return jsonify({
            "error": "Unable to find nearby crops"
        }), 500



# =========================================================
# UPDATE CROP
# =========================================================

@app.route("/update-crop/<int:id>", methods=["PUT"])
def update_crop(id):

    data = request.json

    try:

        with engine.connect() as conn:

            conn.execute(
                text("""
                    UPDATE crops

                    SET
                        crop_name = :crop_name,
                        category = :category,
                        quantity = :quantity,
                        price = :price,
                        description = :description

                    WHERE id = :id
                """),
                {
                    "id": id,
                    "crop_name": data["crop_name"],
                    "category": data["category"],
                    "quantity": data["quantity"],
                    "price": data["price"],
                    "description": data["description"]
                }
            )

            conn.commit()


        return jsonify({
            "message": "Crop Updated Successfully"
        })


    except Exception as e:

        print("UPDATE CROP ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# DELETE CROP
# =========================================================

@app.route("/delete-crop/<int:id>", methods=["DELETE"])
def delete_crop(id):

    try:

        with engine.connect() as conn:

            conn.execute(
                text("""
                    DELETE FROM crops
                    WHERE id = :id
                """),
                {
                    "id": id
                }
            )

            conn.commit()


        return jsonify({
            "message": "Crop Deleted Successfully"
        })


    except Exception as e:

        print("DELETE CROP ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# IMAGE UPLOAD
# =========================================================


# =========================================================
# IMAGE UPLOAD
# =========================================================

@app.route("/upload-image", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    if not file or not file.filename:
        return jsonify({"error": "No file selected"}), 400

    original_filename = secure_filename(file.filename)

    if not original_filename:
        return jsonify({"error": "Invalid filename"}), 400

    extension = os.path.splitext(original_filename)[1].lower()
    filename = f"{uuid4().hex}{extension}"

    upload_folder = app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)

    filepath = os.path.join(upload_folder, filename)

    try:
        file.save(filepath)

        # Generate a browser-accessible image URL.
        image_url = request.host_url.rstrip("/") + f"/uploads/{filename}"

        return jsonify({
            "message": "Image uploaded successfully",
            "filename": filename,
            "file_path": image_url,
            "image_url": image_url
        }), 201

    except Exception:
        app.logger.exception("IMAGE UPLOAD ERROR")

        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError:
                pass

        return jsonify({"error": "Unable to upload image"}), 500


# =========================================================
# SERVE UPLOADED IMAGES
# =========================================================

@app.route("/uploads/<path:filename>", methods=["GET"])
def uploaded_file(filename):
    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )


# =========================================================
# WEATHER
# =========================================================

@app.route("/weather", methods=["GET"])
def weather():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not lat or not lon:
        return jsonify({
            "error": "Latitude and longitude are required."
        }), 400

    try:
        lat = float(lat)
        lon = float(lon)
    except (TypeError, ValueError):
        return jsonify({
            "error": "Invalid latitude or longitude."
        }), 400

    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return jsonify({
            "error": "Latitude or longitude is out of range."
        }), 400

    url = "https://api.openweathermap.org/data/2.5/weather"

    try:
        response = requests.get(
            url,
            params={
                "lat": lat,
                "lon": lon,
                "appid": API_KEY,
                "units": "metric"
            },
            timeout=10
        )

        data = response.json()

        if response.status_code != 200:
            app.logger.error("Weather API error: %s", data)
            return jsonify({
                "error": data.get("message", "Unable to fetch weather.")
            }), response.status_code

        return jsonify({
            "city": data.get("name", "Current location"),
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "weather": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"]
        })

    except requests.RequestException:
        app.logger.exception("Weather API request failed")
        return jsonify({
            "error": "Weather service is temporarily unavailable."
        }), 502

@app.route("/weather/<city>", methods=["GET"])
def weather_by_city(city):
    if not API_KEY:
        return jsonify({"error": "Weather API key is not configured."}), 500

    url = "https://api.openweathermap.org/data/2.5/weather"

    try:
        response = requests.get(
            url,
            params={
                "q": city,
                "appid": API_KEY,
                "units": "metric"
            },
            timeout=10
        )

        data = response.json()

        if response.status_code != 200:
            app.logger.error("Weather API error: %s", data)
            return jsonify({
                "error": data.get("message", "Unable to fetch weather.")
            }), response.status_code

        return jsonify({
            "city": data.get("name", city),
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "weather": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"]
        })

    except requests.RequestException:
        app.logger.exception("Weather API request failed")
        return jsonify({
            "error": "Weather service is temporarily unavailable."
        }), 502
# =========================================================
# FEEDBACK
# =========================================================

@app.route("/feedback", methods=["POST"])
def feedback():

    data = request.json

    try:

        with engine.connect() as conn:

            conn.execute(
                text("""
                    INSERT INTO feedback
                    (
                        buyer_email,
                        farmer_email,
                        rating,
                        comments
                    )

                    VALUES
                    (
                        :buyer_email,
                        :farmer_email,
                        :rating,
                        :comments
                    )
                """),
                {
                    "buyer_email": data["buyer_email"],
                    "farmer_email": data["farmer_email"],
                    "rating": data["rating"],
                    "comments": data["comments"]
                }
            )

            conn.commit()


        return jsonify({
            "message": "Feedback Submitted Successfully"
        })


    except Exception as e:

        print("FEEDBACK ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# PLACE ORDER
# =========================================================
# =========================================================
# PLACE ORDER
# =========================================================




@app.route("/place-order", methods=["POST"])
def place_order():
    data = request.get_json(silent=True) or {}

    buyer_email = (data.get("buyer_email") or "").strip().lower()
    farmer_email = (data.get("farmer_email") or "").strip().lower()
    crop_name = (data.get("crop_name") or "").strip()
    delivery_address = (data.get("delivery_address") or "").strip()

    try:
        crop_id = int(data.get("crop_id"))
        quantity = int(data.get("quantity", 0))
    except (TypeError, ValueError):
        return jsonify({
            "error": "Valid crop ID and quantity are required"
        }), 400

    if not buyer_email or not farmer_email or not crop_name:
        return jsonify({
            "error": "Buyer email, farmer email, and crop name are required"
        }), 400

    if not delivery_address:
        return jsonify({
            "error": "Delivery address is required"
        }), 400

    if quantity <= 0:
        return jsonify({
            "error": "Quantity must be greater than zero"
        }), 400

    try:
        with engine.begin() as conn:
            # Lock the crop row and check available stock
            crop = conn.execute(
                text("""
                    SELECT id, farmer_email, crop_name, quantity, price
                    FROM crops
                    WHERE id = :crop_id
                    FOR UPDATE
                """),
                {"crop_id": crop_id}
            ).mappings().first()

            if not crop:
                return jsonify({
                    "error": "Crop listing not found"
                }), 404

            actual_farmer_email = (
                crop["farmer_email"] or ""
            ).strip().lower()

            if actual_farmer_email != farmer_email:
                return jsonify({
                    "error": "Farmer does not match this crop"
                }), 400

            actual_crop_name = (crop["crop_name"] or "").strip()

            if actual_crop_name.lower() != crop_name.lower():
                return jsonify({
                    "error": "Crop name does not match the listing"
                }), 400

            available_quantity = int(crop["quantity"] or 0)

            if quantity > available_quantity:
                return jsonify({
                    "error": f"Only {available_quantity} kg is available"
                }), 400

            total_price = round(float(crop["price"] or 0) * quantity, 2)

            # Deduct stock
            conn.execute(
                text("""
                    UPDATE crops
                    SET quantity = quantity - :quantity
                    WHERE id = :crop_id
                """),
                {
                    "quantity": quantity,
                    "crop_id": crop_id
                }
            )

            # Save the order
            order_result = conn.execute(
                text("""
                    INSERT INTO orders (
                        crop_id,
                        buyer_email,
                        farmer_email,
                        crop_name,
                        quantity,
                        total_price,
                        status,
                        payment_method,
                        payment_status,
                        delivery_address
                    )
                    VALUES (
                        :crop_id,
                        :buyer_email,
                        :farmer_email,
                        :crop_name,
                        :quantity,
                        :total_price,
                        :status,
                        :payment_method,
                        :payment_status,
                        :delivery_address
                    )
                """),
                {
                    "crop_id": crop_id,
                    "buyer_email": buyer_email,
                    "farmer_email": actual_farmer_email,
                    "crop_name": actual_crop_name,
                    "quantity": quantity,
                    "total_price": total_price,
                    "status": "Pending",
                    "payment_method": "COD",
                    "payment_status": "Pending",
                    "delivery_address": delivery_address,
                }
            )

            order_id = order_result.lastrowid

        # The database transaction has succeeded.
        # Email failures should not undo the saved order.

        # 1. Notify the buyer
        try:
            notify_buyer(
                buyer_email=buyer_email,
                subject="FarmConnect AI - Order Placed Successfully",
                message=(
                    "Hello!\n\n"
                    "Your order has been placed successfully.\n\n"
                    f"Order ID: {order_id}\n"
                    f"Crop: {actual_crop_name}\n"
                    f"Quantity: {quantity} kg\n"
                    f"Total price: ₹{total_price:.2f}\n"
                    "Order status: Pending\n"
                    "Payment method: Cash on Delivery (COD)\n"
                    "Payment status: Pending\n"
                    f"Delivery address: {delivery_address}\n\n"
                    "Thank you for using FarmConnect AI!"
                )
            )
        except Exception:
            app.logger.exception(
                "Buyer email notification failed for order %s",
                order_id
            )

                # 2. Notify the farmer
        try:
            notify_buyer(
                buyer_email=actual_farmer_email,
                subject="FarmConnect AI - New Order Received",
                message=(
                    "Hello Farmer!\n\n"
                    "You have received a new order on FarmConnect AI.\n\n"
                    f"Order ID: {order_id}\n"
                    f"Crop: {actual_crop_name}\n"
                    f"Quantity ordered: {quantity} kg\n"
                    f"Buyer email: {buyer_email}\n"
                    f"Delivery address: {delivery_address}\n"
                    f"Total order value: ₹{total_price:.2f}\n"
                    "Order status: Pending\n"
                    "Payment method: Cash on Delivery (COD)\n"
                    "Payment status: Pending\n\n"
                    "Please log in to FarmConnect AI to view and "
                    "manage this order.\n\n"
                    "Thank you,\n"
                    "FarmConnect AI Team"
                )
            )
        except Exception:
            app.logger.exception(
                "Farmer email notification failed for order %s",
                order_id
            )
        # 3. Send push notification to the farmer's device
        send_farmer_push_notification(
            farmer_email=actual_farmer_email,
            title="New Order Received!",
            body=(
                f"You received an order for "
                f"{quantity} kg of {actual_crop_name}."
            ),
            data={
                "type": "new_order",
                "order_id": order_id,
                "crop_name": actual_crop_name
            }
        )

        return jsonify({
            "message": "Order placed successfully",
            "order_id": order_id,
            "status": "Pending",
            "quantity": quantity,
            "remaining_stock": available_quantity - quantity,
            "total_price": total_price,
            "delivery_address": delivery_address,
            "payment_method": "COD",
            "payment_status": "Pending"
        }), 201

    except Exception:
        app.logger.exception("PLACE ORDER ERROR")
        return jsonify({
            "error": "Unable to place order"
        }), 500



# =========================================================
# GET FARMER ORDERS
# =========================================================

@app.route("/farmer-orders/<email>", methods=["GET"])
def farmer_orders(email):
    try:
        farmer_email = (email or "").strip().lower()

        with engine.connect() as conn:
            orders = conn.execute(
                text("""
                    SELECT
                        id,
                        crop_id,
                        buyer_email,
                        farmer_email,
                        crop_name,
                        quantity,
                        total_price,
                        status,
                        order_date,
                        delivery_address,
                        payment_method,
                        payment_status
                    FROM orders
                    WHERE LOWER(TRIM(farmer_email)) = :email
                    ORDER BY id DESC
                """),
                {"email": farmer_email}
            ).mappings().all()

        result = [
            {
                "id": order["id"],
                "crop_id": order["crop_id"],
                "buyer_email": order["buyer_email"],
                "farmer_email": order["farmer_email"],
                "crop_name": order["crop_name"],
                "quantity": order["quantity"],
                "total_price": float(order["total_price"] or 0),
                "status": order["status"] or "Pending",
                "order_date": str(order["order_date"]) if order["order_date"] else "",
                "delivery_address": order["delivery_address"] or "",
                "payment_method": order["payment_method"] or "COD",
                "payment_status": order["payment_status"] or "Pending"
            }
            for order in orders
        ]

        return jsonify(result), 200

    except Exception:
        app.logger.exception("FARMER ORDERS ERROR")
        return jsonify({"error": "Unable to fetch farmer orders"}), 500


# =========================================================
# GET BUYER ORDERS
# =========================================================


@app.route("/buyer-orders/<email>", methods=["GET"])
def buyer_orders(email):
    try:
        buyer_email = (email or "").strip().lower()

        with engine.connect() as conn:
            orders = conn.execute(
                text("""
                    SELECT
                        o.id,
                        o.crop_id,
                        o.buyer_email,
                        o.farmer_email,
                        o.crop_name,
                        o.quantity,
                        o.total_price,
                        o.status,
                        o.order_date,
                        o.delivery_address,
                        o.payment_method,
                        o.payment_status,
                        u.name AS farmer_name,
                        u.phone AS farmer_phone
                    FROM orders o
                    LEFT JOIN users u
                        ON LOWER(TRIM(u.email)) = LOWER(TRIM(o.farmer_email))
                    WHERE LOWER(TRIM(o.buyer_email)) = :email
                    ORDER BY o.id DESC
                """),
                {"email": buyer_email}
            ).mappings().all()

        result = [
            {
                "id": order["id"],
                "crop_id": order["crop_id"],
                "buyer_email": order["buyer_email"],
                "farmer_email": order["farmer_email"],
                "farmer_name": order["farmer_name"] or "",
                "farmer_phone": order["farmer_phone"] or "",
                "crop_name": order["crop_name"],
                "quantity": order["quantity"],
                "total_price": float(order["total_price"] or 0),
                "status": order["status"] or "Pending",
                "order_date": str(order["order_date"]) if order["order_date"] else "",
                "delivery_address": order["delivery_address"] or "",
                "payment_method": order["payment_method"] or "COD",
                "payment_status": order["payment_status"] or "Pending"
            }
            for order in orders
        ]

        return jsonify(result), 200

    except Exception:
        app.logger.exception("BUYER ORDERS ERROR")
        return jsonify({"error": "Unable to fetch buyer orders"}), 500

# =========================================================
# ORDER CHAT - GET MESSAGES
# =========================================================

@app.route("/order-messages/<int:order_id>", methods=["GET"])
def get_order_messages(order_id):
    requester_email = (
        request.args.get("email") or ""
    ).strip().lower()

    if not requester_email:
        return jsonify({"error": "Email is required"}), 400

    try:
        with engine.connect() as conn:
            order = conn.execute(
                text("""
                    SELECT buyer_email, farmer_email
                    FROM orders
                    WHERE id = :order_id
                """),
                {"order_id": order_id}
            ).mappings().first()

            if not order:
                return jsonify({"error": "Order not found"}), 404

            participants = {
                (order["buyer_email"] or "").strip().lower(),
                (order["farmer_email"] or "").strip().lower()
            }

            if requester_email not in participants:
                return jsonify({"error": "Access denied"}), 403

            messages = conn.execute(
                text("""
                    SELECT
                        id,
                        order_id,
                        sender_email,
                        receiver_email,
                        message,
                        image_url,
                        created_at,
                        is_read
                    FROM messages
                    WHERE order_id = :order_id
                    ORDER BY created_at ASC, id ASC
                """),
                {"order_id": order_id}
            ).mappings().all()

        return jsonify([
            {
                "id": item["id"],
                "order_id": item["order_id"],
                "sender_email": item["sender_email"],
                "receiver_email": item["receiver_email"],
                "message": item["message"] or "",
                "image_url": item["image_url"] or "",
                "created_at": str(item["created_at"]),
                "is_read": bool(item["is_read"])
            }
            for item in messages
        ]), 200

    except Exception:
        app.logger.exception("GET ORDER MESSAGES ERROR")
        return jsonify({"error": "Unable to load messages"}), 500


# =========================================================
# ORDER CHAT - SEND MESSAGE
# =========================================================

@app.route("/send-message", methods=["POST"])
def send_message():
    data = request.get_json(silent=True) or {}

    try:
        order_id = int(data.get("order_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid order ID is required"}), 400

    sender_email = (
        data.get("sender_email") or ""
    ).strip().lower()

    receiver_email = (
        data.get("receiver_email") or ""
    ).strip().lower()

    message = (data.get("message") or "").strip()
    image_url = (data.get("image_url") or "").strip()

    if not sender_email or not receiver_email:
        return jsonify({
            "error": "Sender and receiver emails are required"
        }), 400

    if not message and not image_url:
        return jsonify({
            "error": "Please enter a message or attach an image"
        }), 400

    try:
        with engine.begin() as conn:
            order = conn.execute(
                text("""
                    SELECT buyer_email, farmer_email
                    FROM orders
                    WHERE id = :order_id
                """),
                {"order_id": order_id}
            ).mappings().first()

            if not order:
                return jsonify({"error": "Order not found"}), 404

            buyer_email = (
                order["buyer_email"] or ""
            ).strip().lower()

            farmer_email = (
                order["farmer_email"] or ""
            ).strip().lower()

            valid_pair = {
                (buyer_email, farmer_email),
                (farmer_email, buyer_email)
            }

            if (sender_email, receiver_email) not in valid_pair:
                return jsonify({
                    "error": "Sender and receiver must belong to this order"
                }), 403

            result = conn.execute(
                text("""
                    INSERT INTO messages (
                        order_id,
                        sender_email,
                        receiver_email,
                        message,
                        image_url
                    )
                    VALUES (
                        :order_id,
                        :sender_email,
                        :receiver_email,
                        :message,
                        :image_url
                    )
                """),
                {
                    "order_id": order_id,
                    "sender_email": sender_email,
                    "receiver_email": receiver_email,
                    "message": message,
                    "image_url": image_url
                }
            )

            message_id = result.lastrowid

        return jsonify({
            "message": "Message sent successfully",
            "message_id": message_id
        }), 201

    except Exception:
        app.logger.exception("SEND MESSAGE ERROR")
        return jsonify({"error": "Unable to send message"}), 500
    

# =========================================================
# GLOBAL CHAT - GET ALL CONVERSATIONS
# =========================================================


# =========================================================
# GLOBAL CHAT - GET ALL CONVERSATIONS
# =========================================================


@app.route("/chat-conversations/<path:email>", methods=["GET"])
def get_chat_conversations(email):
    email = email.strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT
                        o.id AS order_id,
                        o.crop_name,
                        o.buyer_email,
                        o.farmer_email,

                        CASE
                            WHEN LOWER(o.buyer_email) = :email
                            THEN o.farmer_email
                            ELSE o.buyer_email
                        END AS other_email,

                        CASE
                            WHEN LOWER(o.buyer_email) = :email
                            THEN COALESCE(
                                NULLIF(farmer.name, ''),
                                o.farmer_email
                            )
                            ELSE COALESCE(
                                NULLIF(buyer.name, ''),
                                o.buyer_email
                            )
                        END AS other_name,

                        COALESCE(
                            NULLIF(m.message, ''),
                            CASE
                                WHEN m.image_url IS NOT NULL
                                THEN 'Photo'
                                ELSE ''
                            END
                        ) AS last_message,

                        m.created_at AS last_message_at,

                        COALESCE(unread.unread_count, 0) AS unread_count

                    FROM orders o

                    LEFT JOIN users buyer
                        ON LOWER(buyer.email) = LOWER(o.buyer_email)

                    LEFT JOIN users farmer
                        ON LOWER(farmer.email) = LOWER(o.farmer_email)

                    INNER JOIN (
                        SELECT
                            order_id,
                            MAX(id) AS latest_message_id
                        FROM messages
                        GROUP BY order_id
                    ) latest
                        ON latest.order_id = o.id

                    INNER JOIN messages m
                        ON m.id = latest.latest_message_id

                    LEFT JOIN (
                        SELECT
                            order_id,
                            COUNT(*) AS unread_count
                        FROM messages
                        WHERE LOWER(receiver_email) = :email
                          AND is_read = 0
                        GROUP BY order_id
                    ) unread
                        ON unread.order_id = o.id

                    WHERE LOWER(o.buyer_email) = :email
                       OR LOWER(o.farmer_email) = :email

                    ORDER BY m.created_at DESC, m.id DESC
                """),
                {"email": email}
            ).mappings().all()

        return jsonify([dict(row) for row in rows]), 200

    except Exception as e:
        print("Chat conversations error:", str(e))
        return jsonify({"error": "Unable to load conversations"}), 500


# =========================================================
# GLOBAL CHAT - MARK MESSAGES AS READ
# =========================================================

@app.route("/mark-messages-read/<int:order_id>", methods=["POST"])
def mark_messages_read(order_id):
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        with engine.begin() as conn:
            order = conn.execute(
                text("""
                    SELECT buyer_email, farmer_email
                    FROM orders
                    WHERE id = :order_id
                """),
                {"order_id": order_id}
            ).mappings().first()

            if not order:
                return jsonify({"error": "Order not found"}), 404

            participants = {
                (order["buyer_email"] or "").lower(),
                (order["farmer_email"] or "").lower()
            }

            if email not in participants:
                return jsonify({"error": "Access denied"}), 403

            conn.execute(
                text("""
                    UPDATE messages
                    SET is_read = 1
                    WHERE order_id = :order_id
                      AND LOWER(receiver_email) = :email
                      AND is_read = 0
                """),
                {
                    "order_id": order_id,
                    "email": email
                }
            )

        return jsonify({
            "success": True,
            "message": "Messages marked as read"
        }), 200

    except Exception as e:
        print("Mark messages read error:", str(e))
        return jsonify({"error": "Unable to update messages"}), 500



# =========================================================
# FARMER SALES ANALYTICS
# =========================================================

@app.route("/farmer-sales-analytics/<email>", methods=["GET"])
def farmer_sales_analytics(email):

    farmer_email = (email or "").strip().lower()

    if not farmer_email:
        return jsonify({
            "error": "Farmer email is required"
        }), 400

    try:
        with engine.connect() as conn:

            # 1. Overall sales summary
            summary = conn.execute(
                text("""
                    SELECT
                        COUNT(*) AS total_orders,

                        SUM(
                            CASE
                                WHEN LOWER(TRIM(status)) = 'delivered'
                                THEN 1 ELSE 0
                            END
                        ) AS delivered_orders,

                        SUM(
                            CASE
                                WHEN LOWER(TRIM(status)) = 'pending'
                                THEN 1 ELSE 0
                            END
                        ) AS pending_orders,

                        SUM(
                            CASE
                                WHEN LOWER(TRIM(status)) = 'accepted'
                                THEN 1 ELSE 0
                            END
                        ) AS accepted_orders,

                        SUM(
                            CASE
                                WHEN LOWER(TRIM(status)) = 'rejected'
                                THEN 1 ELSE 0
                            END
                        ) AS rejected_orders,

                        SUM(
                            CASE
                                WHEN LOWER(TRIM(status)) = 'shipped'
                                THEN 1 ELSE 0
                            END
                        ) AS shipped_orders,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN LOWER(TRIM(status)) = 'delivered'
                                    THEN total_price ELSE 0
                                END
                            ), 0
                        ) AS total_revenue,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN LOWER(TRIM(status)) = 'delivered'
                                    THEN quantity ELSE 0
                                END
                            ), 0
                        ) AS total_quantity_sold

                    FROM orders
                    WHERE LOWER(TRIM(farmer_email)) = :email
                """),
                {"email": farmer_email}
            ).mappings().first()

            # 2. Monthly delivered sales
            monthly_rows = conn.execute(
                text("""
                    SELECT
                        DATE_FORMAT(order_date, '%Y-%m') AS month,
                        COALESCE(SUM(total_price), 0) AS revenue,
                        COUNT(*) AS total_orders
                    FROM orders
                    WHERE LOWER(TRIM(farmer_email)) = :email
                      AND LOWER(TRIM(status)) = 'delivered'
                    GROUP BY DATE_FORMAT(order_date, '%Y-%m')
                    ORDER BY MIN(order_date) ASC
                """),
                {"email": farmer_email}
            ).mappings().all()

            # 3. Best-selling crops
            crop_rows = conn.execute(
                text("""
                    SELECT
                        crop_name,
                        SUM(quantity) AS total_quantity,
                        SUM(total_price) AS total_revenue
                    FROM orders
                    WHERE LOWER(TRIM(farmer_email)) = :email
                      AND LOWER(TRIM(status)) = 'delivered'
                    GROUP BY crop_name
                    ORDER BY total_quantity DESC
                """),
                {"email": farmer_email}
            ).mappings().all()

        # Prepare JSON response
        result = {
            "total_orders": int(summary["total_orders"] or 0),
            "delivered_orders": int(summary["delivered_orders"] or 0),
            "pending_orders": int(summary["pending_orders"] or 0),
            "accepted_orders": int(summary["accepted_orders"] or 0),
            "rejected_orders": int(summary["rejected_orders"] or 0),
            "shipped_orders": int(summary["shipped_orders"] or 0),
            "total_revenue": float(summary["total_revenue"] or 0),
            "total_quantity_sold": int(
                summary["total_quantity_sold"] or 0
            ),

            "monthly_sales": [
                {
                    "month": row["month"],
                    "revenue": float(row["revenue"] or 0),
                    "total_orders": int(row["total_orders"] or 0)
                }
                for row in monthly_rows
            ],

            "top_crops": [
                {
                    "crop_name": row["crop_name"],
                    "total_quantity": int(row["total_quantity"] or 0),
                    "total_revenue": float(row["total_revenue"] or 0)
                }
                for row in crop_rows
            ]
        }

        return jsonify(result), 200

    except Exception:
        app.logger.exception("FARMER SALES ANALYTICS ERROR")
        return jsonify({
            "error": "Unable to fetch farmer sales analytics"
        }), 500


    
        
@app.route("/test-email", methods=["POST"])
def test_email():
    data = request.get_json(silent=True) or {}
    recipient = data.get("email", "").strip()

    if not recipient:
        return jsonify({"message": "Email address is required"}), 400

    try:
        message = Message(
            subject="FarmConnect AI - Email Test",
            recipients=[recipient],
            body=(
                "Hello!\n\n"
                "This is a test email from FarmConnect AI.\n"
                "Your email configuration is working."
            )
        )

        mail.send(message)

        return jsonify({
            "message": "Test email sent successfully"
        }), 200

    except Exception:
        app.logger.exception("EMAIL TEST FAILED")
        return jsonify({
            "message": "Unable to send email. Check the server logs."
        }), 500



# =========================================================
# UPDATE ORDER STATUS
# =========================================================


# =========================================================
# UPDATE ORDER STATUS
# =========================================================


# =========================================================
# UPDATE ORDER STATUS
# =========================================================


@app.route("/update-order/<int:id>", methods=["PUT"])
def update_order(id):
    data = request.get_json(silent=True) or {}

    new_status = (data.get("status") or "").strip()
    farmer_email = (data.get("farmer_email") or "").strip().lower()

    allowed_statuses = {
        "Accepted": ["Pending"],
        "Rejected": ["Pending"],
        "Shipped": ["Accepted"],
        "Delivered": ["Shipped"]
    }

    if not farmer_email:
        return jsonify({"error": "Farmer email is required"}), 400

    if new_status not in allowed_statuses:
        return jsonify({
            "error": "Invalid status. Choose Accepted, Rejected, Shipped, or Delivered."
        }), 400

    try:
        with engine.begin() as conn:
            order = conn.execute(
                text("""
                    SELECT
                        id,
                        crop_id,
                        farmer_email,
                        buyer_email,
                        crop_name,
                        quantity,
                        total_price,
                        payment_method,
                        payment_status,
                        status
                    FROM orders
                    WHERE id = :id
                    FOR UPDATE
                """),
                {"id": id}
            ).mappings().first()

            if not order:
                return jsonify({"error": "Order not found"}), 404

            if (order["farmer_email"] or "").strip().lower() != farmer_email:
                return jsonify({
                    "error": "This order does not belong to this farmer"
                }), 403

            current_status = order["status"] or "Pending"

            if current_status not in allowed_statuses[new_status]:
                return jsonify({
                    "error": f"Cannot change order from {current_status} to {new_status}",
                    "status": current_status
                }), 409

            # Restore stock only when rejecting a pending order.
            if new_status == "Rejected" and order["crop_id"] is not None:
                conn.execute(
                    text("""
                        UPDATE crops
                        SET quantity = quantity + :quantity
                        WHERE id = :crop_id
                    """),
                    {
                        "quantity": int(order["quantity"] or 0),
                        "crop_id": order["crop_id"]
                    }
                )

            conn.execute(
                text("""
                    UPDATE orders
                    SET status = :status
                    WHERE id = :id
                """),
                {
                    "status": new_status,
                    "id": id
                }
            )

            # Save email details before leaving the transaction.
            buyer_email = (order["buyer_email"] or "").strip().lower()
            crop_name = order["crop_name"] or "your crop"
            quantity = int(order["quantity"] or 0)
            total_price = float(order["total_price"] or 0)
            payment_method = order["payment_method"] or "COD"

        # The database transaction has succeeded.
        # Send notification after the transaction so email issues
        # do not undo a successful order status update.
        status_messages = {
            "Accepted": (
                "Good news! The farmer has accepted your order."
            ),
            "Rejected": (
                "Unfortunately, the farmer has rejected your order. "
                "Any reserved stock has been restored."
            ),
            "Shipped": (
                "Your order has been shipped by the farmer."
            ),
            "Delivered": (
                "Your order has been marked as delivered."
            )
        }

        notify_buyer(
            buyer_email=buyer_email,
            subject=f"FarmConnect AI - Order {new_status}",
            message=(
                "Hello!\n\n"
                f"{status_messages[new_status]}\n\n"
                f"Order ID: {id}\n"
                f"Crop: {crop_name}\n"
                f"Quantity: {quantity} kg\n"
                f"Total price: ₹{total_price:.2f}\n"
                f"Order status: {new_status}\n"
                f"Payment method: {payment_method}\n\n"
                "Thank you for using FarmConnect AI!"
            )
        )

        return jsonify({
            "message": "Order status updated successfully",
            "status": new_status
        }), 200

    except Exception:
        app.logger.exception("UPDATE ORDER ERROR")
        return jsonify({
            "error": "Unable to update order"
        }), 500


@app.route("/request-password-reset-otp", methods=["POST"])

def request_password_reset_otp():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"message": "Email address is required"}), 400

    try:
        with engine.connect() as conn:
            user = conn.execute(
                text("SELECT id, name FROM users WHERE email = :email"),
                {"email": email}
            ).fetchone()

        # Use a generic response to avoid revealing whether an email exists.
        if not user:
            return jsonify({
                "message": "If the account exists, a password-reset OTP will be sent."
            }), 200

        otp = f"{secrets.randbelow(900000) + 100000}"

        pending_password_resets[email] = {
            "otp": otp,
            "expires_at": time.time() + PASSWORD_RESET_OTP_EXPIRY_SECONDS,
            "attempts": 0,
            "user_id": user.id,
            "name": user.name
        }

        message = Message(
            subject="FarmConnect AI - Password Reset OTP",
            recipients=[email],
            body=(
                f"Hello {user.name},\n\n"
                f"Your password-reset OTP is: {otp}\n\n"
                "This code expires in 5 minutes.\n"
                "If you did not request this, you can ignore this email."
            )
        )

        mail.send(message)

        return jsonify({
            "message": "If the account exists, a password-reset OTP will be sent."
        }), 200

    except Exception:
        app.logger.exception("PASSWORD RESET OTP REQUEST ERROR")
        pending_password_resets.pop(email, None)
        return jsonify({
            "message": "Unable to process the request right now."
        }), 500
        

@app.route("/verify-password-reset-otp", methods=["POST"])
def verify_password_reset_otp():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    submitted_otp = str(data.get("otp", "")).strip()

    if not email or not submitted_otp:
        return jsonify({
            "message": "Email and OTP are required"
        }), 400

    pending = pending_password_resets.get(email)

    if not pending:
        return jsonify({
            "message": "No pending password reset found. Please request a new OTP."
        }), 400

    if time.time() > pending["expires_at"]:
        pending_password_resets.pop(email, None)
        return jsonify({
            "message": "OTP expired. Please request a new one."
        }), 400

    if pending["attempts"] >= 5:
        pending_password_resets.pop(email, None)
        return jsonify({
            "message": "Too many incorrect attempts. Please request a new OTP."
        }), 429

    if not secrets.compare_digest(pending["otp"], submitted_otp):
        pending["attempts"] += 1
        return jsonify({
            "message": "Incorrect OTP. Please try again."
        }), 400

    # Mark this reset request as verified.
    pending["verified"] = True

    return jsonify({
        "message": "OTP verified successfully. You can now reset your password."
    }), 200
    

@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    new_password = data.get("new_password", "")

    if not email or not new_password:
        return jsonify({
            "message": "Email and new password are required"
        }), 400

    if len(new_password) < 8:
        return jsonify({
            "message": "Password must be at least 8 characters long"
        }), 400

    pending = pending_password_resets.get(email)

    if not pending or not pending.get("verified"):
        return jsonify({
            "message": "Please verify your password-reset OTP first"
        }), 400

    if time.time() > pending["expires_at"]:
        pending_password_resets.pop(email, None)
        return jsonify({
            "message": "OTP expired. Please request a new one."
        }), 400

    try:
        hashed_password = generate_password_hash(new_password)

        with engine.begin() as conn:
            result = conn.execute(
                text("""
                    UPDATE users
                    SET password = :password
                    WHERE id = :id
                """),
                {
                    "password": hashed_password,
                    "id": pending["user_id"]
                }
            )

            if result.rowcount == 0:
                pending_password_resets.pop(email, None)
                return jsonify({
                    "message": "Account not found. Please request a new OTP."
                }), 404

        # Invalidate the OTP after a successful password reset.
        pending_password_resets.pop(email, None)

        return jsonify({
            "message": "Password reset successfully. You can now log in."
        }), 200

    except Exception:
        app.logger.exception("PASSWORD RESET ERROR")
        return jsonify({
            "message": "Unable to reset password right now."
        }), 500




@app.route("/confirm-cod-payment/<int:id>", methods=["PUT"])
def confirm_cod_payment(id):
    data = request.get_json(silent=True) or {}
    farmer_email = (data.get("farmer_email") or "").strip().lower()

    if not farmer_email:
        return jsonify({"error": "Farmer email is required"}), 400

    try:
        buyer_email = None
        crop_name = "your order"
        quantity = 0
        total_price = 0
        payment_updated = False

        with engine.begin() as conn:
            order = conn.execute(
                text("""
                    SELECT id, farmer_email, buyer_email, crop_name,
                           quantity, total_price, status,
                           payment_method, payment_status
                    FROM orders
                    WHERE id = :id
                    FOR UPDATE
                """),
                {"id": id}
            ).mappings().first()

            if not order:
                return jsonify({"error": "Order not found"}), 404

            if (order["farmer_email"] or "").strip().lower() != farmer_email:
                return jsonify({
                    "error": "This order does not belong to this farmer"
                }), 403

            if (order["payment_method"] or "").strip().upper() != "COD":
                return jsonify({
                    "error": "Payment confirmation is only available for COD orders"
                }), 400

            if (order["status"] or "").strip() != "Delivered":
                return jsonify({
                    "error": "The order must be marked Delivered before confirming payment"
                }), 409

            if (order["payment_status"] or "Pending").strip().lower() == "paid":
                return jsonify({
                    "message": "Payment has already been confirmed",
                    "payment_status": "Paid"
                }), 200

            conn.execute(
                text("""
                    UPDATE orders
                    SET payment_status = 'Paid'
                    WHERE id = :id
                """),
                {"id": id}
            )

            buyer_email = order["buyer_email"]
            crop_name = order["crop_name"] or "your order"
            quantity = order["quantity"] or 0
            total_price = order["total_price"] or 0
            payment_updated = True

        # Send the email after the database update succeeds.
        # An email failure should not undo the payment confirmation.
        if payment_updated and buyer_email:
            notify_buyer(
                buyer_email,
                "FarmConnect AI - COD Payment Confirmed",
                f"""Hello,

Your Cash on Delivery (COD) payment has been confirmed by the farmer.

Order ID: {id}
Crop: {crop_name}
Quantity: {quantity}
Total Amount: Rs. {total_price}
Order Status: Delivered
Payment Status: Paid

Thank you for using FarmConnect AI!

FarmConnect AI Team"""
            )

        return jsonify({
            "message": "COD payment confirmed successfully",
            "payment_status": "Paid"
        }), 200

    except Exception:
        app.logger.exception("COD PAYMENT CONFIRMATION ERROR")
        return jsonify({
            "error": "Unable to confirm COD payment"
        }), 500

# =========================================================
# CROP PRICE TRENDS
# =========================================================

@app.route("/crop-price-trends", methods=["GET"])
def crop_price_trends():
    crop_name = (request.args.get("crop") or "").strip()

    if not crop_name:
        return jsonify({
            "error": "Crop name is required. Example: ?crop=Tomato"
        }), 400

    # Treat Tomato, tomato, and Tomatoes as the same crop.
    normalized_crop = crop_name.lower()

    if normalized_crop in ("tomato", "tomatoes"):
        crop_filter = "tomato"
    else:
        crop_filter = normalized_crop

    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT
                        DATE(price_date) AS price_day,
                        ROUND(AVG(price), 2) AS average_price,
                        COUNT(*) AS record_count
                    FROM crop_price_history
                    WHERE
                        CASE
                            WHEN LOWER(TRIM(crop_name))
                                 IN ('tomato', 'tomatoes')
                            THEN 'tomato'
                            ELSE LOWER(TRIM(crop_name))
                        END = :crop_name
                    GROUP BY DATE(price_date)
                    ORDER BY price_day ASC
                """),
                {"crop_name": crop_filter}
            ).mappings().all()

        result = [
            {
                "date": str(row["price_day"]),
                "average_price": float(row["average_price"]),
                "record_count": int(row["record_count"])
            }
            for row in rows
        ]

        return jsonify({
            "crop": crop_name,
            "unit": "price per kg, inferred from orders",
            "total_days": len(result),
            "history": result
        }), 200

    except Exception:
        app.logger.exception("CROP PRICE TRENDS ERROR")
        return jsonify({
            "error": "Unable to fetch crop price trends"
        }), 500


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
    

