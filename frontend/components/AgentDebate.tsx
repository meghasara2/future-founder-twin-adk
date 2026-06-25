'use client';

interface DebateMessage {
  role: string;
  content: string;
}

interface AgentDebateProps {
  transcript: DebateMessage[];
}

export default function AgentDebate({ transcript }: AgentDebateProps) {
  if (!transcript || transcript.length === 0) return null;

  return (
    <div className="agent-debate-container">
      <div className="agent-debate-header">
        <span className="debate-icon">⚡</span>
        <span className="debate-title">Live Agent Debate</span>
        <span className="debate-subtitle">Risk Critic vs MVP Architect</span>
      </div>
      <div className="agent-debate-body">
        {transcript.map((msg, i) => (
          <div key={i} className={`debate-message ${msg.role === 'RiskCritic' ? 'debate-critic' : 'debate-architect'}`}>
            <div className="debate-avatar">
              {msg.role === 'RiskCritic' ? '⚠' : '🏗'}
            </div>
            <div className="debate-content-bubble">
              <div className="debate-role">
                {msg.role === 'RiskCritic' ? 'Risk Critic' : 'MVP Architect'}
              </div>
              <div className="debate-text">{msg.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
