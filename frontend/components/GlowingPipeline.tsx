'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dna, Search, Building2, AlertTriangle, PenLine, BarChart3, Rocket, Bot,
} from 'lucide-react';
import { AgentName, PipelineStatus, AGENT_DISPLAY_NAMES, AGENT_DESCRIPTIONS } from '@/lib/types';

const ORDER: AgentName[] = [
  'FounderProfiler', 'MarketDiscovery', 'PlanningCritic', 'EvaluationSimulationAgent'
];

const AGENT_ICON: Record<AgentName, React.ReactNode> = {
  FounderProfiler:    <Dna           size={16} strokeWidth={1.8} />,
  MarketDiscovery:    <Search        size={16} strokeWidth={1.8} />,
  PlanningCritic:     <Building2     size={16} strokeWidth={1.8} />,
  EvaluationSimulationAgent:    <Rocket        size={16} strokeWidth={1.8} />,
};

interface GlowingPipelineProps {
  pipelineStatus: PipelineStatus;
  liveThought: string;
  activeAgent: AgentName | null;
  selectedAgent?: AgentName | null;
  isDone?: boolean;
  onSelectAgent?: (agent: AgentName) => void;
}

export default function GlowingPipeline({ 
  pipelineStatus, liveThought, activeAgent, selectedAgent, isDone, onSelectAgent 
}: GlowingPipelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [botStyle, setBotStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [facingRight, setFacingRight] = useState(true);
  const prevIdxRef = useRef(-1);

  // Recompute bot position whenever activeAgent or selectedAgent changes
  const targetAgent = selectedAgent || activeAgent;
  
  useEffect(() => {
    if (!targetAgent || !trackRef.current) {
      setBotStyle({ opacity: 0 });
      return;
    }
    const targetIdx = ORDER.indexOf(targetAgent);
    if (targetIdx < 0) return;

    const nodeEl = nodeRefs.current[targetIdx];
    const trackEl = trackRef.current;
    if (!nodeEl || !trackEl) return;

    const colEl = nodeEl.parentElement;
    if (!colEl) return;

    // Use unscaled DOM properties rather than getBoundingClientRect to avoid CSS scale bugs
    const center = colEl.offsetLeft + colEl.offsetWidth / 2;

    // Determine which direction the bot is running
    setFacingRight(targetIdx >= prevIdxRef.current);
    prevIdxRef.current = targetIdx;

    setBotStyle({
      opacity: 1,
      transform: `translateX(${center}px) translateX(-50%)`,
    });
  }, [targetAgent]);

  const activeIdx = targetAgent ? ORDER.indexOf(targetAgent) : -1;

  return (
    <div className="gp-wrapper">
      {/* Thought bubble — shown while any agent is active and not done */}
      {activeAgent && !isDone && (
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
          className={`gp-bot ${targetAgent ? 'gp-bot-visible' : ''}`}
          style={botStyle}
          aria-hidden="true"
        >
          <span className={`gp-bot-sprite ${facingRight ? '' : 'gp-bot-flip'}`}>
            <Bot size={22} strokeWidth={1.8} />
          </span>
          <span className="gp-bot-shadow" />
        </div>

        {ORDER.map((name, idx) => {
          const status = pipelineStatus[name];
          const isActive = name === activeAgent;
          const isSelected = name === targetAgent;
          // Wire is "lit" when both this node and the previous are done
          const wireLit = idx > 0 && pipelineStatus[ORDER[idx - 1]] === 'done' && status === 'done';

          return (
            <React.Fragment key={name}>
              {/* Connector wire */}
              {idx > 0 && (
                <div className={`gp-wire ${wireLit ? 'gp-wire-done' : ''} ${isActive ? 'gp-wire-active' : ''}`} />
              )}

              <div 
                className="gp-node-col" 
                onClick={() => { if (isDone && onSelectAgent) onSelectAgent(name); }}
                style={{ cursor: isDone ? 'pointer' : 'default' }}
              >
                <div
                  ref={el => { nodeRefs.current[idx] = el; }}
                  className={['gp-node', `gp-${status}`, isSelected ? 'gp-active' : ''].filter(Boolean).join(' ')}
                >
                  <span className="gp-icon">{AGENT_ICON[name]}</span>
                  {isSelected && <span className="gp-ring" />}
                </div>
                <span className={`gp-label ${isSelected ? 'gp-label-active' : ''}`}>
                  {AGENT_DISPLAY_NAMES[name]}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
