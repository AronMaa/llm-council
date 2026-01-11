import requests

def query_model(model, prompt_text, timeout=180):
    payload = {
        "model": model["name"] if isinstance(model, dict) else model,
        "prompt": prompt_text,
        "stream": False
    }

    try:
        r = requests.post("http://localhost:11434/api/generate", json=payload, timeout=timeout)
        r.raise_for_status()
        return {"content": r.json().get("response", "")}
    except Exception as e:
        print(f"Error querying model {model}: {e}")
        return None
