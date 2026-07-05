# Future Founder Twin: A Multi-Agent AI Co-Founder That Validates Startup Ideas Before You Build

> **Subtitle:** An adversarial, 4-agent AI incubator powered by Google ADK, Gemini, and live market intelligence — built for the Kaggle × Google AI Agents: Intensive Vibe Coding Capstone.

---

## 1. Introduction & Track Selection

**Track: Agents for Business**

Approximately 90% of startups fail. Of those, 35% cite "no market need" as the primary reason — meaning founders built something the market didn't want. The remaining failures are heavily concentrated in poor execution planning, underfunded runways, and unmitigated risk. These are exactly the kinds of failures that a rigorous, adversarial co-founder could prevent.

**Future Founder Twin** is that co-founder. It is an agentic AI system that ruthlessly evaluates startup ideas *before* a single line of product code is written. Rather than a chatbot that validates every idea with enthusiasm, this system is designed to find the holes in your logic, stress-test your market assumptions with live data, quantify your execution risk, and force you to defend your idea against its own critique before generating a final verdict.

We submit to the **Agents for Business** track because the system directly addresses a business problem with real capital on the line: early-stage founders make multi-month, multi-thousand-dollar bets on product ideas every day. Future Founder Twin reduces the cost of a bad bet from months of effort to a 4-minute agentic evaluation session.

---

## 2. Problem Statement

Early-stage founders are uniquely susceptible to "founder goggles" — an intense psychological bias toward their own ideas. When they seek feedback, the social dynamics of human advisors often result in encouragement over honesty. Traditional AI chatbots compound this problem; a standard GPT-4 or Gemini chat interface, when asked "is my idea good?", will almost always produce an optimistic, validating response.

The result is predictable: founders over-invest in ideas that face insurmountable market conditions, lack competitive differentiation, or require execution capabilities that the founder doesn't possess. What the ecosystem needs is a system that acts as a sparring partner, not a cheerleader. It must be grounded in real-world market data, not LLM priors. It must separate the founder's skills from the idea's potential. And critically, it must be *adversarial by design* — forcing the founder to defend their vision before granting them a verdict.

Existing solutions fall short. Tools like ChatGPT lack real-time market grounding. Human accelerators and advisors are expensive and inaccessible to most founders. No open, free-to-use agentic tool exists that combines live research, structured critique, quantitative scoring, and future simulation in a single, automated workflow.

---

## 3. Solution Overview

Future Founder Twin addresses this gap through a coordinated, multi-step workflow unlike anything a single-prompt LLM can achieve. Founders complete a structured 5-question interview, after which a sequential pipeline of 4 specialized AI agents — orchestrated by the Google Agent Development Kit (ADK) — systematically tears apart and reconstructs the idea.

The key innovation is a mandatory **Human-in-the-Loop pause**. After Phase 1 (Research & Critique), the system stops and requires the founder to read the agent's identified risks and write an active defense before Phase 2 begins. This is not optional. The Evaluation Agent will read the founder's defense as part of its input context, meaning a weak defense leads directly to a lower score. This creates genuine accountability in the feedback loop.

The final deliverable is a structured **Investor Brief** — a one-page, formatted document with TAM, competitor gaps, founder fit score, top risk, mitigation strategy, realistic growth path, and a clear PURSUE / PIVOT / PAUSE verdict.

---

## 4. System Architecture

The system is built as a decoupled, two-tier architecture: a **FastAPI backend** running the Google ADK agent pipeline, and a **Next.js frontend** consuming the backend's Server-Sent Events (SSE) stream for real-time updates.

![System Architecture](https://mermaid.ink/img/Z3JhcGggVEQKICAgIFVzZXIoW0ZvdW5kZXIgLyBVc2VyXSkgLS0+IFVJW05leHQuanMgRnJvbnRlbmQgLSBWZXJjZWxdCiAgICBVSSAtLSBQT1NUIC9ydW5fc3NlIC0tPiBCRVtGYXN0QVBJICsgR29vZ2xlIEFESyAtIFJlbmRlcl0KCiAgICBzdWJncmFwaCAiUGhhc2UgMSDDouKCrOKAnSBTZXF1ZW50aWFsQWdlbnQ6IEZ1dHVyZUZvdW5kZXJUd2luUGhhc2UxIgogICAgICAgIEExW0ZvdW5kZXJQcm9maWxlciBMbG1BZ2VudF0gLS0+IEEyW01hcmtldERpc2NvdmVyeSBMbG1BZ2VudF0KICAgICAgICBBMiAtLSBnb29nbGVfc2VhcmNoIHRvb2wgLS0+IEEzW1BsYW5uaW5nQ3JpdGljIExsbUFnZW50XQogICAgZW5kCgogICAgc3ViZ3JhcGggIlBoYXNlIDIgw6LigqzigJ0gU2VxdWVudGlhbEFnZW50OiBGdXR1cmVGb3VuZGVyVHdpblBoYXNlMiIKICAgICAgICBBNFtFdmFsdWF0aW9uU2ltdWxhdGlvbkFnZW50IExsbUFnZW50XQogICAgZW5kCgogICAgQkUgLS0+IFBoYXNlMQogICAgUGhhc2UxIC0tIFBBVVNFOiBDcml0aWNhbCBEZWZlbnNlIFF1ZXN0aW9uIC0tPiBVSQogICAgVUkgLS0gRm91bmRlciB0eXBlcyBkZWZlbnNlIC0tPiBQaGFzZTIKICAgIFBoYXNlMiAtLT4gQkUKCiAgICBCRSAtLSBvdXRwdXRfa2V5IHN0YXRlIC0tPiBTZXNzaW9uU3RhdGVbKEFESyBJbk1lbW9yeVNlc3Npb25TZXJ2aWNlKV0KICAgIFNlc3Npb25TdGF0ZSAtLSBjb250ZXh0IGluamVjdGVkIC0tPiBBMgogICAgU2Vzc2lvblN0YXRlIC0tIGNvbnRleHQgaW5qZWN0ZWQgLS0+IEEzCiAgICBTZXNzaW9uU3RhdGUgLS0gY29udGV4dCBpbmplY3RlZCAtLT4gQTQK)

**Why Google ADK?** The ADK was selected because its `SequentialAgent` and `LlmAgent` primitives map directly to our phased pipeline design. The `output_key` mechanism on each `LlmAgent` allows the agent's response to be automatically written into the shared `InMemorySessionService` state, making all upstream context available to downstream agents without manual prompt stitching. This dramatically simplifies the orchestration logic and ensures architectural clarity (`agent.py:130-182`).

---

## 5. Agent Breakdown

The system uses **4 specialized `LlmAgent` instances**, wrapped by `SequentialAgent` orchestrators for phased execution. We deliberately chose to consolidate what could have been a larger swarm into 4 focused agents to reduce inter-agent latency and minimize token overhead on the Gemini free tier.

### Agent 1: Founder Profiler (`FounderProfiler`)
**Purpose:** Converts the raw 5-question interview into a structured, typed founder profile.
**Inputs:** The user's free-text interview answers.
**Tool:** `save_founder_profile` — a custom Python function that validates and formats 7 fields: `technical_background`, `idea_description`, `idea_category`, `runway_months`, `has_budget`, `has_shipped_product`, and `biggest_fear` (`tools.py:2-44`).
**Output key:** `founder_profile_summary` — a Markdown-formatted profile injected into shared session state.
**Why it exists:** Separating extraction from analysis ensures that all downstream agents operate on a consistently structured, validated representation of the founder, not raw free-text.

### Agent 2: Market Discovery (`MarketDiscovery`)
**Purpose:** Grounds the analysis in real-world market data rather than LLM priors.
**Inputs:** `founder_profile_summary` from session state.
**Tool:** `google_search` — the native ADK tool, called 3 times with structured queries for market size, competitors, and customer pain points (`agent.py:145`, `prompts.py:34-36`).
**Output key:** `market_analysis` — a cited report including TAM estimate, top competitors with weaknesses, market trends, identified gap, and demand signals.
**Why it exists:** Market research requires live, external data. This is the only task in the pipeline that cannot be reliably accomplished with LLM knowledge alone, which is why it is the only agent using `MODEL_SEARCH` — a model config that explicitly excludes open-weight Gemma models that don't support Search Grounding (`agent.py:118-126`).

### Agent 3: Planning & Critique (`PlanningCritic`)
**Purpose:** A dual-persona agent that first acts as a startup planner, then switches to an adversarial critic, then reconciles the tension into a final MVP plan.
**Inputs:** `founder_profile_summary` and `market_analysis`.
**Output key:** `planning_critic_result` — includes the MVP plan, an internal debate (Planner vs Critic), a risk table with mitigation strategies, 3 critical assumptions, and a single mandatory challenge question for the founder.
**Why it exists:** The planner/critic pattern in a single agent reduces latency compared to a 2-agent debate, while the structured prompt (`prompts.py:69-109`) enforces genuine adversarial reasoning via explicit persona switching.

### Agent 4: Evaluation & Simulation (`EvaluationSimulationAgent`)
**Purpose:** Synthesizes all prior outputs and the founder's defense into a quantitative score, 3 timeline simulations, and a final investor-ready brief.
**Inputs:** Full session state (all prior `output_key` values) plus the founder's typed defense.
**Tools:** Two custom tools:
- `calculate_founder_fit_score` — enforces numerical scoring across 4 dimensions (Technical Fit, Execution Fit, Market Timing, Risk-Adjusted), clamped to 0–100 with color-coded labels (`tools.py:48-102`).
- `generate_investor_brief` — assembles a 13-field structured brief in a fixed format (`tools.py:105-181`).
**Output key:** `evaluation_simulation_results`.
**Why it exists:** Separating evaluation from simulation ensures the scoring is independently verifiable and not muddied by narrative generation. The explicit tool calls also enforce structured output formats, preventing the LLM from producing loosely formatted text.

---

## 6. Technical Stack

| Layer | Technology |
| :--- | :--- |
| Agent Framework | Google ADK (`google-adk>=1.0.0`) |
| Backend API | FastAPI + Uvicorn (Python 3.10+) |
| Primary Model | Gemini 2.5 Flash Lite |
| Fallback Models | Gemini 3.1 Flash Lite, Gemini 2.0 Flash, Gemma 4-26B, Gemma 4-31B, Gemini 2.5 Flash |
| Frontend | Next.js 16 (React, TypeScript) |
| Deployment | Render (Backend API), Vercel (Frontend) |
| Real-time Streaming | Server-Sent Events (SSE) via `/run_sse` |
| State Management | ADK `InMemorySessionService` + browser `localStorage` |

---

## 7. Course Concepts Demonstrated

| Course Concept | Implementation | Evidence |
| :--- | :--- | :--- |
| **Multi-Agent System (ADK)** | 4 `LlmAgent` instances orchestrated by 2 `SequentialAgent` wrappers in a 2-phase pipeline | `agent.py:130-182` |
| **Tool Usage** | `google_search` (ADK native) + 3 custom Python tools for structured extraction | `agent.py:135,145,164`, `tools.py` |
| **Sessions & State** | `InMemorySessionService` persists `output_key` data across agents; frontend restores sessions via `/apps/.../sessions` API | `main.py:4`, `adk.ts:23-42` |
| **Streaming** | Frontend reads raw SSE from `/run_sse`, filtering thought tokens in real time for a live pipeline UI | `adk.ts:46-121` |
| **Security Features** | API keys never hardcoded; `RotatingFallbackLlm` rotates keys safely on 429 errors | `agent.py:24-43` |
| **Deployability** | `/health` endpoint for uptime monitoring; `PORT` env var for cloud deployment; Render + Vercel deployment ready | `main.py:46-52` |
| **Evaluation** | Quantitative Founder Fit Matrix enforced via structured tool calls across 4 explicit dimensions | `tools.py:48-102` |

---

## 8. Engineering Decisions & Trade-offs

**Decision 1: 4 Agents Instead of a Larger Swarm**
The original design called for separate Planner and Critic agents. During development, we discovered that running 5+ agents sequentially on the Gemini free tier consistently triggered 429 rate limits, making the pipeline unreliable for judges evaluating the submission. We consolidated the Planner and Critic into one dual-persona agent (`PlanningCritic`) using an explicit persona-switching prompt. This reduced token overhead and latency with no measurable loss in output quality.

**Decision 2: `RotatingFallbackLlm` — Custom `BaseLlm` Wrapper**
Rather than relying on a single model or a single API key, we built a production-grade custom LLM wrapper (`agent.py:46-115`). It inherits from ADK's `BaseLlm`, implements `generate_content_async` as an `AsyncGenerator`, and catches `_ResourceExhaustedError`. On a 429, it rotates to the next API key (if available) and then cascades through a prioritized list of 6 fallback models. This is a real production pattern applied to a Kaggle demo context.

**Decision 3: Model-Aware Routing**
Gemma open-weight models don't support Google Search Grounding. We created two model instances — `MODEL` (includes Gemma fallbacks) and `MODEL_SEARCH` (excludes Gemma) — and assigned them to agents based on their tool requirements. This prevents silent failures in the Market Discovery agent while still getting the benefit of Gemma's generous free-tier quotas for other agents (`agent.py:105-126`).

**Decision 4: Structured Tool Calls for Output Enforcement**
Instead of relying on prompt instructions alone to produce structured output, Agents 1 and 4 are required to call custom Python tools that enforce schema. The agent cannot skip calling `save_founder_profile` or `calculate_founder_fit_score` — the prompt instructions mandate these calls, and the tool return values confirm success. This enforces output quality at the infrastructure level rather than the prompt level.

---

## 9. Technical Challenges & Lessons Learned

**Challenge 1: Rate Limits Destroying Demo Reliability**
This was the biggest practical challenge. Running 4 agents with rich prompts and live search calls consistently exceeded the Gemini free tier's RPM limits, causing the pipeline to hang or fail mid-execution — a terrible experience for judges.

*Lesson:* Building resilience into the model layer (not just retrying at the application level) was the correct architectural approach. `RotatingFallbackLlm` solved this elegantly by making the system degrade gracefully across 6 model options rather than hard-failing.

**Challenge 2: Gemini 2.5 Thinking Tokens Leaking to UI**
The Gemini 2.5 family's thinking/reasoning tokens (internal scratchpad) appeared in the raw SSE stream, polluting the frontend's live output with raw model reasoning instead of the final formatted response.

*Lesson:* ADK's event objects contain a `thought: true` field on reasoning parts. We implemented a client-side filter in `adk.ts:115-121` (`.filter(p => p.text && !p.thought)`) to strip these before rendering. This was a non-obvious ADK-specific gotcha not documented in the standard quickstarts.

**Challenge 3: State Visibility Across the Human-in-the-Loop Pause**
The two-phase design requires Phase 1's session state to survive the UI pause while the founder types their defense, then be available to Phase 2. ADK's `InMemorySessionService` handles this naturally since the session persists server-side by session ID. The frontend stores the `sessionId` in `sessionStorage` during the pause to ensure Phase 2 is called against the correct session (`adk.ts:144-146`).

---

## 10. User Journey

1. **Landing Page:** The founder arrives and sees a live animated preview of the agent pipeline cycling through its 4 stages. If they've used the tool before, a "Welcome back" banner appears with a one-click option to resume their previous analysis.
2. **Interview (5 Questions):** A sequential, card-based questionnaire collects the founder's technical background, idea description, runway, budget, shipping history, and biggest fear. Progress is shown via a step indicator.
3. **Phase 1 — Live Pipeline:** The founder clicks "Analyze My Idea." The `FutureFounderTwinPhase1` sequential agent runs. The UI shows a glowing pipeline track where each agent node illuminates as it becomes active. Streaming agent output appears in real time.
4. **Human-in-the-Loop Defense:** After Phase 1 completes, the UI pauses and displays the Planning Critic's challenge question. The founder reads the risk assessment and types their defense. They cannot proceed without submitting this.
5. **Phase 2 — Evaluation:** The defense is sent to `FutureFounderTwinPhase2`. The Evaluation Agent scores the founder, simulates 3 timelines, and generates the Investor Brief. The pipeline UI shows the final agent activating.
6. **Results Dashboard:** The founder sees the Founder Fit score with a color-coded matrix, the 3 simulation timeline cards (Optimistic, Realistic, Conservative), and the full Investor Brief rendered in Markdown. The verdict — PURSUE, PIVOT, or PAUSE — is prominently displayed.
7. **History Panel:** The completed analysis is saved to `localStorage`. On future visits, the History Panel on the landing page allows the founder to review all past analyses.

---

## 11. Deployment

The application is deployed as two independent services:

- **Frontend:** Deployed to **Vercel** at `https://adk.meghasara.me/`. Next.js builds are served via Vercel's edge network. The `NEXT_PUBLIC_ADK_BACKEND_URL` environment variable points the frontend to the Render backend.
- **Backend:** Deployed to **Render**. The FastAPI server is started with `uvicorn` using the `PORT` environment variable injected by Render (`main.py:51`). A `/health` endpoint (`main.py:46-48`) serves as the Render health check to confirm liveness.

---

## 12. Implemented Features

| Feature | Description |
| :--- | :--- |
| Live Glowing Pipeline UI | Real-time SSE stream visualized as an animated agent track |
| 5-Question Structured Interview | Sequential card-based founder profiling |
| Live Google Search Grounding | Market Discovery agent calls `google_search` 3× for real data |
| Human-in-the-Loop Defense Gate | Pipeline forcibly pauses; Phase 2 cannot start without the founder's typed defense |
| Quantitative Founder Fit Matrix | 4-dimension scoring (0-25 each) enforced via structured tool calls |
| 3-Timeline Simulation | Optimistic, Realistic, Conservative future projections with probabilities |
| Investor Brief Generator | Structured 13-field brief with PURSUE/PIVOT/PAUSE verdict |
| Session Memory & History Panel | `localStorage` + ADK session recall; "Welcome back" banner on return |
| Demo Presets | One-click pre-filled demo scenarios for judges to instantly test the pipeline |
| API Key Rotation & Model Fallback | Auto-rotation across 3 API keys and 6 model fallbacks on rate limits |

---

## 13. Future Improvements

*(Planned but not yet implemented)*

- **Persistent Storage:** Replace `InMemorySessionService` with a database-backed session service (e.g., Cloud Firestore) for production-grade session persistence across server restarts.
- **Comparative Analysis:** Allow founders to submit two competing ideas and run the pipeline on both, producing a side-by-side comparison.
- **Export to PDF:** One-click export of the Investor Brief to a formatted PDF document.
- **Webhook Notifications:** Email or Slack notification when a long-running pipeline (if cloud-deployed) completes.

---

## 14. Conclusion

Future Founder Twin is fundamentally different from a chatbot. A chatbot maintains conversational state and responds to prompts. Future Founder Twin maintains *agentic orchestration state* — each of its 4 specialized `LlmAgent` instances operates with a distinct identity, a restricted set of tools, and a clearly defined output contract. The `SequentialAgent` orchestrator enforces execution order. The `InMemorySessionService` ensures information flows forward through the pipeline without redundancy. The Human-in-the-Loop gate introduces genuine interactivity that cannot be replicated with a single prompt.

The system transforms a 4-minute user interview into a market-grounded, adversarially-critiqued, quantitatively-scored startup evaluation — a process that would normally require weeks of research and thousands of dollars in advisory fees. That is the promise of truly agentic AI, and that is what Future Founder Twin delivers.

---

> **📌 INPUTS STILL NEEDED FROM YOU BEFORE SUBMITTING:**
> 1. YouTube video link for the Media Gallery (required for submission)
> 2. Cover image for the Kaggle Media Gallery (required to submit the writeup)
