'use client';
import { AgentName, PipelineStatus, AGENT_DISPLAY_NAMES, AGENT_DESCRIPTIONS } from '@/lib/types';

const ORDER: AgentName[] = [
  'FounderProfiler', 'MarketDiscovery', 'MVPArchitect', 'RiskCritic',
  'MVPArchitectRefined', 'EvaluationAgent', 'FutureSimulator',
];

const AGENT_ICONS: Record<AgentName, string> = {
  FounderProfiler:    'person',
  MarketDiscovery:    'search',
  MVPArchitect:       'build',
  RiskCritic:         'warning',
  MVPArchitectRefined:'edit',
  EvaluationAgent:    'analytics',
  FutureSimulator:    'rocket',
};

const AGENT_EMOJI: Record<AgentName, string> = {
  FounderProfiler:    '🧬',
  MarketDiscovery:    '🔍',
  MVPArchitect:       '🏗',
  RiskCritic:         '⚠️',
  MVPArchitectRefined:'✏️',
  EvaluationAgent:    '📊',
  FutureSimulator:    '🚀',
};

interface GlowingPipelineProps {
  pipelineStatus: PipelineStatus;
  liveThought: string;
  activeAgent: AgentName | null;
}

export default function GlowingPipeline({ pipelineStatus, liveThought, activeAgent }: GlowingPipelineProps) {
  // Find the index of the active agent so we can position the thought bubble
  const activeIdx = activeAgent ? ORDER.indexOf(activeAgent) : -1;

  return (
    <div className="gp-wrapper">
      {/* Thought bubble */}
      {activeAgent && (
        <div className="gp-thought-bubble" style={{ '--active-idx': activeIdx, '--total': ORDER.length } as React.CSSProperties}>
          <div className="gp-thought-header">
            <span className="gp-thought-agent">{AGENT_DISPLAY_NAMES[activeAgent]}</span>
            <span className="gp-thought-pulse" />
          </div>
          <div className="gp-thought-body">
            {liveThought
              ? liveThought.slice(-300)   // show last 300 chars so it scrolls nicely
              : AGENT_DESCRIPTIONS[activeAgent]
            }
          </div>
          <div className="gp-thought-tail" />
        </div>
      )}

      {/* Pipeline track */}
      <div className="gp-track">
        {ORDER.map((name, idx) => {
          const status = pipelineStatus[name];
          const isActive = name === activeAgent;
          const prevDone = idx > 0 && pipelineStatus[ORDER[idx - 1]] === 'done';

          return (
            <div key={name} className="gp-node-wrap">
              {/* connector wire */}
              {idx > 0 && (
                <div className={`gp-wire ${prevDone ? 'active' : ''}`} />
              )}

              <div className="gp-node-col">
                <div className={['gp-node', `gp-${status}`, isActive ? 'gp-active' : ''].filter(Boolean).join(' ')}>
                  <span className="gp-emoji">{AGENT_EMOJI[name]}</span>
                  {isActive && <span className="gp-ring" />}
                </div>
                <span className={`gp-label ${isActive ? 'active' : ''}`}>
                  {AGENT_DISPLAY_NAMES[name]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
