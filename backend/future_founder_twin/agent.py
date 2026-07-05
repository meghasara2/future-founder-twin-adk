import os
import logging
import asyncio
from typing import AsyncGenerator

from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.models.base_llm import BaseLlm
from google.adk.models.registry import LLMRegistry
from google.adk.models.google_llm import _ResourceExhaustedError
from google.adk.models.llm_response import LlmResponse
from google.genai import types

from google.adk.tools import google_search
from .tools import save_founder_profile, calculate_founder_fit_score, generate_investor_brief
from .prompts import (
    FOUNDER_INSTRUCTION,
    DISCOVERY_INSTRUCTION,
    PLANNING_CRITIC_INSTRUCTION,
    EVALUATION_SIMULATION_INSTRUCTION,
)

# ─── API Key Rotation ─────────────────────────────────────────────────────────

def _load_api_keys() -> list[str]:
    keys = [k for k in [os.getenv(f"GOOGLE_API_KEY{suffix}") for suffix in ["", "_2", "_3"]] if k]
    if not keys:
        logging.warning("No GOOGLE_API_KEY found in environment variables.")
        keys = []
    logging.info(f"Loaded {len(keys)} API key(s) for rate limit rotation.")
    return keys

API_KEYS = _load_api_keys()
_current_key_index = 0

def _rotate_key():
    global _current_key_index
    _current_key_index = (_current_key_index + 1) % len(API_KEYS)
    new_key = API_KEYS[_current_key_index]
    os.environ["GOOGLE_API_KEY"] = new_key
    os.environ["GEMINI_API_KEY"] = new_key
    logging.warning(f"[KeyRotator] Switched to API key index {_current_key_index}.")


# ─── Rotating Fallback LLM ────────────────────────────────────────────────────

class RotatingFallbackLlm(BaseLlm):
    """
    An LLM wrapper that:
    1. Tries the primary model.
    2. On 429 RESOURCE_EXHAUSTED, rotates to the next API key and retries.
    3. Falls back to next models if it fails on all keys.
    """
    model: str = "gemini-2.5-flash-lite"
    fallback_models: list[str] = [
        "gemini-2.5-flash-lite",   # primary — still has RPM/RPD quota
        "gemini-3.1-flash-lite",   # lots of headroom (1/500 RPD used)
        "gemini-2.0-flash",        # backup
        "gemma-4-26b",             # unlimited tokens, non-search agents only
        "gemma-4-31b",             # unlimited tokens, non-search agents only
        "gemini-2.5-flash",        # last resort — near daily limit
    ]
    MAX_RETRIES: int = 1  # Try each model once before moving to next fallback

    async def generate_content_async(self, llm_request, stream: bool = False) -> AsyncGenerator:
        last_error = None

        for model_name in self.fallback_models:
            attempt_for_model = 0
            while attempt_for_model < self.MAX_RETRIES:
                try:
                    llm = LLMRegistry.new_llm(model_name)
                    llm_request.model = model_name
                    logging.info(f"[LLM] Calling {model_name}")
                    async for chunk in llm.generate_content_async(llm_request, stream):
                        yield chunk
                    return  # success
                except _ResourceExhaustedError as e:
                    attempt_for_model += 1
                    logging.warning(
                        f"[RotatingFallbackLlm] 429 on {model_name} (attempt {attempt_for_model}/{self.MAX_RETRIES})."
                    )
                    if len(API_KEYS) > 1:
                        _rotate_key()
                        wait = 10
                    else:
                        wait = 15
                    logging.warning(f"[RotatingFallbackLlm] Sleeping {wait}s for quota reset...")
                    await asyncio.sleep(wait)
                    last_error = e
                except Exception as e:
                    logging.warning(f"[RotatingFallbackLlm] model={model_name} non-429 error: {e}")
                    last_error = e
                    break  # non-quota error — try next model

        # All models exhausted
        yield LlmResponse(
            content=types.Content(
                role="model",
                parts=[types.Part(text=" [ERROR: QUOTA_EXCEEDED] Free tier quota limits reached across all configured API keys. Please wait a minute and try again.")]
            ),
            partial=False
        )


MODEL = RotatingFallbackLlm(
    model="gemini-2.5-flash-lite",
    fallback_models=[
        "gemini-2.5-flash-lite",   # primary
        "gemini-3.1-flash-lite",   # lots of headroom
        "gemini-2.0-flash",        # backup
        "gemma-4-26b",             # unlimited tokens
        "gemma-4-31b",             # unlimited tokens
        "gemini-2.5-flash",        # last resort — near daily limit
    ]
)

# Model for agents using google_search — excludes Gemma (not supported for search grounding)
MODEL_SEARCH = RotatingFallbackLlm(
    model="gemini-2.5-flash-lite",
    fallback_models=[
        "gemini-2.5-flash-lite",   # primary
        "gemini-3.1-flash-lite",   # lots of headroom
        "gemini-2.0-flash",        # backup
        "gemini-2.5-flash",        # last resort
    ]
)


# ─── Agent 1: Founder Profiler ───────────────────────────────────────────────
founder_agent = LlmAgent(
    name="FounderProfiler",
    model=MODEL,
    instruction=FOUNDER_INSTRUCTION,
    description="Extracts and saves the founder's profile from their interview answers.",
    tools=[save_founder_profile],
    output_key="founder_profile_summary",
)

# ─── Agent 2: Market Discovery ───────────────────────────────────────────────
discovery_agent = LlmAgent(
    name="MarketDiscovery",
    model=MODEL_SEARCH,
    instruction=DISCOVERY_INSTRUCTION,
    description="Researches market size, competitors, trends using Google Search.",
    tools=[google_search],
    output_key="market_analysis",
)

# ─── Agent 3: Planning & Critique ──────────────────────────────────────────────
planning_critic_agent = LlmAgent(
    name="PlanningCritic",
    model=MODEL,
    instruction=PLANNING_CRITIC_INSTRUCTION,
    description="Designs MVP and immediately critiques it, outputting plan and risks.",
    output_key="planning_critic_result",
)

# ─── Agent 4: Evaluation & Simulation ──────────────────────────────────────────
evaluation_simulation_agent = LlmAgent(
    name="EvaluationSimulationAgent",
    model=MODEL,
    instruction=EVALUATION_SIMULATION_INSTRUCTION,
    description="Scores fit, simulates futures, and generates investor brief.",
    tools=[calculate_founder_fit_score, generate_investor_brief],
    output_key="evaluation_simulation_results",
)

# ─── Phase 1: FounderProfiler → MarketDiscovery → PlanningCritic ─────────────
# Named FutureFounderTwinPhase1 so frontend can call it directly via /run_sse
FutureFounderTwinPhase1 = SequentialAgent(
    name="FutureFounderTwinPhase1",
    sub_agents=[founder_agent, discovery_agent, planning_critic_agent],
    description="Runs Phase 1: founder profiling, market research, and MVP planning.",
)

# ─── Phase 2: EvaluationSimulationAgent ───────────────────────────────────────
# Named FutureFounderTwinPhase2 so frontend can call it directly via /run_sse
FutureFounderTwinPhase2 = SequentialAgent(
    name="FutureFounderTwinPhase2",
    sub_agents=[evaluation_simulation_agent],
    description="Runs Phase 2: evaluation, future simulation, and investor brief generation.",
)

# ─── Root Agent (for ADK routing) ────────────────────────────────────────────
# ADK requires a root_agent export. We use a minimal LLM orchestrator.
# The frontend bypasses this by calling Phase1/Phase2 directly by agentName.
root_agent = LlmAgent(
    name="FutureFounderTwin",
    model=MODEL,
    instruction="Route to FutureFounderTwinPhase1 or FutureFounderTwinPhase2 as requested.",
    description="Root orchestrator for Future Founder Twin.",
    sub_agents=[FutureFounderTwinPhase1, FutureFounderTwinPhase2],
)
