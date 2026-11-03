import requests

url = "http://127.0.0.1:5000/add-crop"

data = {
    "farmer_email": "test@test.com",
    "crop_name": "Tomato",
    "quantity": 100,
    "price": 25,
    "description": "Fresh organic tomatoes"
}

response = requests.post(url, json=data)

print(response.json())