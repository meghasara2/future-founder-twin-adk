'use client';
import { useEffect, useRef, useState } from 'react';
import { Terminal, Maximize2, Minimize2, X } from 'lucide-react';
import { AgentName, AGENT_DISPLAY_NAMES } from '@/lib/types';

export interface ConsoleLog {
  id: string;
  timestamp: number;
  agent: AgentName | 'System';
  type: 'info' | 'tool_call' | 'tool_result' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface AgentConsoleProps {
  logs: ConsoleLog[];
  isDone: boolean;
}

export default function AgentConsole({ logs, isDone }: AgentConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isExpanded]);

  if (!isVisible && logs.length === 0) return null;

  return (
    <div className={`agent-console ${isExpanded ? 'expanded' : 'collapsed'} ${!isVisible ? 'hidden' : ''}`}>
      <div className="ac-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ac-header-left">
          <Terminal size={14} />
          <span>Agent Execution Terminal</span>
          {!isDone && <span className="ac-pulse" />}
        </div>
        <div className="ac-header-actions">
          <button className="ac-btn" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          {isDone && (
            <button className="ac-btn" onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="ac-body" ref={scrollRef}>
          {logs.map(log => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit', fractionalSecondDigits: 2 });
            return (
              <div key={log.id} className={`ac-log-row ac-${log.type}`}>
                <span className="ac-time">[{timeStr}]</span>
                <span className="ac-agent">[{log.agent === 'System' ? 'System' : AGENT_DISPLAY_NAMES[log.agent]}]</span>
                <span className="ac-msg">
                  {log.type === 'tool_call' ? (
                    <span className="ac-code">❯ {log.message}</span>
                  ) : log.type === 'tool_result' ? (
                    <span className="ac-result">  ↳ {log.message}</span>
                  ) : (
                    log.message
                  )}
                </span>
                {log.details && <div className="ac-details">{log.details}</div>}
              </div>
            );
          })}
          {!isDone && (
            <div className="ac-log-row">
              <span className="ac-cursor">_</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
