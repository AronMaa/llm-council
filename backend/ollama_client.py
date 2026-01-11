import requests

OLLAMA_CHAT_URL = "http://127.0.0.1:11434/api/chat"

def query_model(model, messages, timeout=180):
    model_name = model["name"] if isinstance(model, dict) else model

    payload = {
        "model": model_name,
        "messages": messages,
        "stream": False
    }

    loop = asyncio.get_event_loop()

    def post_request():
        r = requests.post(OLLAMA_CHAT_URL, json=payload, timeout=timeout)
        r.raise_for_status()
        return {"content": r.json().get("response", "")}

    try:
        return await loop.run_in_executor(None, post_request)
    except Exception as e:
        print(f"Error querying model {model}: {e}")
        return None
