# IELTS AI Coach 

An AI-powered IELTS preparation platform I built for utilizing my free time . The idea came from watching friends struggle with expensive coaching centers — I wanted to build something that gives real, personalized feedback without the cost.

Still a work in progress, but the core is coming together.

---

## What it does

Most IELTS prep tools are just flashcard apps or grammar checkers. This one tries to be an actual coach:

- **Writing Coach** — paste your essay, get band scores across all four criteria (Task Response, Coherence, Lexical Resource, Grammar), specific grammar corrections, vocabulary upgrade suggestions, and an improved version of your essay
- **Speaking Coach** — record yourself answering an IELTS question, get it transcribed and evaluated on fluency, vocabulary, grammar, and pronunciation
- **Mock Examiner** — simulates a real Part 1/2/3 interview with follow-up questions
- **Study Plan Generator** — builds a week-by-week plan based on your target band, current level, and weak areas
- **AI Mentor Chat** — RAG-based chatbot that answers questions using IELTS rules + your own performance history
- **Progress Dashboard** — tracks band scores over time so you can see if you're actually improving

---

## Tech stack

Went fully free-tier on everything:

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| LLM | Groq API — Llama 3.3 70B |
| Speech-to-text | Groq Whisper large-v3 |
| Vector search | FAISS |
| Database | PostgreSQL via NeonDB |
| Frontend deploy | Vercel |
| Backend deploy | Render |

---

## Project structure

```
ielts-ai-coach/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, DB, security
│   │   ├── models/       # SQLAlchemy models
│   │   └── services/     # Business logic + AI calls
│   ├── main.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        └── store/
```

---

## Running locally

**Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:

```env
DB_USER=your_neon_user
DB_PASSWORD=your_neon_password
DB_HOST=your_neon_host
DB_NAME=neondb
SECRET_KEY=your_secret_key
GROQ_API_KEY=your_groq_key
```

Then start the server:

```bash
uvicorn main:app --reload --port 8000
```

API docs will be at `http://localhost:8000/docs`

**Frontend**

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

---

## Current status

- [x] Auth system (JWT-based register/login)
- [x] User profile with IELTS-specific fields (target band, exam date, weak skills)
- [x] Database schema and migrations
- [x] Writing evaluation endpoint
- [x] Speaking evaluation with Whisper transcription
- [ ] Frontend UI (in progress)
- [ ] Mock interview flow
- [ ] Study plan generator
- [ ] Progress dashboard
- [ ] Deployment

---

## Why I built this

IELTS coaching in Bangladesh is expensive and generic. A good teacher gives you personalized feedback — tells you exactly which grammar patterns you keep getting wrong, notices when your vocabulary is too basic, pushes you with follow-up questions when you give a short answer. I wanted to see how close an LLM-based system could get to that.

The answer so far: pretty close for writing, surprisingly decent for speaking, still improving.

---

## Self Idea Project

*This is a student project. The band score predictions are AI-generated estimates and should not be treated as official IELTS scores.*
