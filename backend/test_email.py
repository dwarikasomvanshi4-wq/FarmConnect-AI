
from email_service import send_email

# Replace this with your own email address to receive the test.
recipient_email = "dwarikasomvanshi4@gmail.com"

success = send_email(
    recipient_email,
    "FarmConnect AI - Email Test",
    """Hello!

This is a test email from FarmConnect AI.

If you received this message, email notifications are working.

Thank you,
FarmConnect AI"""
)

if success:
    print("TEST PASSED: Email sent successfully.")
else:
    print("TEST FAILED: Email could not be sent.")
