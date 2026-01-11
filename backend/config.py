"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Council members - list of Ollama model identifiers
COUNCIL_MODELS = [
    {"name": "llama3", "url": "http://127.0.0.1:11434"},
    {"name": "mistral", "url": "http://127.0.0.1:11434"},
    {"name": "phi3", "url": "http://127.0.0.1:11434"},
]

# Chairman model - synthesizes final response
CHAIRMAN_MODEL = {"name": "llama3", "url": "http://127.0.0.1:11434"},

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
