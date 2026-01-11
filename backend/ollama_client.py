# ollama_client.py
import asyncio
import aiohttp
import requests
from typing import List, Dict, Any

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


async def query_models_parallel(models: List[Dict[str, Any]], messages: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Query multiple models in parallel using asyncio.
    
    Args:
        models: List of model config dicts
        messages: Messages to send to each model
        
    Returns:
        Dict mapping model names to their responses
    """
    async def query_single_model(model_config):
        model_name = model_config["name"]
        try:
            # Note: query_model() est synchrone, on l'exécute dans un thread séparé
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: query_model(model_config, messages)
            )
            return model_name, response
        except Exception as e:
            print(f"Error querying {model_name}: {e}")
            return model_name, None
    
    # Créer les tâches pour tous les modèles
    tasks = [query_single_model(model) for model in models]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Construire le dictionnaire résultat
    responses = {}
    for result in results:
        if isinstance(result, tuple) and len(result) == 2:
            model_name, response = result
            responses[model_name] = response
        elif isinstance(result, Exception):
            print(f"Exception in query: {result}")
    
    return responses
