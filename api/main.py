from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
import requests
import json
from fastapi.middleware.cors import CORSMiddleware
import re
import mysql.connector
from os import environ
from admin import admin_api

api = FastAPI()
api.include_router(admin_api, prefix="/admin")

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api.post("/chat")
async def chat(req: Request):
    data = await req.json()
    question = data.get("question", "")
    history = data.get("history", [])
    stream = data.get("stream", False)
    user_name = data.get("name", "")

    if not question:
        return JSONResponse(status_code=400, content={"error": "Missing question"})

    # Persona prompt
    system_prompt = (
        "Responda sempre em português brasileiro de forma clara e objetiva. "
        "Você é um assistente virtual de triagem para pacientes na recepção de uma Unidade de Pronto Atendimento (UPA). "
        "Sua função é fazer uma orientação inicial. Você NUNCA deve fornecer um diagnóstico, prognóstico ou tratamento. "
        "Se o paciente descrever sintomas graves (ex: dor no peito, falta de ar, desmaio, sangramento intenso), sua ÚNICA resposta deve ser informar que irá chamar imediatamente a equipe de triagem/enfermagem para atendimento de emergência. "
        "Nunca peça para o paciente procurar a recepção por conta própria. "
        "Para sintomas leves, você pode fazer perguntas básicas (há quanto tempo sente isso, se tem febre) e, ao final, orientá-lo a aguardar a chamada para a triagem com a equipe de enfermagem. "
        "Seja conciso e direto. Não crie diálogos ou histórias."
        f"O nome do paciente é {user_name}."
    )

    prompt_parts = [
        "<|begin_of_text|>",
        "<|start_header_id|>system<|end_header_id|>\n\n",
        system_prompt,
        "<|eot_id|>",
    ]

    # Conversation history
    for msg in history:
        sender_role = "user" if msg["sender"] == "user" else "assistant"
        prompt_parts.extend([
            f"<|start_header_id|>{sender_role}<|end_header_id|>\n\n",
            msg["text"],
            "<|eot_id|>",
        ])

    # User question
    prompt_parts.extend([
        "<|start_header_id|>user<|end_header_id|>\n\n",
        question,
        "<|eot_id|>",
    ])

    # Answer token
    prompt_parts.append("<|start_header_id|>assistant<|end_header_id|>\n\n")

    final_prompt = "".join(prompt_parts)
    
    response = requests.post("http://localhost:11434/api/generate", json={
        "model": "llama3:instruct",
        "prompt": final_prompt,
        "stream": stream,
        "options": {
            "stop": ["<|eot_id|>", "<|start_header_id|>"]
        }
    }, stream=stream)

    if stream:
        def generate():
            full_response = ""
            for line in response.iter_lines():
                if line:
                    json_line = json.loads(line.decode("utf-8"))
                    resp_text = json_line.get("response", "")
                    full_response += resp_text
                    yield resp_text
            if is_triage_intent(full_response):
                triage_action(message_history=final_prompt, user_name=user_name)
        return StreamingResponse(generate(), media_type="text/plain")
    else:
        resp_json = response.json()
        resp_text = resp_json.get("response", "")
        if is_triage_intent(resp_text):
            triage_action(message_history=final_prompt, user_name=user_name)
        return JSONResponse(content=resp_json)
    

# Check if the text indicates a "triagem" intent
def is_triage_intent(text):
    text = text.lower()
    patterns = [
        "aguarde a chamada",
        "procure a triagem",
        "encaminhar para a triagem",
        "será atendido pela equipe de enfermagem",
        "orientação inicial, depois triagem",
        "precisa passar pela triagem",
        "encaminhado para avaliação presencial",
        "será chamado para triagem",
        "encaminhar para avaliação presencial",
        "será atendido pela enfermagem",
        "vou chamar a enfermeira",
        "chamar a enfermagem",
        "atendimento mais detalhado",
        "esperar a chamada",
        "esperar pela chamada",
        "aguarde pela chamada",
        "triagem mais detalhada",
        "equipe de enfermagem",
        "chamada da equipe de enfermagem"
    ]
    for p in patterns:
        if p in text:
            return True
    # Busca por intenção genérica
    if "triagem" in text or "enfermagem" in text or "enfermeira" in text:
        if "aguarde" in text or "chamar" in text or "atendimento" in text:
            return True
    return False


# This is the triage action function, it will be called when the text indicates a "triagem" intent
def triage_action(**kwargs):
    message_history = kwargs.get("message_history", "")
    user_name = kwargs.get("user_name", "Paciente Desconhecido")
    priority_info = get_priority_from_ai(message_history)
    priority = priority_info["priority"]
    reason = priority_info["reason"]

    # Create a lib for this
    conn = mysql.connector.connect(
        host="localhost",
        port=environ["MYSQL_PORT"],
        user=environ["MYSQL_USER"],
        password=environ["MYSQL_PASSWORD"],
        database=environ["MYSQL_DATABASE"]
    )
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO triagem (user_name, user_priority, reason, user_status) VALUES (%s, %s, %s, %s)",
        (user_name, priority, reason, "aguardando")
    )
    conn.commit()
    cursor.close()
    conn.close()
    

# Get the priority from the AI based on the message history
def get_priority_from_ai(message_history):
    prompt = (
        "Considere o seguinte atendimento de triagem:\n"
        f"{message_history}\n"
        "Classifique a prioridade deste atendimento como 'alta', 'media' ou 'baixa' e explique o motivo de forma objetiva. "
        "Responda no formato: Prioridade: <alta|media|baixa>. Motivo: <explicação>."
    )
    response = requests.post("http://localhost:11434/api/generate", json={
        "model": "llama3:instruct",
        "prompt": prompt,
        "stream": False
    })
    resp_json = response.json()
    text = resp_json.get("response", "")

    match = re.search(r'prioridade:\s*(alta|media|baixa)[\.\s]*motivo:\s*(.*)', text, re.IGNORECASE)
    if match:
        priority = match.group(1).lower()
        reason = match.group(2).strip()
        return {"priority": priority, "reason": reason}
    return {"priority": None, "reason": text.strip()}
