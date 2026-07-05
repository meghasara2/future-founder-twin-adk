# 🎬 Future Founder Twin — 5-Minute Video Pitch Script
**Kaggle × Google AI Agents Intensive — Agents for Business Track**

> **Recording Tips:**
> - Use [OBS Studio](https://obsproject.com/) or Loom (free) to screen record
> - Keep camera on if possible — judges respond well to face-cam in the corner
> - Aim for 4:30–5:00 total. Don't rush — speak clearly.
> - Use the Demo Preset buttons so you don't have to type during recording

---

## ⏱️ Timing Overview

| Section | Duration |
|---|---|
| Hook + Problem | 0:00 – 0:45 |
| Why Agents? | 0:45 – 1:30 |
| Architecture | 1:30 – 2:15 |
| Live Demo | 2:15 – 4:00 |
| Tech Stack & Closing | 4:00 – 5:00 |

---

## 🎥 Full Script

---

### SECTION 1 — The Hook & Problem (0:00 – 0:45)

| 🖥️ Visuals (What to show on screen) | 🎙️ Audio (What to say) |
|---|---|
| Open with your face or a blank screen. Show a slide or typed text: **"90% of startups fail."** | *"Ninety percent of startups fail. And thirty-five percent of those failures have the same cause — founders built something the market didn't want."* |
| Cut to a screenshot of a generic ChatGPT conversation where someone asks "Is my startup idea good?" and gets an enthusiastic, optimistic response. | *"When founders ask a standard AI chatbot to evaluate their idea, they get a cheerleader. 'This is amazing, the market is huge, you should totally build this.' That's not helpful. That's dangerous."* |
| Show a split screen: on one side, a founder working late (stock image), on the other side, a VC rejection email (generic). | *"Founders are making multi-month, multi-thousand dollar bets based on gut feeling and AI that tells them what they want to hear. We built Future Founder Twin to fix that."* |

---

### SECTION 2 — Why Agents? (0:45 – 1:30)

| 🖥️ Visuals (What to show on screen) | 🎙️ Audio (What to say) |
|---|---|
| Show the landing page of your deployed app. Highlight the animated pipeline preview that cycles through the 4 agent nodes. | *"A single AI prompt cannot evaluate a startup idea properly. You need research, critique, planning, and scoring — each done by a specialized agent, in sequence."* |
| Point to each glowing node on the pipeline animation as you name the agents. | *"That's exactly what Future Founder Twin does. It uses the Google Agent Development Kit — ADK — to chain 4 specialized LLM agents in a two-phase pipeline."* |
| Show the architecture Mermaid diagram from the README on screen. | *"Agent 1 profiles the founder. Agent 2 does live Google searches to research the market. Agent 3 designs an MVP and immediately critiques its own plan. And Agent 4 scores the founder and generates an Investor Brief. Each agent is a specialist. None of them do everything."* |

---

### SECTION 3 — Architecture Deep Dive (1:30 – 2:15)

| 🖥️ Visuals (What to show on screen) | 🎙️ Audio (What to say) |
|---|---|
| Show the Mermaid diagram — highlight the `SequentialAgent` boxes and the `InMemorySessionService` node. | *"The orchestration is handled by ADK's SequentialAgent. Each agent writes its output to a named key in the shared session state using ADK's output_key mechanism. So Agent 4 automatically has access to everything Agent 1, 2, and 3 produced — no manual wiring needed."* |
| Highlight the "PAUSE: Critical Defense" arrow in the diagram. | *"Here's the key innovation: a mandatory Human-in-the-Loop pause. After Phase 1, the pipeline stops. The founder must read the risks and write an active defense before Phase 2 can begin. A weak defense leads to a lower score. We built real accountability into the loop."* |
| Briefly show `agent.py` in your code editor — just the agent definitions, not the full file. Zoom into the `RotatingFallbackLlm` class name. | *"We also built a production-grade resilience layer — a custom LLM wrapper that catches rate limit errors and automatically rotates through 3 API keys and 6 different model fallbacks, including Gemma, so the pipeline never hard-fails."* |

---

### SECTION 4 — Live Demo (2:15 – 4:00)

| 🖥️ Visuals (What to show on screen) | 🎙️ Audio (What to say) |
|---|---|
| Show the landing page. Click one of the **Demo Preset** buttons. | *"Let me show you this live. I'll use a demo preset so we can move quickly — a founder with a dog walking app idea, 3 months of runway, and a tight budget."* |
| Click **"Start Your Analysis"** and move to the interview page. Show the pre-filled answers. | *"The founder has answered 5 questions about their background, idea, runway, and biggest fears. Now we hit analyze."* |
| Click the Analyze button. Show the **glowing pipeline UI** activating. Point to Agent 1 lighting up. | *"Watch the pipeline. Agent 1 — the Founder Profiler — is running. It's calling our custom save_founder_profile tool to extract and validate the founder's data."* |
| Agent 2 lights up. Point to it. | *"Agent 2 — Market Discovery — is now calling Google Search three times. It's fetching real, live market size data and competitor weaknesses right now. Not LLM priors. Real web data."* |
| Agent 3 lights up. Show the streaming output appearing. | *"Agent 3 — Planning and Critique — designs the MVP and then immediately critiques its own plan. You can see both the Planner persona and the Critic persona arguing in the output."* |
| The pipeline **pauses**. Show the critical defense question appearing on screen. | *"And here — the pipeline stops. The founder must now read the risks and defend their idea. This is the Human-in-the-Loop gate. I'll type a quick defense..."* |
| Type a defense and click submit. Agent 4 lights up. | *"Phase 2 begins. The Evaluation Agent is now reading the founder's defense, all prior research, and scoring across 4 dimensions."* |
| Show the **Results Dashboard** — the Founder Fit Matrix, 3 simulation cards, and the Investor Brief with the verdict badge. | *"And here's the output. A quantitative Founder Fit score. Three simulated futures — Optimistic, Realistic, and Conservative. And a complete Investor Brief with a final verdict: Pursue, Pivot, or Pause."* |

---

### SECTION 5 — Tech Stack & Closing (4:00 – 5:00)

| 🖥️ Visuals (What to show on screen) | 🎙️ Audio (What to say) |
|---|---|
| Show a simple slide or text on screen listing the stack. | *"Under the hood: Google ADK for orchestration, FastAPI on the backend deployed to Render, Next.js on the frontend deployed to Vercel, and Gemini 2.5 Flash as the primary model with automatic fallback to Gemma for non-search agents."* |
| Show the **History Panel** on the landing page — the completed session appearing there. | *"We also implemented session memory. If the founder comes back, they see a Welcome Back banner and can resume or compare previous analyses."* |
| Show the GitHub repo briefly. | *"Everything is open source, fully documented in the README, and deployable in under 10 minutes with a single API key."* |
| Return to the Results page — zoom in on the Verdict badge. | *"Future Founder Twin isn't a chatbot. It's a coordinated, multi-agent advisory system that transforms a 4-minute interview into a market-grounded, adversarially-critiqued startup evaluation — the kind of analysis that would normally cost weeks and thousands of dollars in advisory fees."* |
| End on landing page or face-cam. | *"This is what agentic AI looks like when it's built to solve a real business problem. Thank you."* |

---

## 📝 Recording Checklist

- [ ] Backend running (locally or on Render) before you start recording
- [ ] Frontend open in browser — use https://adk.meghasara.me/
- [ ] Demo preset buttons tested — make sure one works end-to-end before recording
- [ ] `GOOGLE_API_KEY` is set and working
- [ ] Screen resolution set clearly (1080p preferred)
- [ ] Microphone tested — audio quality matters more than video quality
- [ ] YouTube upload set to **Public** (Kaggle requires a public link)
- [ ] Video title: **"Future Founder Twin — Kaggle × Google AI Agents Capstone Demo"**
