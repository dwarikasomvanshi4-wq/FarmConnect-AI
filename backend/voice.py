import requests
import speech_recognition as sr
import re

recognizer = sr.Recognizer()

with sr.Microphone() as source:
    print("🎤 Speak your command...")
    recognizer.adjust_for_ambient_noise(source)
    audio = recognizer.listen(source)

try:
    # Convert speech to text
    text = recognizer.recognize_google(audio)
    print("You said:", text)

    text = text.lower()

    # Check if the command is related to adding a crop
    if "add" in text or "kg" in text:

        quantity = None
        price = None

        # Find quantity (e.g. 30 kg)
        qty_match = re.search(r'(\d+)\s*kgs?', text)
        if qty_match:
            quantity = qty_match.group(1)

        # Find price (e.g. for Rs 40 / at 35 / for 40 rupees)
        price_match = re.search(
            r'(?:for|at)\s*(?:rs\.?|rupees?)?\s*(\d+)',
            text
        )

        if price_match:
            price = price_match.group(1)

        # Words to ignore
        stop_words = [
            "add", "can", "you", "please", "farmer",
            "kg", "kgs", "of", "for", "at",
            "rupee", "rupees", "rs", "i", "want",
            "to", "the", "a", "an"
        ]

        crop = ""

        words = text.split()

        for word in words:

            word = word.strip(",.?!")

            if word.isdigit():
                continue

            if word in stop_words:
                continue

            # Convert plural to singular
            if word.endswith("oes"):
                crop = word[:-2]      # tomatoes -> tomato, potatoes -> potato
            elif word.endswith("s"):
                crop = word[:-1]      # onions -> onion
            else:
                crop = word

            break

        print("\nDetected Details")
        print("-----------------------")
        print("Crop      :", crop)

        if quantity:
            print("Quantity  :", quantity, "kg")
        else:
            print("Quantity  : Not Found")

        if price:
            print("Price     : ₹", price)
        else:
            print("Price     : Not Found")

        # Send data to Flask API
        data = {
            "farmer_email": "dwarikasomvanshi4@gmail.com",
            "crop_name": crop,
            "quantity": quantity,
            "price": price if price else 0,
            "description": "Added using Voice Command"
        }

        response = requests.post(
            "http://127.0.0.1:5000/add-crop",
            json=data
        )

        print("\nBackend Response:")
        print(response.json())

    elif "weather" in text:
        print("🌦 Opening Weather Module...")

    elif "crop" in text:
        print("🌾 Showing Crop List...")

    else:
        print("❌ Command not recognized.")

except sr.UnknownValueError:
    print("❌ Could not understand your voice.")

except sr.RequestError:
    print("❌ Google Speech Service is unavailable.")

except Exception as e:
    print("❌ Error:", e)