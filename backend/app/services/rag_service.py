import faiss
import numpy as np
import json
from groq import Groq
from app.core.config import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)

# Global variables — lazy load
_embedder = None
_index = None

IELTS_KNOWLEDGE = [
    "To score band 7 in IELTS Writing Task 2, you need a clear position, well-developed arguments, varied vocabulary, and complex sentence structures with minimal errors.",
    "IELTS Writing Task 1 requires describing visual data objectively. Write at least 150 words. Avoid personal opinions. Cover main trends and key features.",
    "For IELTS Speaking fluency, avoid long pauses. Use natural fillers like 'well', 'let me think', 'that is an interesting question' to buy time.",
    "Coherence in IELTS Writing means ideas flow logically. Use cohesive devices: however, moreover, consequently, in contrast, as a result, furthermore.",
    "Lexical resource band 7 requires less common vocabulary, collocations, and awareness of style. Avoid repeating the same words.",
    "IELTS Listening Section 3 and 4 are hardest. They involve academic discussions and monologues. Read questions before audio starts.",
    "In IELTS Reading, skimming means reading quickly for gist. Scanning means looking for specific info. Do not read every word carefully.",
    "To improve from band 6 to 7 in Speaking, use wider vocabulary, fewer grammatical errors, and more complex sentence structures.",
    "IELTS Writing Task 2 structure: Introduction with thesis, Body paragraph 1 with main idea and example, Body paragraph 2, Conclusion.",
    "Pronunciation in IELTS Speaking is about clarity and natural stress patterns, not accent. You will not be penalized for your accent.",
    "Common IELTS Writing mistakes: no clear thesis, weak topic sentences, insufficient examples, repetitive vocabulary, short word count.",
    "IELTS band 7 grammar requires error-free sentences most of the time, with a mix of simple and complex structures used flexibly.",
    "For IELTS Reading True/False/Not Given, Not Given means the information is not in the passage at all.",
    "IELTS Listening requires correct spelling. British spelling is preferred but American spelling is also accepted.",
    "To get band 8 in IELTS Writing, your essay must show sophisticated vocabulary, flawless grammar, and a fully developed argument.",
]

def get_embedder():
    global _embedder
    if _embedder is None:
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _embedder

def get_index():
    global _index
    if _index is None:
        embedder = get_embedder()
        embeddings = embedder.encode(IELTS_KNOWLEDGE)
        _index = faiss.IndexFlatL2(embeddings.shape[1])
        _index.add(np.array(embeddings, dtype=np.float32))
    return _index

def retrieve_context(query: str, k: int = 3) -> str:
    embedder = get_embedder()
    index = get_index()
    query_vec = embedder.encode([query])
    _, indices = index.search(np.array(query_vec, dtype=np.float32), k)
    chunks = [IELTS_KNOWLEDGE[i] for i in indices[0] if i < len(IELTS_KNOWLEDGE)]
    return "\n".join(chunks)

async def chat_with_mentor(question: str, user_performance: dict = {}) -> str:
    context = retrieve_context(question)
    prompt = f"""You are a personal IELTS coach helping a student improve their score.

Relevant IELTS knowledge:
{context}

Student performance summary: {json.dumps(user_performance) if user_performance else "Not available yet"}

Student question: {question}

Give specific, practical, encouraging advice in 2-3 short paragraphs. Be direct and actionable."""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a friendly, expert IELTS coach. Give practical advice."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        max_tokens=600
    )
    return response.choices[0].message.content