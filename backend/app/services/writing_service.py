from groq import Groq
from app.core.config import settings
import json, re

client = Groq(api_key=settings.GROQ_API_KEY)

WRITING_EVAL_PROMPT = """You are an expert IELTS examiner. Evaluate this IELTS {task_type} essay strictly.

Essay:
{essay}

Return ONLY valid JSON (no markdown, no extra text):
{{
  "task_response": <float 0-9>,
  "coherence_cohesion": <float 0-9>,
  "lexical_resource": <float 0-9>,
  "grammatical_range": <float 0-9>,
  "overall_band": <float 0-9>,
  "grammar_mistakes": [
    {{"original": "...", "corrected": "...", "explanation": "..."}}
  ],
  "vocabulary_suggestions": [
    {{"basic_word": "...", "better_word": "...", "context": "..."}}
  ],
  "coherence_feedback": "...",
  "task_response_feedback": "...",
  "improved_essay": "Full improved version of the essay",
  "overall_feedback": "..."
}}"""

async def evaluate_writing(essay: str, task_type: str = "task2") -> dict:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an IELTS examiner. Always respond with valid JSON only."},
            {"role": "user", "content": WRITING_EVAL_PROMPT.format(essay=essay, task_type=task_type)}
        ],
        temperature=0.3,
        max_tokens=2000
    )
    raw = response.choices[0].message.content.strip()
    
    raw = re.sub(r"```json\n?|\n?```", "", raw).strip()
    return json.loads(raw)