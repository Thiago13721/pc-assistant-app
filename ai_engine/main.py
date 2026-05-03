import os
import sys
import io
import requests
from dotenv import load_dotenv
 
# Força UTF-8 no stdout/stderr (corrige acentos no Windows)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
 
load_dotenv()
 
 
# ── Gemini 2.5 Flash ────────────────────────────────────────────────────────────
def _call_gemini(prompt: str) -> str:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY não encontrada no .env")
 
    url = (
        "https://generativelanguage.googleapis.com/v1/models/"
        f"gemini-2.5-flash:generateContent?key={api_key}"
    )
    data = {"contents": [{"parts": [{"text": prompt}]}]}
 
    response = requests.post(url, headers={"Content-Type": "application/json"}, json=data)
    response_json = response.json()
 
    if response.status_code == 503:
        raise ConnectionError("GEMINI_503")
 
    if response.status_code != 200:
        msg = response_json.get("error", {}).get("message", "Erro desconhecido")
        raise RuntimeError(f"Gemini erro ({response.status_code}): {msg}")
 
    return response_json["candidates"][0]["content"]["parts"][0]["text"]
 
 
# ── Groq — Llama 3.3 70B (fallback) ────────────────────────────────────────────
def _call_groq(prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY não encontrada no .env")
 
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
    }
 
    response = requests.post(url, headers=headers, json=data)
    response_json = response.json()
 
    if response.status_code != 200:
        msg = response_json.get("error", {}).get("message", "Erro desconhecido")
        raise RuntimeError(f"Groq erro ({response.status_code}): {msg}")
 
    return response_json["choices"][0]["message"]["content"]
 
 
# ── Orquestrador ────────────────────────────────────────────────────────────────
def get_hardware_advice(category: str, user_query: str = "", budget: str = "", tier: str = "") -> str:
    # Monta prompt rico quando vem do fluxo guiado
    if budget and tier:
        prompt = (
            f"Aja como um Engenheiro de Hardware Sênior especialista em montagem de PCs.\n"
            f"O usuário quer montar um PC {tier} com orçamento de R$ {budget}.\n"
            f"Categoria foco: {category}.\n"
            f"{'Preferências do usuário: ' + user_query if user_query else 'Sem preferências específicas — faça a melhor recomendação custo-benefício.'}\n\n"
            f"Forneça:\n"
            f"1. Lista completa de peças recomendadas com modelo exato e preço estimado em reais\n"
            f"2. Justificativa técnica de cada escolha\n"
            f"3. Compatibilidade entre as peças\n"
            f"4. Desempenho esperado (jogos, trabalho, etc.)\n"
            f"Responda em português do Brasil, de forma clara e organizada."
        )
    else:
        # Consulta rápida pelos cards da Home
        prompt = (
            f"Aja como um Engenheiro de Hardware Sênior.\n"
            f"Categoria: {category}.\n"
            f"Pergunta: {user_query if user_query else 'Sugira o melhor custo-benefício atual.'}\n"
            f"Responda de forma técnica, curta e direta em português do Brasil."
        )
 
    # 1ª tentativa: Gemini 2.5 Flash
    try:
        result = _call_gemini(prompt)
        print(result)
        return result
    except ConnectionError as e:
        if "GEMINI_503" in str(e):
            sys.stderr.write("[FALLBACK] Gemini 503 — tentando Groq...\n")
        else:
            sys.stderr.write(f"[FALLBACK] Gemini falhou: {e}\n")
    except Exception as e:
        sys.stderr.write(f"[FALLBACK] Gemini falhou: {e}\n")
 
    # 2ª tentativa: Groq
    try:
        result = _call_groq(prompt)
        print(result)
        return result
    except Exception as e:
        error_msg = f"Erro: todos os serviços de IA falharam. Detalhe: {e}"
        sys.stderr.write(f"{error_msg}\n")
        print(error_msg)
        return error_msg
 
 
if __name__ == "__main__":
    # Args: category  query  budget  tier
    cat    = sys.argv[1] if len(sys.argv) > 1 else "Geral"
    que    = sys.argv[2] if len(sys.argv) > 2 else ""
    bud    = sys.argv[3] if len(sys.argv) > 3 else ""
    tier   = sys.argv[4] if len(sys.argv) > 4 else ""
    get_hardware_advice(cat, que, bud, tier)