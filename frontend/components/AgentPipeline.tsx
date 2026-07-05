'use client';
import { AgentName, PipelineStatus, AGENT_DISPLAY_NAMES, AGENT_DESCRIPTIONS } from '@/lib/types';

const ORDER: AgentName[] = [
  'FounderProfiler', 'MarketDiscovery', 'PlanningCritic', 'EvaluationSimulationAgent',
];

export default function AgentPipeline({ pipelineStatus }: { pipelineStatus: PipelineStatus }) {
  return (
    <div className="agent-list">
      {ORDER.map(name => {
        const status = pipelineStatus[name];
        return (
          <div key={name} className={`agent-row ${status}`}>
            <div className="agent-status-icon">
              {status === 'pending' && <span className="icon-pending">○</span>}
              {status === 'running' && <span className="running-dot" />}
              {status === 'done'    && <span className="icon-done">✓</span>}
              {status === 'error'   && <span className="icon-error">✗</span>}
            </div>
            <span className="agent-name">{AGENT_DISPLAY_NAMES[name]}</span>
            <span className="agent-timing">
              {status === 'running' ? 'running' : status === 'done' ? '✓' : status === 'error' ? 'error' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
