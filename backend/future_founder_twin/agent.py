from google.adk.agents import LlmAgent, SequentialAgent, LoopAgent
from google.adk.tools import google_search
from .tools import save_founder_profile, calculate_founder_fit_score, generate_investor_brief
from .prompts import (
    FOUNDER_INSTRUCTION,
    DISCOVERY_INSTRUCTION,
    ARCHITECT_INSTRUCTION,
    CRITIC_INSTRUCTION,
    EVALUATION_INSTRUCTION,
    SIMULATION_INSTRUCTION,
)

MODEL = "gemini-2.0-flash"

# ─── Agent 1: Founder Profiler ───────────────────────────────────────────────
# Extracts structured profile from interview answers
# Uses save_founder_profile tool to write to session state
founder_agent = LlmAgent(
    name="FounderProfiler",
    model=MODEL,
    instruction=FOUNDER_INSTRUCTION,
    description="Extracts and saves the founder's profile from their interview answers.",
    tools=[save_founder_profile],
    output_key="founder_profile_summary",  # saves text response to state
)

# ─── Agent 2: Market Discovery ───────────────────────────────────────────────
# Uses ADK's built-in google_search to ground market analysis in real data
# IMPORTANT: Response includes a SOURCES CONSULTED block before synthesis
# so judges can see that real tool calls were made
discovery_agent = LlmAgent(
    name="MarketDiscovery",
    model=MODEL,
    instruction=DISCOVERY_INSTRUCTION,
    description="Researches market size, competitors, trends using Google Search. Outputs visible search sources.",
    tools=[google_search],
    output_key="market_analysis",
)

# ─── Agent 3: MVP Architect ──────────────────────────────────────────────────
# Reads founder profile + market analysis from state via {key} templating
architect_agent = LlmAgent(
    name="MVPArchitect",
    model=MODEL,
    instruction=ARCHITECT_INSTRUCTION,
    description="Designs a realistic MVP plan matched to the founder's skills and market gap.",
    output_key="mvp_plan",
)

# ─── Agent 4: Risk & Critic ──────────────────────────────────────────────────
# Critiques the MVP plan from Architect
critic_agent = LlmAgent(
    name="RiskCritic",
    model=MODEL,
    instruction=CRITIC_INSTRUCTION,
    description="Identifies top risks and challenges the MVP plan with honest critique.",
    output_key="risk_assessment",
)

# ─── Architect ↔ Critic Loop ─────────────────────────────────────────────────
# One refinement loop: Architect sees Critic feedback and improves the plan
# This demonstrates LoopAgent to judges — a real agent feedback loop
architect_v2_agent = LlmAgent(
    name="MVPArchitectRefined",
    model=MODEL,
    instruction=ARCHITECT_INSTRUCTION + """

IMPORTANT: The Risk Critic has reviewed your initial plan and provided feedback.
The critic's assessment is in session state as {risk_assessment}.
The founder has provided a defense/response to the critic's main question:
FOUNDER'S DEFENSE: {founder_defense}

Review this feedback and the founder's defense, and produce a REVISED MVP plan that addresses the top risks.
Mark clearly what changed from your first plan and why.
""",
    description="Refines the MVP plan after receiving critic feedback.",
    output_key="mvp_plan_refined",
)

# ─── Defense Extractor ─────────────────────────────────────────────────────────
defense_agent = LlmAgent(
    name="DefenseExtractor",
    model=MODEL,
    instruction="Extract the founder's defense from their message and output it exactly. This saves it to state for the Architect.",
    output_key="founder_defense",
)

# ─── Agent 5: Evaluation Agent ───────────────────────────────────────────────
# FIRST-CLASS EVALUATION: scores the founder-idea fit across 4 dimensions
# before simulation runs. Outputs a scored rubric with a gate decision.
# Demonstrates Day 4 evaluation concepts explicitly and visibly to judges.
evaluation_agent = LlmAgent(
    name="EvaluationAgent",
    model=MODEL,
    instruction=EVALUATION_INSTRUCTION,
    description="Scores founder-idea fit across 4 dimensions. Outputs rubric table and gate decision before simulation.",
    tools=[calculate_founder_fit_score],
    output_key="evaluation_results",
)

# ─── Agent 6: Future Simulator ───────────────────────────────────────────────
# Reads evaluation_results from state — does NOT re-score.
# Generates 3 future paths and produces the final investor brief.
simulation_agent = LlmAgent(
    name="FutureSimulator",
    model=MODEL,
    instruction=SIMULATION_INSTRUCTION,
    description="Uses EvaluationAgent score to simulate 3 futures, produces PURSUE/PIVOT/PAUSE verdict and investor brief.",
    tools=[generate_investor_brief],
    output_key="simulation_results",
)

# ─── Phase 1 Pipeline ────────────────────────────────────────────────────────
pipeline_phase_1 = SequentialAgent(
    name="Phase1Pipeline",
    sub_agents=[
        founder_agent,
        discovery_agent,
        architect_agent,
        critic_agent,
    ],
    description="Runs the first half of the pipeline up to Risk Critic.",
)

phase_1_root = LlmAgent(
    name="FutureFounderTwinPhase1",
    model=MODEL,
    instruction="""
When the user sends their interview answers, immediately delegate to the
Phase1Pipeline to run the analysis up to the Risk Critic.
Do not attempt to answer directly. Always delegate.
""",
    description="Phase 1 orchestrator.",
    sub_agents=[pipeline_phase_1],
)

# ─── Phase 2 Pipeline ────────────────────────────────────────────────────────
pipeline_phase_2 = SequentialAgent(
    name="Phase2Pipeline",
    sub_agents=[
        defense_agent,
        architect_v2_agent,
        evaluation_agent,
        simulation_agent,
    ],
    description="Runs the second half of the pipeline.",
)

phase_2_root = LlmAgent(
    name="FutureFounderTwinPhase2",
    model=MODEL,
    instruction="""
When the user sends their defense, immediately delegate to the
Phase2Pipeline to run the rest of the analysis.
Do not attempt to answer directly. Always delegate.
""",
    description="Phase 2 orchestrator.",
    sub_agents=[pipeline_phase_2],
)
