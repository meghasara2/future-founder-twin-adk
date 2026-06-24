'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import GlowingPipeline from '@/components/GlowingPipeline';
import ScoreCard from '@/components/ScoreCard';
import FounderFitMatrix from '@/components/FounderFitMatrix';
import SearchSources from '@/components/SearchSources';
import SimulationCards from '@/components/SimulationCards';
import InvestorBrief from '@/components/InvestorBrief';
import ThemeToggle from '@/components/ThemeToggle';
import { saveToHistory } from '@/components/HistoryPanel';
import {
  runAgentSSE, getAgentFromEvent, getStateDeltaFromEvent, getTextFromEvent,
  parseSearchSources, parseScoreFromEvaluation, parseFounderFitMatrix,
  parseVerdict, parseInvestorBrief,
} from '@/lib/adk';
import { AgentName, AgentStatus, ParsedResults, PipelineStatus } from '@/lib/types';

const DEFAULT_PIPELINE: PipelineStatus = {
  FounderProfiler: 'pending', MarketDiscovery: 'pending', MVPArchitect: 'pending',
  RiskCritic: 'pending', MVPArchitectRefined: 'pending', EvaluationAgent: 'pending', FutureSimulator: 'pending',
};

const AGENT_KEYS: Record<string, AgentName> = {
  FounderProfiler: 'FounderProfiler', MarketDiscovery: 'MarketDiscovery',
  MVPArchitect: 'MVPArchitect', RiskCritic: 'RiskCritic',
  MVPArchitectRefined: 'MVPArchitectRefined', EvaluationAgent: 'EvaluationAgent',
  FutureSimulator: 'FutureSimulator',
};

function ResultCard({ icon, title, badge, children, id }: {
  icon: string; title: string; badge: string; children: React.ReactNode; id?: string;
}) {
  return (
    <div className="result-card" id={id}>
      <div className="result-card-header">
        <span className="rc-icon">{icon}</span>
        <span className="rc-title">{title}</span>
        <span className="rc-badge">{badge}</span>
      </div>
      <div className="result-card-body">{children}</div>
    </div>
  );
}

function SkeletonCard({ icon, title, badge }: { icon: string; title: string; badge: string }) {
  return (
    <div className="result-card">
      <div className="result-card-header">
        <span className="rc-icon">{icon}</span>
        <span className="rc-title">{title}</span>
        <span className="rc-badge">{badge}</span>
      </div>
      <div className="result-card-body">
        <div className="skeleton">
          <div className="skeleton-line sl-1" />
          <div className="skeleton-line sl-3" />
          <div className="skeleton-line sl-2" />
          <div className="skeleton-line sl-4" />
        </div>
      </div>
    </div>
  );
}

function ResultText({ text }: { text: string }) {
  return (
    <div className="result-text markdown-body">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [pipeline, setPipeline] = useState<PipelineStatus>(DEFAULT_PIPELINE);
  const [phase, setPhase] = useState<'phase1' | 'awaiting_defense' | 'phase2' | 'done'>('phase1');
  const [defenseText, setDefenseText] = useState('');
  const [results, setResults] = useState<ParsedResults>({
    founderSummary: null, marketAnalysis: null, searchSources: null, mvpPlan: null,
    riskAssessment: null, refinedMvpPlan: null, evaluationResults: null, founderFitMatrix: null,
    simulationResults: null, investorBrief: null, founderFitScore: null, verdict: null,
  });
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [liveThought, setLiveThought] = useState('');
  const [activeAgent, setActiveAgent] = useState<AgentName | null>(null);
  const startedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setStatus = (name: AgentName, status: AgentStatus) =>
    setPipeline(prev => ({ ...prev, [name]: status }));

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!isDone) return;
    if (timerRef.current) clearInterval(timerRef.current);
    // Save full analysis to localStorage history
    const msg = sessionStorage.getItem('fft_message') || '';
    // Extract idea title: first line or first 80 chars of the message
    const ideaTitle = msg.split('\n').find(l => l.trim()) || msg.slice(0, 80) || 'Untitled Analysis';
    saveToHistory({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      ideaTitle: ideaTitle.slice(0, 120),
      verdict: results.verdict,
      score: results.founderFitScore,
      founderSummary: results.founderSummary,
      marketAnalysis: results.marketAnalysis,
      mvpPlan: results.mvpPlan,
      riskAssessment: results.riskAssessment,
      refinedMvpPlan: results.refinedMvpPlan,
      evaluationResults: results.evaluationResults,
      simulationResults: results.simulationResults,
      investorBrief: results.investorBrief,
      elapsedSeconds: elapsed,
    });
  }, [isDone]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const uid = sessionStorage.getItem('fft_user_id');
    const sid = sessionStorage.getItem('fft_session_id');
    const msg = sessionStorage.getItem('fft_message');
    if (!uid || !sid || !msg) {
      setError('No session found. Please complete the interview first.');
      setIsConnecting(false);
      return;
    }
    setIsConnecting(false);
    runAgentSSE(uid, sid, msg, 'FutureFounderTwinPhase1',
      (event) => {
        const agent = getAgentFromEvent(event);
        if (agent && AGENT_KEYS[agent]) {
          if (agent !== activeAgent) { setLiveThought(''); setActiveAgent(AGENT_KEYS[agent]); }
          setStatus(AGENT_KEYS[agent], 'running');
        }
        // Stream live thought text
        const chunk = getTextFromEvent(event);
        if (chunk) setLiveThought(prev => (prev + chunk).slice(-600));
        const d = getStateDeltaFromEvent(event);
        if (d.founder_profile_summary) { setResults(p => ({ ...p, founderSummary: d.founder_profile_summary })); setStatus('FounderProfiler', 'done'); }
        if (d.market_analysis) {
          const sources = parseSearchSources(d.market_analysis);
          setResults(p => ({ ...p, marketAnalysis: d.market_analysis, searchSources: sources.length ? sources : p.searchSources }));
          setStatus('MarketDiscovery', 'done');
        }
        if (d.mvp_plan) { setResults(p => ({ ...p, mvpPlan: d.mvp_plan })); setStatus('MVPArchitect', 'done'); }
        if (d.risk_assessment) { setResults(p => ({ ...p, riskAssessment: d.risk_assessment })); setStatus('RiskCritic', 'done'); }
      },
      () => { setActiveAgent(null); setLiveThought(''); setPhase('awaiting_defense'); },
      (err) => {
        setError(`Stream error: ${err.message}`);
        setPipeline(prev => {
          const u = { ...prev };
          (Object.keys(u) as AgentName[]).forEach(k => { if (u[k] === 'running') u[k] = 'error'; });
          return u;
        });
      }
    );
  }, []);

  const submitDefense = () => {
    if (!defenseText.trim()) return;
    setPhase('phase2');
    const uid = sessionStorage.getItem('fft_user_id')!;
    const sid = sessionStorage.getItem('fft_session_id')!;
    
    runAgentSSE(uid, sid, defenseText, 'FutureFounderTwinPhase2',
      (event) => {
        const agent = getAgentFromEvent(event);
        if (agent && AGENT_KEYS[agent]) {
          if (agent !== activeAgent) { setLiveThought(''); setActiveAgent(AGENT_KEYS[agent]); }
          setStatus(AGENT_KEYS[agent], 'running');
        }
        const chunk = getTextFromEvent(event);
        if (chunk) setLiveThought(prev => (prev + chunk).slice(-600));
        const d = getStateDeltaFromEvent(event);
        if (d.mvp_plan_refined) { setResults(p => ({ ...p, refinedMvpPlan: d.mvp_plan_refined })); setStatus('MVPArchitectRefined', 'done'); }
        if (d.evaluation_results) {
          setResults(p => ({ ...p, evaluationResults: d.evaluation_results, founderFitMatrix: parseFounderFitMatrix(d.evaluation_results), founderFitScore: parseScoreFromEvaluation(d.evaluation_results) }));
          setStatus('EvaluationAgent', 'done');
        }
        if (d.simulation_results) {
          setResults(p => ({ ...p, simulationResults: d.simulation_results, verdict: parseVerdict(d.simulation_results), investorBrief: parseInvestorBrief(d.simulation_results) }));
          setStatus('FutureSimulator', 'done');
        }
      },
      () => { setActiveAgent(null); setLiveThought(''); setPhase('done'); setIsDone(true); },
      (err) => setError(`Phase 2 Error: ${err.message}`)
    );
  };

  const exportPDF = async () => {
    const element = document.querySelector('.results-main');
    if (!element) return;
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin:       10,
      filename:     'Future_Founder_Twin_Analysis.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const formatElapsed = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const doneCount = Object.values(pipeline).filter(s => s === 'done').length;

  if (isConnecting) {
    return (
      <div className="results-page">
        <header className="topbar">
          <div className="topbar-logo">
            <svg className="topbar-logo-icon" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L18 6.5V15.5L11 20L4 15.5V6.5L11 2Z" fill="none" stroke="#6C63FF" strokeWidth="1.5"/>
              <path d="M11 6L15.5 8.75V14.25L11 17L6.5 14.25V8.75L11 6Z" fill="#6C63FF" opacity="0.5"/>
            </svg>
            Future Founder Twin
          </div>
        </header>
        <div className="full-screen-state">
          <div className="loading-spinner" />
          <p className="state-sub">Connecting to AI pipeline...</p>
        </div>
      </div>
    );
  }

  if (error && !results.founderSummary) {
    return (
      <div className="results-page">
        <header className="topbar">
          <div className="topbar-logo">
            <svg className="topbar-logo-icon" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L18 6.5V15.5L11 20L4 15.5V6.5L11 2Z" fill="none" stroke="#6C63FF" strokeWidth="1.5"/>
              <path d="M11 6L15.5 8.75V14.25L11 17L6.5 14.25V8.75L11 6Z" fill="#6C63FF" opacity="0.5"/>
            </svg>
            Future Founder Twin
          </div>
        </header>
        <div className="full-screen-state">
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h2 className="state-title">Backend Unavailable</h2>
          <p className="state-sub">{error}</p>
          <div className="error-instructions">
            <p>Start the backend first:</p>
            <pre>{`cd backend\n.venv\\Scripts\\activate\npython main.py`}</pre>
          </div>
          <button onClick={() => router.push('/interview')} className="btn-retry">← Back to Interview</button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    const verdict = results.verdict || 'PENDING';
    const score = results.founderFitScore || '?';
    const text = `I just evaluated my startup idea with Future Founder Twin and got a ${verdict} verdict with an ${score}/100 score! 🚀\n\nTry yours at: https://future-founder-twin.example.com`;
    navigator.clipboard.writeText(text);
    alert('Share snippet copied to clipboard!');
  };

  return (
    <div className="results-page">
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <svg className="topbar-logo-icon" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L18 6.5V15.5L11 20L4 15.5V6.5L11 2Z" fill="none" stroke="#6C63FF" strokeWidth="1.5"/>
            <path d="M11 6L15.5 8.75V14.25L11 17L6.5 14.25V8.75L11 6Z" fill="#6C63FF" opacity="0.5"/>
          </svg>
          Future Founder Twin
        </div>
        <div className="topbar-spacer" />
        {isDone && (
          <button className="btn-copy-brief" onClick={handleShare} style={{ marginRight: 16 }}>
            ✨ Share Verdict
          </button>
        )}
        <ThemeToggle />
        <span className={`session-dot ${isDone ? 'done' : 'active'}`} />
      </header>

      {/* Glowing Pipeline Bar */}
      <div className="gp-bar">
        <GlowingPipeline
          pipelineStatus={pipeline}
          liveThought={liveThought}
          activeAgent={activeAgent}
        />
        <div className="gp-bar-footer">
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{doneCount}/7 agents · {formatElapsed(elapsed)}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {isDone && results.investorBrief && (
              <>
                <button className="btn-copy-brief" id="sidebar-copy-brief" onClick={() => navigator.clipboard.writeText(results.investorBrief!)}>📋 Copy Brief</button>
                <button className="btn-copy-brief" onClick={exportPDF}>📄 Export PDF</button>
              </>
            )}
            <button className="btn-new-analysis" id="start-new-analysis" onClick={() => router.push('/interview')}>+ New</button>
          </div>
        </div>
      </div>

      <div className="results-layout">
        {/* Main — now full width */}
        <div className="results-main" style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
          {phase === 'awaiting_defense' && (
            <div className="defense-banner" style={{ marginBottom: 24, padding: 24, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-surface)' }}>
              <h3 style={{ color: 'var(--red)', marginBottom: 8 }}>CRITICAL QUESTION FROM RISK CRITIC</h3>
              <p style={{ color: 'var(--text-1)', marginBottom: 16 }}>
                {results.riskAssessment?.split('CRITICAL QUESTION:')[1]?.trim() || "Why should an investor believe you can pull this off?"}
              </p>
              <textarea 
                style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }}
                placeholder="Type your defense here..."
                value={defenseText}
                onChange={e => setDefenseText(e.target.value)}
              />
              <button 
                onClick={submitDefense}
                style={{ marginTop: 12, padding: '10px 20px', background: 'var(--primary)', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}
              >
                Submit Defense & Continue
              </button>
            </div>
          )}

          {isDone && (
            <div className="done-banner">
              <div className="done-check">✓</div>
              <div>
                <p className="done-title">Analysis Complete — all 7 agents finished</p>
                <p className="done-sub">Your investor brief is ready to copy.</p>
              </div>
            </div>
          )}

          {error && results.founderSummary && (
            <div className="inline-error">⚠ {error}</div>
          )}

          {/* Sections */}
          {results.founderSummary ? (
            <ResultCard icon="👤" title="Founder Profile" badge="FounderProfiler" id="sec-founder">
              <ResultText text={results.founderSummary} />
            </ResultCard>
          ) : pipeline.FounderProfiler === 'running' && (
            <SkeletonCard icon="👤" title="Founder Profile" badge="FounderProfiler" />
          )}

          {results.marketAnalysis ? (
            <ResultCard icon="🔍" title="Market Analysis" badge="MarketDiscovery" id="sec-market">
              {results.searchSources && results.searchSources.length > 0 && (
                <SearchSources sources={results.searchSources} />
              )}
              <ResultText text={results.marketAnalysis} />
            </ResultCard>
          ) : pipeline.MarketDiscovery === 'running' && (
            <SkeletonCard icon="🔍" title="Market Analysis" badge="MarketDiscovery" />
          )}

          {results.mvpPlan ? (
            <ResultCard icon="🏗" title="MVP Plan" badge="MVPArchitect" id="sec-mvp">
              <ResultText text={results.mvpPlan} />
            </ResultCard>
          ) : pipeline.MVPArchitect === 'running' && (
            <SkeletonCard icon="🏗" title="MVP Plan" badge="MVPArchitect" />
          )}

          {results.riskAssessment ? (
            <ResultCard icon="⚠" title="Risk Assessment" badge="RiskCritic" id="sec-risk">
              <ResultText text={results.riskAssessment} />
            </ResultCard>
          ) : pipeline.RiskCritic === 'running' && (
            <SkeletonCard icon="⚠" title="Risk Assessment" badge="RiskCritic" />
          )}

          {results.refinedMvpPlan ? (
            <ResultCard icon="🔄" title="MVP Plan (Revised)" badge="MVPArchitectRefined" id="sec-refined">
              <ResultText text={results.refinedMvpPlan} />
            </ResultCard>
          ) : pipeline.MVPArchitectRefined === 'running' && (
            <SkeletonCard icon="🔄" title="MVP Plan (Revised)" badge="MVPArchitectRefined" />
          )}

          {results.evaluationResults ? (
            <ResultCard icon="◈" title="Evaluation" badge="EvaluationAgent" id="sec-eval">
              <ScoreCard score={results.founderFitScore} dimensions={results.founderFitMatrix} />
              {results.founderFitMatrix && results.founderFitMatrix.length > 0 && (
                <FounderFitMatrix
                  dimensions={results.founderFitMatrix}
                  gateDecision={results.evaluationResults.includes('GATE DECISION:')
                    ? results.evaluationResults.split('GATE DECISION:')[1]?.split('\n')[0]?.trim()
                    : undefined}
                  evaluationSummary={results.evaluationResults.includes('EVALUATION SUMMARY:')
                    ? results.evaluationResults.split('EVALUATION SUMMARY:')[1]?.split('GATE')[0]?.trim()
                    : undefined}
                />
              )}
            </ResultCard>
          ) : pipeline.EvaluationAgent === 'running' && (
            <SkeletonCard icon="◈" title="Evaluation" badge="EvaluationAgent" />
          )}

          {results.simulationResults ? (
            <ResultCard icon="⏩" title="Future Simulation" badge="FutureSimulator" id="sec-sim">
              <SimulationCards simulationText={results.simulationResults} verdict={results.verdict} />
            </ResultCard>
          ) : pipeline.FutureSimulator === 'running' && (
            <SkeletonCard icon="⏩" title="Future Simulation" badge="FutureSimulator" />
          )}

          {results.investorBrief && (
            <ResultCard icon="📋" title="Investor Brief" badge="FutureSimulator" id="sec-brief">
              <InvestorBrief brief={results.investorBrief} />
            </ResultCard>
          )}
        </div>
      </div>
    </div>
  );
}
