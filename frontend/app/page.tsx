'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateUserId, listUserSessions } from '@/lib/adk';
import ThemeToggle from '@/components/ThemeToggle';
import HistoryPanel from '@/components/HistoryPanel';

interface PriorSession { idea: string; sessionId: string; }

const STEPS = [
  { num: '①', title: 'Founder Profiler',   desc: 'Extracts your profile, skills, and constraints.' },
  { num: '②', title: 'Market Discovery',   desc: 'Searches live market data via Google.' },
  { num: '③', title: 'MVP Architect',      desc: 'Designs your buildable MVP.' },
  { num: '④', title: 'Risk Critic',        desc: 'Challenges every assumption.' },
  { num: '⑤', title: 'Refine MVP',         desc: 'Improves plan based on critic feedback.' },
  { num: '⑥', title: 'Evaluation Agent',   desc: 'Scores 4 dimensions with a rubric.' },
  { num: '⑦', title: 'Future Simulator',   desc: '3 paths + Investor Brief.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [prior, setPrior] = useState<PriorSession | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [sessionDot, setSessionDot] = useState<'idle' | 'active' | 'done'>('idle');

  useEffect(() => {
    async function checkMemory() {
      try {
        const uid = generateUserId();
        const sessions = await listUserSessions(uid);
        const last = sessions.filter(s => s.state?.idea_description).pop();
        if (last) setPrior({ idea: last.state.idea_description, sessionId: last.id });
      } catch { /* backend offline */ }
    }
    checkMemory();
  }, []);

  return (
    <div className="landing-page">
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-logo">
          <svg className="topbar-logo-icon" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L18 6.5V15.5L11 20L4 15.5V6.5L11 2Z" fill="none" stroke="#6C63FF" strokeWidth="1.5"/>
            <path d="M11 6L15.5 8.75V14.25L11 17L6.5 14.25V8.75L11 6Z" fill="#6C63FF" opacity="0.5"/>
          </svg>
          Future Founder Twin
        </div>
        <div className="topbar-spacer" />
        <a href="https://www.kaggle.com/competitions/vibecoding-agents-capstone-project" target="_blank" rel="noopener" className="topbar-link">Docs ↗</a>
        <a href="https://github.com" target="_blank" rel="noopener" className="topbar-link">GitHub ↗</a>
        <ThemeToggle />
        <span className={`session-dot ${sessionDot}`} title="Session status" />
      </header>

      {/* Memory Recall Banner */}
      {!dismissed && prior && (
        <div className="memory-banner" id="memory-recall-banner">
          <div className="memory-banner-inner">
            <span className="memory-icon">↩</span>
            <div className="memory-content">
              <span className="memory-text">
                <strong>Welcome back.</strong> Last time: <span className="memory-idea">"{prior.idea}"</span>
              </span>
              <div className="memory-actions">
                <button className="btn-mem-continue" id="continue-session" onClick={() => {
                  sessionStorage.setItem('fft_session_id', prior.sessionId);
                  router.push('/results');
                }}>Continue that analysis</button>
                <button className="btn-mem-fresh" id="start-fresh" onClick={() => setDismissed(true)}>Start fresh</button>
              </div>
            </div>
            <button className="memory-dismiss" onClick={() => setDismissed(true)}>✕</button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-inner">
          <h1 className="hero-title">Future Founder Twin</h1>
          <p className="hero-sub">
            <span className="hero-sub-line">Your AI co-founder.</span>
            <span className="hero-sub-line">Evaluate your idea in 4 minutes.</span>
          </p>
          <button
            className="btn-cta"
            id="start-analysis-btn"
            onClick={() => {
              setSessionDot('active');
              router.push('/interview');
            }}
          >
            Start Your Analysis →
          </button>
          <p className="hero-badge">
            Kaggle × Google<span className="hero-badge-sep">·</span>
            5-Day AI Agents Intensive<span className="hero-badge-sep">·</span>
            Track: Agents for Business<span className="hero-badge-sep">·</span>
            Due Jul 6
          </p>
        </div>
      </section>

      {/* Pipeline Preview */}
      <section className="pipeline-preview">
        <p className="pipeline-preview-label">How it works — 7 specialized agents</p>
        <div className="pipeline-track">
          {STEPS.map((s, i) => (
            <div key={i} className="pipeline-step">
              <div className="pipeline-step-num">{s.num}</div>
              <div className="pipeline-step-title">{s.title}</div>
              <div className="pipeline-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Analysis History */}
      <HistoryPanel />

      <footer className="landing-footer">
        <div className="footer-links">
          <a href="https://www.kaggle.com/privacy" target="_blank" rel="noopener">Privacy</a>
          <a href="https://www.kaggle.com/terms" target="_blank" rel="noopener">Terms</a>
          <a href="https://www.kaggle.com/contact" target="_blank" rel="noopener">Contact</a>
          <a href="https://www.kaggle.com/competitions" target="_blank" rel="noopener">Competitions</a>
        </div>
        <p className="footer-copyright">Built by Team Future Founder Twin for the Kaggle × Google AI Agents Intensive</p>
      </footer>
    </div>
  );
}
