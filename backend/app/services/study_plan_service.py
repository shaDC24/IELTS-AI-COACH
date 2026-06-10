from groq import Groq
from app.core.config import settings
import json, re

groq_client = Groq(api_key=settings.GROQ_API_KEY)

async def generate_study_plan(
    target_band: float,
    current_level: float,
    weak_skills: list,
    weeks: int = 4
) -> dict:
    weak = ', '.join(weak_skills) if weak_skills else 'all skills equally'

    prompt = f"""Create a detailed {weeks}-week IELTS study plan.

Student profile:
- Current band estimate: {current_level}
- Target band: {target_band}
- Weak skills: {weak}

Return ONLY valid JSON, no extra text:
{{
  "weeks": [
    {{
      "week": 1,
      "theme": "...",
      "focus_skill": "...",
      "goal": "...",
      "daily_tasks": {{
        "monday": ["task1", "task2"],
        "tuesday": ["task1"],
        "wednesday": ["task1"],
        "thursday": ["task1"],
        "friday": ["task1"],
        "weekend": ["task1", "task2"]
      }},
      "resources": ["resource1", "resource2"]
    }}
  ],
  "overall_strategy": "...",
  "band_prediction": "..."
}}"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an IELTS coach. Respond with valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
        max_tokens=2500
    )
    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"```json\n?|\n?```", "", raw).strip()
    return json.loads(raw)