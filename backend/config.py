"""Configuration for the LLM Council."""

import os

# Council members - list of Ollama model identifiers
COUNCIL_MODELS = [
    {"name": "llama3", "url": "http://127.0.0.1:11434"},
    {"name": "mistral", "url": "http://127.0.0.1:11434"},
    {"name": "phi3", "url": "http://127.0.0.1:11434"},
]

# Chairman model - synthesizes final response
CHAIRMAN_MODEL = {"name": "llama3", "url": "http://127.0.0.1:11434"}

# Data directory for conversation storage
DATA_DIR = "data/conversations"
