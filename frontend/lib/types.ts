// Matches what ADK agents write to session state via output_key
export interface SessionState {
  sessionId: string;
  userId: string;
  founder_profile_summary?: string;
  market_analysis?: string;
  planning_critic_result?: string;
  debate_transcript?: string;
  evaluation_simulation_results?: string;
}

// For UI rendering — parsed from agent output text
export interface ParsedResults {
  founderSummary: string | null;
  marketAnalysis: string | null;
  searchSources: string[] | null;   // extracted from SOURCES CONSULTED block
  planningCriticResult: string | null;
  debateTranscript: { role: string; content: string }[] | null;
  evaluationSimulationResults: string | null;
  founderFitMatrix: FounderFitDimension[] | null; // parsed from evaluationSimulationResults
  investorBrief: string | null;
  founderFitScore: number | null;
  verdict: 'PURSUE' | 'PIVOT' | 'PAUSE' | null;
}

// For the FounderFitMatrix visual card component
export interface FounderFitDimension {
  dimension: string;  // e.g. "Technical Fit"
  score: number;      // 0-25
  maxScore: number;   // always 25
  rationale: string;  // one sentence
}

// SSE event from ADK /run_sse — ADK serializes with by_alias=True + camelCase aliases
export interface ADKEvent {
  type: string;
  content?: {
    parts?: Array<{ text?: string; thought?: boolean; function_call?: { name: string; args: Record<string, unknown> }; function_response?: { name: string; response: unknown } }>;
    role?: string;
  };
  author?: string;         // which agent sent this
  actions?: {
    stateDelta?: Record<string, string>;   // camelCase: state_delta → stateDelta
    artifactDelta?: Record<string, unknown>;
  };
  partial?: boolean;
}

// Agent pipeline status for live UI
export type AgentName = 'FounderProfiler' | 'MarketDiscovery' | 'PlanningCritic' | 'EvaluationSimulationAgent';
export type AgentStatus = 'pending' | 'running' | 'done' | 'error';
export type PipelineStatus = Record<AgentName, AgentStatus>;

export const AGENT_DISPLAY_NAMES: Record<AgentName, string> = {
  FounderProfiler: 'Founder Profiler',
  MarketDiscovery: 'Market Intelligence',
  PlanningCritic: 'Planning & Critique',
  EvaluationSimulationAgent: 'Evaluation & Simulation',
};

export const AGENT_DESCRIPTIONS: Record<AgentName, string> = {
  FounderProfiler: 'Analyzing your background and idea...',
  MarketDiscovery: 'Searching live market data and competitors...',
  PlanningCritic: 'Designing MVP and challenging assumptions...',
  EvaluationSimulationAgent: 'Evaluating fit and simulating futures...',
};
