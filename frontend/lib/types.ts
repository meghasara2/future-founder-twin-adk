// Matches what ADK agents write to session state via output_key
export interface SessionState {
  sessionId: string;
  userId: string;
  founder_profile_summary?: string;
  market_analysis?: string;
  mvp_plan?: string;
  risk_assessment?: string;
  debate_transcript?: string;
  mvp_plan_refined?: string;
  evaluation_results?: string;   // EvaluationAgent output (score rubric + gate)
  simulation_results?: string;
}

// For UI rendering — parsed from agent output text
export interface ParsedResults {
  founderSummary: string | null;
  marketAnalysis: string | null;
  searchSources: string[] | null;   // extracted from SOURCES CONSULTED block
  mvpPlan: string | null;
  riskAssessment: string | null;
  debateTranscript: { role: string; content: string }[] | null;
  refinedMvpPlan: string | null;
  evaluationResults: string | null; // EvaluationAgent score rubric
  founderFitMatrix: FounderFitDimension[] | null; // parsed from evaluationResults
  simulationResults: string | null;
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

// SSE event from ADK /run_sse
export interface ADKEvent {
  type: string;
  content?: {
    parts?: Array<{ text?: string; function_call?: { name: string; args: Record<string, unknown> }; function_response?: { name: string; response: unknown } }>;
    role?: string;
  };
  author?: string;         // which agent sent this
  actions?: {
    state_delta?: Record<string, string>;
  };
  partial?: boolean;
}

// Agent pipeline status for live UI
export type AgentName = 'FounderProfiler' | 'MarketDiscovery' | 'MVPArchitect' | 'RiskCritic' | 'MVPArchitectRefined' | 'EvaluationAgent' | 'FutureSimulator';
export type AgentStatus = 'pending' | 'running' | 'done' | 'error';
export type PipelineStatus = Record<AgentName, AgentStatus>;

export const AGENT_DISPLAY_NAMES: Record<AgentName, string> = {
  FounderProfiler: 'Founder Profiler',
  MarketDiscovery: 'Market Discovery',
  MVPArchitect: 'MVP Architect',
  RiskCritic: 'Risk & Critic',
  MVPArchitectRefined: 'Refined MVP Plan',
  EvaluationAgent: 'Evaluation',
  FutureSimulator: 'Future Simulator',
};

export const AGENT_DESCRIPTIONS: Record<AgentName, string> = {
  FounderProfiler: 'Analyzing your background and idea...',
  MarketDiscovery: 'Searching live market data and competitors...',
  MVPArchitect: 'Designing your MVP plan...',
  RiskCritic: 'Identifying risks and challenging assumptions...',
  MVPArchitectRefined: 'Refining plan based on critic feedback...',
  EvaluationAgent: 'Scoring founder-idea fit across 4 dimensions...',
  FutureSimulator: 'Simulating your futures and generating investor brief...',
};
