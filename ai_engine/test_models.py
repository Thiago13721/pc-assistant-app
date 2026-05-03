import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1/models?key={api_key}"

response = requests.get(url)
if response.status_code == 200:
    models = response.json().get('models', [])
    print("Modelos disponíveis para sua chave:")
    for m in models:
        print(f"- {m['name']}")
else:
    print(f"Erro ao listar modelos: {response.status_code}")
    print(response.json())