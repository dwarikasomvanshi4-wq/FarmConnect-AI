import requests

API_KEY = "f5e5aa65fdb356946257ac88d4f3de49"

city = "Bangalore"

url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"

response = requests.get(url)

print(response.json())