import requests

url = "http://127.0.0.1:5000/place-order"

data = {
    "buyer_email": "buyer@test.com",
    "farmer_email": "test@test.com",
    "crop_name": "Tomato",
    "quantity": 10,
    "total_price": 250
}

response = requests.post(url, json=data)

print(response.json())