import requests

url = "http://127.0.0.1:5000/register"

data = {
    "name": "Dwarika",
    "email": "test@test.com",
    "password": "1234",
    "role": "farmer"
}

response = requests.post(url, json=data)

print(response.json())