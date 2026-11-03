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
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

load_dotenv()



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

    data = request.json

    try:

        with engine.connect() as conn:

            conn.execute(
                text("""
                    INSERT INTO crops
                    (
                        farmer_email,
                        crop_name,
                        category,
                        quantity,
                        price,
                        description,
                        image
                    )

                    VALUES
                    (
                        :farmer_email,
                        :crop_name,
                        :category,
                        :quantity,
                        :price,
                        :description,
                        :image
                    )
                """),
                {
                    "farmer_email": data["farmer_email"],
                    "crop_name": data["crop_name"],
                    "category": data["category"],
                    "quantity": data["quantity"],
                    "price": data["price"],
                    "description": data["description"],
                    "image": data.get("image", "")
                }
            )

            conn.commit()


        return jsonify({
            "message": "Crop Added Successfully"
        })


    except Exception as e:

        print("ADD CROP ERROR:", e)

        return jsonify({
            "error": str(e)
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
                    SELECT *
                    FROM crops
                    ORDER BY id DESC
                """)
            ).fetchall()


        result = []


        for crop in crops:

            result.append({

                "id": crop.id,

                "farmer_email": crop.farmer_email,

                "crop_name": crop.crop_name,

                "category": crop.category,

                "quantity": crop.quantity,

                "price": float(crop.price),

                "description": crop.description or "",

                "image": crop.image or ""

            })


        return jsonify(result)


    except Exception as e:

        print("GET CROPS ERROR:", e)

        return jsonify({
            "error": str(e)
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

@app.route("/weather/<city>")
def weather(city):

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&appid={API_KEY}&units=metric"
    )


    response = requests.get(url)


    if response.status_code != 200:

        return jsonify(
            response.json()
        ), response.status_code


    data = response.json()


    return jsonify({

        "city": data["name"],

        "temperature": data["main"]["temp"],

        "humidity": data["main"]["humidity"],

        "weather": data["weather"][0]["description"],

        "wind_speed": data["wind"]["speed"]

    })


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

@app.route("/place-order", methods=["POST"])
def place_order():

    data = request.json

    try:

        with engine.connect() as conn:

            conn.execute(
                text("""
                    INSERT INTO orders
                    (
                        buyer_email,
                        farmer_email,
                        crop_name,
                        quantity,
                        total_price,
                        status
                    )

                    VALUES
                    (
                        :buyer_email,
                        :farmer_email,
                        :crop_name,
                        :quantity,
                        :total_price,
                        'Pending'
                    )
                """),
                {
                    "buyer_email": data["buyer_email"],
                    "farmer_email": data["farmer_email"],
                    "crop_name": data["crop_name"],
                    "quantity": data["quantity"],
                    "total_price": data["total_price"]
                }
            )

            conn.commit()


        return jsonify({

            "message": "Order Placed Successfully",

            "status": "Pending"

        })


    except Exception as e:

        print("PLACE ORDER ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# GET FARMER ORDERS
# =========================================================

@app.route("/farmer-orders/<email>", methods=["GET"])
def farmer_orders(email):

    try:

        with engine.connect() as conn:

            orders = conn.execute(
                text("""
                    SELECT
                        id,
                        buyer_email,
                        farmer_email,
                        crop_name,
                        quantity,
                        total_price,
                        status,
                        order_date
                    FROM orders
                    WHERE farmer_email = :email
                    ORDER BY id DESC
                """),
                {
                    "email": email
                }
            ).fetchall()


        result = []


        for order in orders:

            result.append({

                "id": order.id,

                "buyer_email": order.buyer_email,

                "farmer_email": order.farmer_email,

                "crop_name": order.crop_name,

                "quantity": order.quantity,

                "total_price": float(order.total_price),

                "status": order.status or "Pending",

                "order_date": str(order.order_date)

            })


        return jsonify(result)


    except Exception as e:

        print("FARMER ORDERS ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# GET BUYER ORDERS
# =========================================================

@app.route("/buyer-orders/<email>", methods=["GET"])
def buyer_orders(email):

    try:

        with engine.connect() as conn:

            orders = conn.execute(
                text("""
                    SELECT
                        id,
                        buyer_email,
                        farmer_email,
                        crop_name,
                        quantity,
                        total_price,
                        status,
                        order_date
                    FROM orders
                    WHERE buyer_email = :email
                    ORDER BY id DESC
                """),
                {
                    "email": email
                }
            ).fetchall()


        result = []


        for order in orders:

            result.append({

                "id": order.id,

                "buyer_email": order.buyer_email,

                "farmer_email": order.farmer_email,

                "crop_name": order.crop_name,

                "quantity": order.quantity,

                "total_price": float(order.total_price),

                "status": order.status or "Pending",

                "order_date": str(order.order_date)

            })


        print("BUYER ORDERS:", result)


        return jsonify(result)


    except Exception as e:

        print("BUYER ORDERS ERROR:", e)

        return jsonify({
            "error": str(e)
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

@app.route("/update-order/<int:id>", methods=["PUT"])
def update_order(id):

    data = request.json

    try:

        new_status = data.get("status")


        if new_status not in ["Pending", "Accepted", "Rejected"]:

            return jsonify({
                "error": "Invalid order status"
            }), 400


        with engine.connect() as conn:

            conn.execute(
                text("""
                    UPDATE orders

                    SET status = :status

                    WHERE id = :id
                """),
                {
                    "id": id,

                    "status": new_status
                }
            )

            conn.commit()


        return jsonify({

            "message": "Order Updated Successfully",

            "status": new_status

        })


    except Exception as e:

        print("UPDATE ORDER ERROR:", e)

        return jsonify({
            "error": str(e)
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




# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )
    

