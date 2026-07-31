import json

from google import genai
from dotenv import load_dotenv
import os


load_dotenv()


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_ai_response(message: str) -> dict:

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=message,
        config={
            "response_mime_type": "application/json"
        }
    )

    return json.loads(response.text)