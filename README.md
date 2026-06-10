# IELTS AI Coach

**Live:** https://ielts-ai-coach-two.vercel.app

I built this because a student has to pay a good amount of money a month for IELTS coaching and still not improving. The feedback was generic, the classes were crowded, and nobody was tracking what she was actually getting wrong. I figured an AI could do better — at least it never gets tired of correcting the same grammar mistake for the tenth time.

Now the core coaching loop works.

---

## What it actually does

- **Writing Coach** — paste your Task 1 or Task 2 essay, get band scores across all four IELTS criteria, specific line-by-line grammar corrections, vocabulary upgrade suggestions, and a fully rewritten improved version of your essay
- **Speaking Coach** — record yourself answering an IELTS question, the audio gets transcribed via Whisper, and you get evaluated on fluency, grammar, vocabulary, and pronunciation with a model answer to compare against
- **AI Mentor Chat** — ask anything about IELTS preparation, the coach answers based on your actual performance history and weak areas, not just generic advice
- **Study Plan Generator** — tells you exactly what to study each day for 2 to 8 weeks based on your target band, current level, and which skills need the most work
- **Progress Dashboard** — charts your band score history over time so you can actually see whether you're improving or just spinning your wheels

---

## Tech stack

Everything here is free tier. No paid APIs except Groq, which has a generous free limit.

| Layer | What I used |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| LLM | Groq API — Llama 3.3 70B |
| Speech-to-text | Groq Whisper large-v3 |
| Database | PostgreSQL via NeonDB |
| Frontend | Vercel |
| Backend | Render |

---

## Project structure

```
ielts-ai-coach/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (auth, writing, speaking, study-plan, progress)
│   │   ├── core/         # Config, database connection, JWT security
│   │   ├── models/       # SQLAlchemy models
│   │   └── services/     # AI evaluation logic, Groq API calls
│   ├── main.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/   # Layout, shared UI
        ├── pages/        # WritingCoach, SpeakingCoach, StudyPlan, Progress, Dashboard
        ├── services/     # Axios API client
        └── store/        # Zustand auth store
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

Create a `.env` file inside `backend/`:

```env
DB_USER=your_neon_user
DB_PASSWORD=your_neon_password
DB_HOST=your_neon_host
DB_NAME=neondb
SECRET_KEY=any_long_random_string
GROQ_API_KEY=your_groq_api_key
```

Get a free Groq API key at console.groq.com. Get a free NeonDB PostgreSQL connection at neon.tech.

```bash
uvicorn main:app --reload --port 8000
```

Interactive API docs at `http://localhost:8000/docs` — useful for testing endpoints before hooking up the frontend.

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

## What's done, what's not

- [x] JWT auth — register, login, token refresh
- [x] User profile with target band, exam date, weak skills
- [x] Writing evaluation — band scores, grammar corrections, vocabulary suggestions, improved essay
- [x] Speaking evaluation — Whisper transcription + band scoring
- [x] AI Mentor chat
- [x] Personalized study plan generator
- [x] Progress dashboard with band history charts
- [x] Deployed — Vercel (frontend) + Render (backend) + NeonDB
- [ ] Mock interview flow with multi-turn examiner conversation
- [ ] Reading assistant — passage upload, MCQ generation, keyword highlighting
- [ ] Listening practice module

---

## Why I built this

Good IELTS feedback is expensive in Bangladesh and hard to get consistently. A teacher who gives you the same quality of attention in session 20 as in session 1, remembers every mistake you made last week, and is available at 2am — that does not exist at any price. This is my attempt to get close.

Whether I've actually gotten close is a question I'll answer after a few more months of testing.

---

*Band score predictions are AI-generated estimates. Not affiliated with the British Council, IDP, or Cambridge Assessment English.*