'use client';
import { useEffect, useRef, useState } from 'react';
import { AgentName, PipelineStatus, AGENT_DISPLAY_NAMES, AGENT_DESCRIPTIONS } from '@/lib/types';

const ORDER: AgentName[] = [
  'FounderProfiler', 'MarketDiscovery', 'MVPArchitect', 'RiskCritic',
  'MVPArchitectRefined', 'EvaluationAgent', 'FutureSimulator',
];

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
  const trackRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [botStyle, setBotStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [facingRight, setFacingRight] = useState(true);
  const prevIdxRef = useRef(-1);

  // Recompute bot position whenever activeAgent changes
  useEffect(() => {
    if (!activeAgent || !trackRef.current) {
      setBotStyle({ opacity: 0 });
      return;
    }
    const targetIdx = ORDER.indexOf(activeAgent);
    if (targetIdx < 0) return;

    const nodeEl = nodeRefs.current[targetIdx];
    const trackEl = trackRef.current;
    if (!nodeEl || !trackEl) return;

    const trackRect = trackEl.getBoundingClientRect();
    const nodeRect = nodeEl.getBoundingClientRect();
    const center = nodeRect.left + nodeRect.width / 2 - trackRect.left;

    // Determine which direction the bot is running
    setFacingRight(targetIdx >= prevIdxRef.current);
    prevIdxRef.current = targetIdx;

    setBotStyle({
      opacity: 1,
      transform: `translateX(${center}px) translateX(-50%)`,
    });
  }, [activeAgent]);

  const activeIdx = activeAgent ? ORDER.indexOf(activeAgent) : -1;

  return (
    <div className="gp-wrapper">
      {/* Thought bubble — shown while any agent is active */}
      {activeAgent && (
        <div className="gp-thought-bubble">
          <div className="gp-thought-header">
            <span className="gp-thought-agent">{AGENT_DISPLAY_NAMES[activeAgent]}</span>
            <span className="gp-thought-pulse" />
          </div>
          <div className="gp-thought-body">
            {liveThought
              ? liveThought.slice(-300)
              : AGENT_DESCRIPTIONS[activeAgent]
            }
          </div>
        </div>
      )}

      {/* Pipeline track */}
      <div className="gp-track" ref={trackRef}>
        {/* Running bot sprite — absolutely positioned, slides between nodes */}
        <div
          className={`gp-bot ${activeAgent ? 'gp-bot-visible' : ''}`}
          style={botStyle}
          aria-hidden="true"
        >
          <span className={`gp-bot-sprite ${facingRight ? '' : 'gp-bot-flip'}`}>🤖</span>
          <span className="gp-bot-shadow" />
        </div>

        {ORDER.map((name, idx) => {
          const status = pipelineStatus[name];
          const isActive = name === activeAgent;
          // Wire is "lit" when both this node and the previous are done
          const wireLit = idx > 0 && pipelineStatus[ORDER[idx - 1]] === 'done' && status === 'done';

          return (
            <div key={name} className="gp-node-wrap">
              {/* Connector wire */}
              {idx > 0 && (
                <div className={`gp-wire ${wireLit ? 'gp-wire-done' : ''} ${isActive ? 'gp-wire-active' : ''}`} />
              )}

              <div className="gp-node-col">
                <div
                  ref={el => { nodeRefs.current[idx] = el; }}
                  className={['gp-node', `gp-${status}`, isActive ? 'gp-active' : ''].filter(Boolean).join(' ')}
                >
                  <span className="gp-emoji">{AGENT_EMOJI[name]}</span>
                  {isActive && <span className="gp-ring" />}
                </div>
                <span className={`gp-label ${isActive ? 'gp-label-active' : ''}`}>
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
