
import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))    

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "FarmConnect AI")


def send_email(to_email, subject, body):
    if not BREVO_API_KEY or not BREVO_SENDER_EMAIL:
        print("Brevo email settings are missing.")
        return False

    try:
        url = "https://api.brevo.com/v3/smtp/email"

        headers = {
            "accept": "application/json",
            "api-key": BREVO_API_KEY,
            "content-type": "application/json"
        }

        payload = {
            "sender": {
                "name": BREVO_SENDER_NAME,
                "email": BREVO_SENDER_EMAIL
            },
            "to": [
                {
                    "email": to_email
                }
            ],
            "subject": subject,
            "textContent": body
        }

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=15
        )

        if response.status_code in (200, 201, 202):
            print("Email sent successfully through Brevo.")
            return True

        print(
            f"Brevo email failed: "
            f"HTTP {response.status_code}: {response.text}"
        )
        return False

    except requests.RequestException as e:
        print(f"Brevo connection error: {type(e).__name__}: {e}")
        return False

    except Exception as e:
        print(f"Email error: {type(e).__name__}: {e}")
        return False
