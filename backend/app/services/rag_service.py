import json
from groq import Groq
from app.core.config import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)

IELTS_KNOWLEDGE = """
- Band 7 Writing Task 2 needs clear thesis, developed arguments, varied vocabulary, complex sentences.
- Writing Task 1: describe visual data objectively, at least 150 words, no personal opinions.
- Speaking fluency: avoid long pauses, use fillers like 'well', 'let me think'.
- Coherence: use cohesive devices — however, moreover, consequently, in contrast.
- Lexical resource band 7: less common vocabulary, collocations, avoid word repetition.
- Listening Sections 3 and 4 are hardest — read questions before audio starts.
- Reading: skim for gist, scan for specific info, do not read every word.
- Speaking band 6 to 7: wider vocabulary, fewer errors, more complex structures.
- Task 2 structure: Introduction + thesis, Body 1, Body 2, Conclusion.
- Pronunciation: clarity and natural stress matter, not accent.
- Common Writing mistakes: no clear thesis, weak topic sentences, repetitive vocabulary.
- Band 7 grammar: error-free most of the time, mix of simple and complex structures.
- True/False/Not Given: Not Given means info is absent from passage entirely.
- Listening: correct spelling required, both British and American accepted.
- Band 8 Writing: sophisticated vocabulary, flawless grammar, fully developed argument.
"""

async def chat_with_mentor(question: str, user_performance: dict = {}) -> str:
    prompt = f"""You are a personal IELTS coach.

IELTS Knowledge Base:
{IELTS_KNOWLEDGE}

Student profile: {json.dumps(user_performance) if user_performance else "Not available"}

Student question: {question}

Give specific, practical advice in 2-3 short paragraphs."""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a friendly expert IELTS coach."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        max_tokens=600
    )
    return response.choices[0].message.content