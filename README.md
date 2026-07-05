# Future Founder Twin

[![Kaggle Capstone](https://img.shields.io/badge/Kaggle-AI_Agents_Intensive-blue.svg)](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)
[![Google ADK](https://img.shields.io/badge/Powered_by-Google_ADK-red.svg)](https://github.com/google/agent-development-kit)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black.svg)](https://nextjs.org/)

**Future Founder Twin** is an AI co-founder designed to ruthlessly evaluate your startup ideas before you write a single line of code. Built for the **Kaggle × Google "Agents for Business" Capstone**, this project leverages a multi-agent orchestration pipeline to research markets, identify risks, and calculate a realistic Founder-Idea Fit score.

Most startups fail because founders build products nobody wants, or tackle markets they aren't equipped for. This tool acts as an adversarial, highly analytical mirror.

---

## 🏗️ Architecture

The system uses the **Google Agent Development Kit (ADK)** to orchestrate 4 specialized agents. It implements a unique **Two-Phase Human-in-the-Loop** design. After Phase 1, the pipeline pauses, forcing the founder to defend their idea against the Planning & Critique agent's questions before Phase 2 generates the final evaluation.

**Architectural Decision:** We intentionally consolidated closely related responsibilities (e.g., Planner + Critic) into four specialized agents to reduce latency, lower token usage, and improve maintainability while preserving clear agent boundaries and ADK orchestration.

\\\mermaid
graph TD
    User([Founder / User]) --> UI[Next.js Frontend]
    UI -- SSE Stream --> ADK[FastAPI + Google ADK Backend]
    
    subgraph Phase 1: Research & Critique
        A1[Founder Profiler] --> A2[Market Intelligence]
        A2 -- Uses Google Search --> A3[Planning & Critique]
    end
    
    subgraph Phase 2: Evaluation & Simulation
        A4[Evaluation & Simulation Agent]
    end
    
    ADK --> Phase1
    Phase1 -- PAUSE: "Critical Defense" --> UI
    UI -- Founder Defense --> Phase2
    Phase2 --> ADK
    
    ADK -- State Delta Streams --> UI
\\\

## 🤖 The 4-Agent Pipeline

Our application moves beyond a simple "chatbot" interface by chaining specialized agents, passing state via the ADK `InMemorySessionService`:

1. **Founder Profiler**: Extracts technical skills, runway, and constraints from the user's initial interview.
2. **Market Intelligence**: Actively calls the `google_search` tool to fetch live competitor data and estimate market size.
3. **Planning & Critique**: A dual-role agent that first designs a realistic MVP, then switches into an independent critic persona to identify the biggest flaws before producing a reconciled final plan.
   - *⏸️ HUMAN-IN-THE-LOOP PAUSE: The user must read the risks and write a defense.*
4. **Evaluation & Simulation Agent**: Takes the user's defense and evaluates the founder across 4 strict dimensions. Projects 3 possible timeline scenarios (Best, Worst, Realistic) and outputs the final Investor Brief and verdict (**PURSUE**, **PIVOT**, or **PAUSE**).

---

## ✨ Features

- **Live Glowing Pipeline UI:** Watch the agents "think" in real-time via Server-Sent Events (SSE) stream.
- **Analysis History (Memory):** Completed analyses are saved locally so you can compare multiple startup ideas.
- **Markdown Export:** Full Investor Briefs are rendered beautifully and can be exported to PDF.
- **Demo Presets:** One-click pre-filled scenarios for Kaggle judges to instantly test the 4-agent pipeline.

---

## 🚀 Local Development Setup

### 1. Clone the repository
\\\ash
git clone https://github.com/justinsaju21/future-founder-twin-adk.git
cd future-founder-twin-adk
\\\

### 2. Backend Setup (FastAPI + Google ADK)
Requires Python 3.10+.
\\\ash
cd backend
python -m venv .venv
# Activate venv:
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

pip install -r requirements.txt
```

**API Key & Rate Limits (Free Tier):**
Because this pipeline runs 4 agents sequentially with complex prompts, it can hit the Google Gemini free-tier rate limits. To prevent this, you can provide multiple API keys. The backend will automatically rotate them on a 429 Resource Exhausted error, and employs exponential backoff.

Create a `.env` file in the `backend/` directory:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY_2=your_second_api_key_here  # Optional fallback
GOOGLE_API_KEY_3=your_third_api_key_here   # Optional fallback
```

**Run Backend:**
```bash
python main.py
# Runs on http://localhost:8000
```

### Troubleshooting
- **Pipeline hangs / 429 Quota Exceeded:** Check the UI or backend logs. If you've hit your free tier quota across all keys, wait a minute before retrying, or add an additional API key.
- **Connection Error:** Ensure the backend is running on port 8000.

### 3. Frontend Setup (Next.js)
```ash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
\\\

---

## 🏆 Kaggle Rubric Alignment

This project was specifically engineered to max out the course grading rubric:
- **Multi-Agent Systems:** 4 agents interacting sequentially.
- **Tool Usage:** Agent 2 performs grounded Google Searches.
- **Sessions & State:** ADK Session state passed seamlessly between agents and the frontend.
- **Memory:** \localStorage\ History Panel implementing session recall.
- **Evaluation:** Quantitative Founder Fit Matrix and scoring logic.
- **Critic & Refinement Loop:** The Phase 1 to Phase 2 transition is pure adversarial refinement.

---
*Built by Team Future Founder Twin for the Google Agents Intensive.*
