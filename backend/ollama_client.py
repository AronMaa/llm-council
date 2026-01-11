import requests

OLLAMA_CHAT_URL = "http://127.0.0.1:11434/api/chat"

def query_model(model, messages, timeout=180):
    model_name = model["name"] if isinstance(model, dict) else model
    payload = {
        "model": model_name,
        "messages": messages,
        "stream": False
    }

    try:
        r = requests.post(OLLAMA_CHAT_URL, json=payload, timeout=timeout)
        r.raise_for_status()
        data = r.json()
        # Fusionner tous les contenus des messages si le serveur renvoie des chunks
        if isinstance(data, list):
            content = "".join([m.get("message", {}).get("content", "") for m in data])
        else:
            content = data.get("message", {}).get("content", "")
        return {"content": content}
    except Exception as e:
        print(f"Error querying model {model}: {e}")
        return None
