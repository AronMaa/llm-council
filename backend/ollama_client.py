import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def query_model(model, prompt, timeout=180):
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    r = requests.post(OLLAMA_URL, json=payload, timeout=timeout)
    r.raise_for_status()
    return r.json()["response"]
