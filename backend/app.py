import os
import secrets
import time

import requests
from uuid import uuid4
from PIL import Image, UnidentifiedImageError
from disease_detector import predict_plant_disease
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from email_service import send_email
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

load_dotenv()
def notify_buyer(buyer_email, subject, message):
    if not buyer_email:
        print("Notification skipped: buyer email is missing.")
        return

    send_email(
        to_email=buyer_email,
        subject=subject,
        body=message
    )



app = Flask(__name__)
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
    database=os.getenv("DB_NAME"),
)

engine = create_engine(database_url)

    


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return "FarmConnect AI Backend Running"


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

@app.route("/profile/<email>", methods=["GET"])
def get_profile(email):

    try:

        with engine.connect() as conn:

            user = conn.execute(
                text("""
                    SELECT
                        id,
                        name,
                        email,
                        phone,
                        address,
                        city,
                        role
                    FROM users
                    WHERE email = :email
                """),
                {
                    "email": email
                }
            ).fetchone()


        if not user:

            return jsonify({
                "message": "User not found"
            }), 404


        return jsonify({

            "id": user.id,

            "name": user.name,

            "email": user.email,

            "phone": user.phone or "",

            "address": user.address or "",

            "city": user.city or "",

            "role": user.role

        })


    except Exception as e:

        print("PROFILE ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# UPDATE PROFILE
# =========================================================

@app.route("/profile/<email>", methods=["PUT"])
def update_profile(email):

    data = request.json

    try:

        with engine.connect() as conn:

            conn.execute(
                text("""
                    UPDATE users

                    SET
                        name = :name,
                        phone = :phone,
                        address = :address,
                        city = :city

                    WHERE email = :email
                """),
                {
                    "name": data["name"],
                    "phone": data.get("phone", ""),
                    "address": data.get("address", ""),
                    "city": data.get("city", ""),
                    "email": email
                }
            )

            conn.commit()


        return jsonify({
            "message": "Profile Updated Successfully"
        })


    except Exception as e:

        print("UPDATE PROFILE ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


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

@app.route("/upload-image", methods=["POST"])
def upload_image():

    if "image" not in request.files:

        return jsonify({
            "message": "No image uploaded"
        }), 400


    file = request.files["image"]


    if file.filename == "":

        return jsonify({
            "message": "No file selected"
        }), 400


    filename = secure_filename(file.filename)


    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )


    file.save(filepath)


    return jsonify({

        "message": "Image Uploaded Successfully",

        "file_path": filepath

    })


# =========================================================
# SERVE UPLOADED IMAGES
# =========================================================

@app.route("/uploads/<filename>")
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
                    WHERE LOWER(TRIM(buyer_email)) = :email
                    ORDER BY id DESC
                """),
                {"email": buyer_email}
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
        app.logger.exception("BUYER ORDERS ERROR")
        return jsonify({"error": "Unable to fetch buyer orders"}), 500

    
        
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


@app.route("/detect-disease", methods=["POST"])
def detect_disease():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        f"disease_scan_{uuid4().hex}.jpg"
    )

    try:
        image = Image.open(file.stream).convert("RGB")
        image.save(filepath, format="JPEG")

        result = predict_plant_disease(filepath)
        return jsonify(result), 200

    except UnidentifiedImageError:
        return jsonify({
            "error": "Please upload a valid image file."
        }), 400

    except Exception:
        app.logger.exception("Disease detection failed")
        return jsonify({
            "error": "Disease detection failed. Check the backend terminal."
        }), 500

    finally:
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError:
                app.logger.warning(
                    "Could not remove temporary disease scan."
                )


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

    app.run(
        debug=True
    )
    

