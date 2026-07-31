from app.services.llm_service import generate_ai_response


response = generate_ai_response(
    "Write a short greeting for an interactive storyteller."
)

print(response)