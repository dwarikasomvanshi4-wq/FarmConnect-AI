import requests

url = "http://127.0.0.1:5000/feedback"

data = {
    "buyer_email": "buyer@test.com",
    "farmer_email": "test@test.com",
    "rating": 5,
    "comments": "Fresh vegetables and fast delivery!"
}

response = requests.post(url, json=data)

print(response.json())