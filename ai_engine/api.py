from fastapi import FastAPI
from pydantic import BaseModel
import os, requests
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

class AIRequest(BaseModel):
    category: str
    query: str = ""
    budget: str = ""
    tier: str = ""

@app.post("/ask-ai")
def ask_ai(body: AIRequest):
    from main import get_hardware_advice
    result = get_hardware_advice(body.category, body.query, body.budget, body.tier)
    return {"answer": result}

@app.get("/health")
def health():
    return {"status": "ok"}