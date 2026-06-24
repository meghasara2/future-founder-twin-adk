'use client';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  ideaTitle: string;
  verdict: 'PURSUE' | 'PIVOT' | 'PAUSE' | null;
  score: number | null;
  founderSummary: string | null;
  marketAnalysis: string | null;
  mvpPlan: string | null;
  riskAssessment: string | null;
  refinedMvpPlan: string | null;
  evaluationResults: string | null;
  simulationResults: string | null;
  investorBrief: string | null;
  elapsedSeconds: number;
}

const STORAGE_KEY = 'fft_history';

export function saveToHistory(entry: HistoryEntry) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    // cap at 20 entries
    const updated = [entry, ...list].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* quota exceeded or SSR */ }
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

const VERDICT_COLOR: Record<string, string> = {
  PURSUE: 'var(--green)',
  PIVOT:  'var(--yellow)',
  PAUSE:  'var(--red)',
};

const CHAPTERS = [
  { key: 'founderSummary',    icon: '🧬', title: 'The Founder' },
  { key: 'marketAnalysis',    icon: '🔍', title: 'The Market' },
  { key: 'mvpPlan',           icon: '🏗',  title: 'The Blueprint' },
  { key: 'riskAssessment',    icon: '⚠️',  title: 'The Risks' },
  { key: 'refinedMvpPlan',    icon: '✏️',  title: 'The Refined Plan' },
  { key: 'evaluationResults', icon: '📊',  title: 'The Score' },
  { key: 'simulationResults', icon: '🚀',  title: 'The Futures' },
] as const;

function Chapter({ icon, title, text }: { icon: string; title: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="hist-chapter">
      <button className="hist-chapter-toggle" onClick={() => setOpen(o => !o)}>
        <span className="hist-ch-icon">{icon}</span>
        <span className="hist-ch-title">{title}</span>
        <span className="hist-ch-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="hist-chapter-body markdown-body">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function HistoryCard({ entry, idx }: { entry: HistoryEntry; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(entry.timestamp).toLocaleString();
  const mins = Math.floor(entry.elapsedSeconds / 60);
  const secs = entry.elapsedSeconds % 60;
  const elapsed = ${mins}m s;

  return (
    <div className="hist-card">
      <button className="hist-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="hist-card-left">
          <span className="hist-card-num">#{idx + 1}</span>
          <div>
            <div className="hist-card-idea">{entry.ideaTitle}</div>
            <div className="hist-card-meta">{date} · {elapsed}</div>
          </div>
        </div>
        <div className="hist-card-right">
          {entry.verdict && (
            <span className="hist-verdict" style={{ color: VERDICT_COLOR[entry.verdict] }}>
              {entry.verdict}
            </span>
          )}
          {entry.score != null && (
            <span className="hist-score">{entry.score}/100</span>
          )}
          <span className="hist-expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="hist-card-story">
          <p className="hist-story-intro">
            Here is the full story of this analysis — each chapter is what one of the 7 agents discovered.
          </p>
          {CHAPTERS.map(({ key, icon, title }) => {
            const text = entry[key as keyof HistoryEntry] as string | null;
            return text ? (
              <Chapter key={key} icon={icon} title={title} text={text} />
            ) : null;
          })}
          {entry.investorBrief && (
            <div className="hist-investor-brief">
              <div className="hist-brief-label">📋 Investor Brief</div>
              <pre className="hist-brief-text">{entry.investorBrief}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPanel() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="history-section">
      <div className="history-inner">
        <div className="history-heading">
          <span className="history-icon">📖</span>
          <h2 className="history-title">Your Analysis History</h2>
          <span className="history-count">{history.length} past {history.length === 1 ? 'run' : 'runs'}</span>
        </div>
        <div className="history-list">
          {history.map((entry, idx) => (
            <HistoryCard key={entry.id} entry={entry} idx={idx} />
          ))}
        </div>
        <button
          className="history-clear"
          onClick={() => { localStorage.removeItem(STORAGE_KEY); setHistory([]); }}
        >
          Clear History
        </button>
      </div>
    </section>
  );
}
