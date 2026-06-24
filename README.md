# Future Founder Twin

[![Kaggle Capstone](https://img.shields.io/badge/Kaggle-AI_Agents_Intensive-blue.svg)](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)
[![Google ADK](https://img.shields.io/badge/Powered_by-Google_ADK-red.svg)](https://github.com/google/agent-development-kit)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black.svg)](https://nextjs.org/)

**Future Founder Twin** is an AI co-founder designed to ruthlessly evaluate your startup ideas before you write a single line of code. Built for the **Kaggle × Google "Agents for Business" Capstone**, this project leverages a multi-agent orchestration pipeline to research markets, identify risks, and calculate a realistic Founder-Idea Fit score.

Most startups fail because founders build products nobody wants, or tackle markets they aren't equipped for. This tool acts as an adversarial, highly analytical mirror.

---

## 🏗️ Architecture

The system uses the **Google Agent Development Kit (ADK)** to orchestrate 7 specialized agents. It implements a unique **Two-Phase Human-in-the-Loop** design. After Phase 1, the pipeline pauses, forcing the founder to defend their idea against the Risk Critic's questions before Phase 2 generates the final evaluation.

\\\mermaid
graph TD
    User([Founder / User]) --> UI[Next.js Frontend]
    UI -- SSE Stream --> ADK[FastAPI + Google ADK Backend]
    
    subgraph Phase 1: Research & Critique
        A1[Founder Profiler] --> A2[Market Discovery]
        A2 -- Uses Google Search --> A3[MVP Architect]
        A3 --> A4[Risk Critic]
    end
    
    subgraph Phase 2: Refinement & Evaluation
        A5[MVP Architect Revised] --> A6[Evaluation Agent]
        A6 --> A7[Future Simulator]
    end
    
    ADK --> Phase1
    Phase1 -- PAUSE: "Critical Defense" --> UI
    UI -- Founder Defense --> Phase2
    Phase2 --> ADK
    
    ADK -- State Delta Streams --> UI
\\\

## 🤖 The 7-Agent Pipeline

Our application moves beyond a simple "chatbot" interface by chaining specialized agents, passing state via the ADK \InMemorySessionService\:

1. **Founder Profiler**: Extracts technical skills, runway, and constraints from the user's initial interview.
2. **Market Discovery**: Actively calls the \google_search\ tool to fetch live competitor data and estimate market size.
3. **MVP Architect**: Designs a realistic, step-by-step product build plan tailored *specifically* to the founder's skill level.
4. **Risk Critic**: Acts adversarially, finding the biggest flaws in the business model, marketing, or technical feasibility.
   - *⏸️ HUMAN-IN-THE-LOOP PAUSE: The user must read the risks and write a defense.*
5. **MVP Architect (Revised)**: Takes the user's defense and refines the original MVP plan to mitigate the risks.
6. **Evaluation Agent**: Scores the founder across 4 strict dimensions: Market, Execution, Tech, and Risk, resulting in a quantitative Founder Fit Score.
7. **Future Simulator**: Projects 3 possible timeline scenarios (Best, Worst, Realistic) and outputs the final Investor Brief and verdict (**PURSUE**, **PIVOT**, or **PAUSE**).

---

## ✨ Features

- **Live Glowing Pipeline UI:** Watch the agents "think" in real-time via Server-Sent Events (SSE) stream.
- **Analysis History (Memory):** Completed analyses are saved locally so you can compare multiple startup ideas.
- **Markdown Export:** Full Investor Briefs are rendered beautifully and can be exported to PDF.
- **Demo Presets:** One-click pre-filled scenarios for Kaggle judges to instantly test the 7-agent pipeline.

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
\\\

**API Key:**
Create a \.env\ file in the \ackend/\ directory:
\\\env
GOOGLE_API_KEY=your_gemini_api_key_here
\\\

**Run Backend:**
\\\ash
python main.py
# Runs on http://localhost:8000
\\\

### 3. Frontend Setup (Next.js)
\\\ash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
\\\

---

## 🏆 Kaggle Rubric Alignment

This project was specifically engineered to max out the course grading rubric:
- **Multi-Agent Systems:** 7 agents interacting sequentially.
- **Tool Usage:** Agent 2 performs grounded Google Searches.
- **Sessions & State:** ADK Session state passed seamlessly between agents and the frontend.
- **Memory:** \localStorage\ History Panel implementing session recall.
- **Evaluation:** Quantitative Founder Fit Matrix and scoring logic.
- **Critic & Refinement Loop:** The Phase 1 to Phase 2 transition is pure adversarial refinement.

---
*Built by Team Future Founder Twin for the Google Agents Intensive.*
