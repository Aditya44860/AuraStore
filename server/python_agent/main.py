import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Mandatory Config Validation
REQUIRED_ENV_VARS = ["GEMINI_API_KEY", "ALLOWED_ORIGINS", "PORT"]
for var in REQUIRED_ENV_VARS:
    if not os.getenv(var):
        raise RuntimeError(f"CRITICAL: Missing mandatory environment variable: {var}")

app = FastAPI(title="AuraStore RAG Agent")

# CORS configuration (Strictly guarded)
origins = os.getenv("ALLOWED_ORIGINS").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
    print("WARNING: GEMINI_API_KEY not set correctly in .env")

genai.configure(api_key=GEMINI_API_KEY)

# Generation config
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 1000,
}

model = genai.GenerativeModel(
    model_name="gemini-flash-latest",
    generation_config=generation_config,
    system_instruction="""STRICT GUARDRAILS:
1. IDENTITY: You are the Aura Assistant, a dedicated support bot for the AuraStore platform.
2. CORE SCOPE: Answer query ONLY if they are related to AuraStore (products, orders, shipping, returns, company policies).
3. OFF-TOPIC HANDLING: If a user asks about anything else (general knowledge, coding, life advice, competitors, etc.), politely but firmly state that you can only assist with AuraStore-related queries.
4. TONE: Be extremely direct, professional, and minimalist.
5. CONCISENESS: Keep responses as short as possible. Use bullet points for lists. No fluff or filler.
6. SOURCE TRUTH: Use the provided Context (Company Rules) as your primary source of truth.
7. FALLBACK: For queries you cannot answer using the provided rules, direct the user to support@aurastore.com immediately."""
)

# Load company rules
rules_path = os.getenv("COMPANY_RULES_PATH")
try:
    with open(rules_path, "r") as f:
        company_rules = f.read()
except Exception as e:
    print(f"Error loading company rules from {rules_path}: {e}")
    company_rules = "Error: Company rules could not be loaded."

class Message(BaseModel):
    role: str
    parts: List[dict]

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "AuraStore RAG Agent"}

@app.get("/")
async def root():
    return {"message": "AuraStore RAG Agent is running"}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=503, 
            detail="AI Support is temporarily unavailable (API Key missing). Please contact support@aurastore.com."
        )

    try:
        # Format history for Gemini
        history = request.history or []
        
        # Start chat session
        chat = model.start_chat(history=history)
        
        # Context-aware prompt
        prompt = f"Context (Company Rules):\n{company_rules}\n\nUser Query: {request.message}"
        
        # Get response
        response = chat.send_message(prompt)
        
        return {
            "success": True,
            "reply": response.text
        }
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ["PORT"]) # Strict port requirement
    uvicorn.run(app, host="0.0.0.0", port=port)
