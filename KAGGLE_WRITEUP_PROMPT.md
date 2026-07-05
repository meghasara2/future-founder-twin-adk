# Kaggle Capstone Writeup Generation Prompts

**Instructions:** Copy and paste the prompts below sequentially to your AI assistant. This is broken down into three parts to ensure the highest quality output without diluting the model's attention.

**Before starting:** Determine which track you are submitting to (e.g., "Agents for Business", "Freestyle") and replace `[INSERT TRACK HERE]` in Prompt 1. Also, ensure the AI has access to your codebase (e.g., if using Claude Code, Cursor, or an IDE agent).

***

## PROMPT 1: Codebase Analysis & Writeup Generation
*(Run this first)*

Analyze My Codebase and Generate a Kaggle Capstone Writeup.
You are a senior AI engineer, Google ADK expert, Kaggle Grandmaster, technical architect, and award-winning technical writer.

Your task is NOT to immediately start writing.

Your first responsibility is to completely understand my project from the codebase. If you cannot access the local filesystem or read my codebase directly, STOP and tell me immediately rather than inferring the architecture.

This project is being submitted to the Kaggle × Google AI Agents: Intensive Vibe Coding Capstone Project under the **"Agents for Business"** track. The writeup must accurately represent the implementation and clearly demonstrate the course concepts: multi-agent systems, ADK orchestration, tool usage, sessions, memory, evaluation, production deployment, and agent engineering.

### Phase 1 — Codebase Analysis (Do NOT Skip)
Before writing anything, read the entire repository.
Understand:
- Folder structure and Architecture
- Backend (FastAPI, Python) and Frontend (Next.js)
- ADK implementation inside the `backend/future_founder_twin/` directory
- Prompt design, Agent orchestration, Tool calling
- Memory & Session implementation (InMemory services)
- Evaluation logic
- UI flow and SSE streaming implementation
- Deployment configuration

Go through every important file. Do not assume anything. Everything in the writeup must come from the actual implementation.

### Phase 2 — Understand the Project
Prepare a complete internal understanding of:
- **Project Goal & Track**: What problem "Future Founder Twin" solves, why it fits the selected track, and what makes it different from a standard chatbot.
- **Architecture & ADK Usage**: Overall architecture, data flow. Identify exactly where the project uses Kaggle course concepts: Agent/Multi-agent system (ADK), MCP Server (if any), Antigravity, Security features, Deployability, and Agent skills. Explain the flow of Sessions and Memory using ADK.
- **Agents**: For every agent in `backend/future_founder_twin/` (e.g., Planner, Critic, Evaluator), explain purpose, inputs, outputs, state passed, prompt strategy, and collaboration.
- **Integration**: Next.js interview flow, pipeline UI, streaming updates, FastAPI endpoints.

### Phase 3 — Internal Review & CHECKPOINT
Before writing, perform an internal review. Identify strengths, weaknesses, interesting engineering decisions, and trade-offs.

**[HARD STOP]**: Do NOT proceed to Phase 4 yet. Output your understanding as a bulleted summary, including evidence/citations of specific files (e.g., "Session persistence — see backend/main.py"). Wait for my confirmation before proceeding to Phase 4.

### Phase 4 — Generate the Kaggle Writeup
*(Do this ONLY after I confirm Phase 3 is correct)*
Generate a polished Kaggle writeup. Do NOT invent features. Do NOT exaggerate. 
**CRITICAL EVIDENCE REQUIREMENT:** Cite specific files or functions for major claims (e.g., "As seen in `agent.py`, the system uses...").

**CRITICAL RULE: The writeup MUST be under 2,400 words to ensure it does not exceed the strict 2,500-word limit set by Kaggle. Submissions over this limit are penalized.**

#### Writeup Structure:
1. **Introduction & Track Selection**: Introduce the project and justify the chosen track.
2. **Problem Statement**: Why startup founders struggle and why existing tools fail.
3. **Solution**: How Future Founder Twin solves this via multi-agent workflows.
4. **Architecture**: System architecture, agent pipeline, data flow. Include Mermaid diagrams. Explain why Google ADK was selected.
5. **Agent Breakdown**: Purpose, inputs, outputs, and collaboration for every implemented agent.
6. **Technical Stack**: Backend, Frontend, Google ADK, Gemini APIs.
7. **Course Concepts Applied**: Create a table mapping Kaggle course concepts to the implementation. Explicitly highlight where the code uses: Multi-agent system (ADK), MCP Server, Security features, Deployability, and Agent skills.
8. **Engineering Decisions**: Trade-offs, performance, scalability, and architecture choices.
9. **Technical Challenges & Lessons Learned**: Problems encountered and solved.
10. **Implemented Features**: Describe the actual working features (No planned features).

***

## PROMPT 2: GitHub README.md
*(Run this ONLY after the Writeup from Prompt 1 is finished and approved)*

Based on your thorough understanding of the codebase and the Writeup we just generated, please generate a complete `README.md` for the GitHub repository.

This README must satisfy the 20-point Documentation criteria from the Kaggle rubric.

Include:
- Project title and short description
- Problem and Solution overview
- Complete Setup instructions for both the Frontend and Backend
- Architecture diagrams (using Mermaid)
- Usage instructions

Make it professional, visually appealing, and grounded entirely in the actual codebase files.

***

## PROMPT 3: Video Pitch Script
*(Run this ONLY after the README is generated)*

Based on the Writeup and your understanding of the codebase, generate a script and visual outline for a 5-minute YouTube video. 

This video pitch is worth 10 points on the Kaggle rubric.

The script MUST explicitly cover:
1. **The Problem**: Describe the problem and why it's important.
2. **Why Agents?**: How agents uniquely help solve this problem.
3. **Architecture**: Explain the overall agent architecture (mentioning visual cues for the video).
4. **The Demo**: A step-by-step walkthrough of what to show on screen while the agent is working.
5. **The Build**: How it was created and the specific tools/technologies used (Google ADK, Gemini, Next.js).

Provide a two-column format: "Visuals (What to show on screen)" and "Audio (What to say)". Keep the pacing realistic for a 5-minute video.
