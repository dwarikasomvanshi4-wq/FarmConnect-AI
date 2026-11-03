import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_APP_PASSWORD = os.getenv("SMTP_APP_PASSWORD")


def send_email(to_email, subject, body):
    if not SMTP_EMAIL or not SMTP_APP_PASSWORD:
        print("Email settings are missing from .env")
        return False

    try:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = SMTP_EMAIL
        message["To"] = to_email
        message.set_content(body)

        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
            server.send_message(message)

        print("Email sent successfully.")
        return True

    except Exception as e:
        print(f"Email failed: {type(e).__name__}: {e}")
        return False