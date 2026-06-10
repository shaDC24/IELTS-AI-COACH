from openai import OpenAI
import json
import re
from app.core.config import settings
from groq import Groq
from app.core.config import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)

async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    transcript = groq_client.audio.transcriptions.create(
        model="whisper-large-v3",
        file=(filename, audio_bytes, "audio/webm"),
        language="en"
    )
    return transcript.text

SPEAKING_EVAL_PROMPT = """You are an IELTS speaking examiner.

Question asked: {question}
Candidate's response (transcribed): {transcript}

Evaluate and return ONLY valid JSON:
{{
  "fluency_coherence": <float 0-9>,
  "grammatical_range": <float 0-9>,
  "lexical_resource": <float 0-9>,
  "pronunciation": <float 0-9>,
  "overall_band": <float 0-9>,
  "grammar_mistakes": [
    {{"original": "...", "corrected": "...", "explanation": "..."}}
  ],
  "vocabulary_suggestions": [
    {{"used": "...", "better": "..."}}
  ],
  "fluency_feedback": "...",
  "model_answer": "A model answer for this question",
  "follow_up_question": "A natural IELTS follow-up question"
}}"""

async def evaluate_speaking(transcript: str, question: str) -> dict:
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an IELTS speaking examiner. Respond with JSON only."},
            {"role": "user", "content": SPEAKING_EVAL_PROMPT.format(question=question, transcript=transcript)}
        ],
        temperature=0.3,
        max_tokens=1500
    )
    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"```json\n?|\n?```", "", raw).strip()
    return json.loads(raw)