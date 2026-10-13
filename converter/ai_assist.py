"""Optional AI-assisted transcription. Never asks the model to solve questions or invent answers."""
from __future__ import annotations
import json
import os

def ai_extract(question_text: str) -> dict:
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("OPENAI_API_KEY is not set. Copy .env.example to .env and configure it, or use the no-API workflow.")
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError("Optional AI dependency missing. Install with: python -m pip install -r requirements-ai.txt") from exc
    client = OpenAI(api_key=key)
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    response = client.chat.completions.create(
        model=model,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": (
                "You transcribe exam text; do not solve it. Return JSON with keys question_text, "
                "options (array of objects with label and text), and uncertainty_notes (array of strings). "
                "Preserve mathematical notation using readable LaTeX delimiters where clear. Do not infer "
                "missing text, options, answer keys, chapters, or numerical answers. Use empty strings/arrays "
                "for content that cannot be read and describe uncertainty."
            )},
            {"role": "user", "content": "Transcribe and structure this OCR/PDF text faithfully:\n\n" + question_text},
        ],
    )
    data = json.loads(response.choices[0].message.content or "{}")
    if not isinstance(data.get("question_text"), str) or not isinstance(data.get("options", []), list):
        raise RuntimeError("AI returned an unexpected structure.")
    data.setdefault("options", [])
    data.setdefault("uncertainty_notes", [])
    return data
