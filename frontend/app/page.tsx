'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateUserId, listUserSessions } from '@/lib/adk';
import Navbar from '@/components/Navbar';
import HistoryPanel from '@/components/HistoryPanel';
import GlowingPipeline from '@/components/GlowingPipeline';
import { AgentName, PipelineStatus } from '@/lib/types';
import { Network, Search, HardDrive, BarChart, Users } from 'lucide-react';

const DEMO_PIPELINE: PipelineStatus = {
  FounderProfiler: 'pending', MarketDiscovery: 'pending',
  PlanningCritic: 'pending', EvaluationSimulationAgent: 'pending',
};

interface PriorSession { idea: string; sessionId: string; }





export default function LandingPage() {
  const router = useRouter();
  const [prior, setPrior] = useState<PriorSession | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [sessionDot, setSessionDot] = useState<'idle' | 'active' | 'done'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [demoAgent, setDemoAgent] = useState<AgentName>('FounderProfiler');

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

  useEffect(() => {
    const ORDER: AgentName[] = [
      'FounderProfiler', 'MarketDiscovery', 'PlanningCritic', 'EvaluationSimulationAgent',
    ];
    const interval = setInterval(() => {
      setDemoAgent(prev => {
        const nextIdx = (ORDER.indexOf(prev) + 1) % ORDER.length;
        return ORDER[nextIdx];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="landing-page">
      <Navbar sessionStatus={sessionDot} showLinks={true} />

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
      <div className="landing-hero-viewport">
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
          <div className="pipeline-track-wrapper">
            <GlowingPipeline 
              pipelineStatus={DEMO_PIPELINE} 
              liveThought="" 
              activeAgent={demoAgent} 
              isDone={false}
            />
          </div>
        </section>
      </div>

      <div className="landing-secondary-content">

      {/* Analysis History */}
      <HistoryPanel />

      {/* Rubric Alignment */}
      <section className="rubric-section">
        <div className="rubric-container">
          <h3 className="rubric-title">🏆 Capstone Rubric Alignment</h3>
          <div className="rubric-grid">
            <div className="rubric-card">
              <div className="rubric-card-header">
                <Network className="rubric-icon" size={20} />
                <h4>Multi-Agent Orchestration</h4>
              </div>
              <p>7 distinct agents chained sequentially to perform a comprehensive evaluation.</p>
            </div>
            
            <div className="rubric-card">
              <div className="rubric-card-header">
                <Search className="rubric-icon" size={20} />
                <h4>Tool Usage</h4>
              </div>
              <p>Market Discovery agent utilizes <code>google_search</code> to gather real-world competitor data.</p>
            </div>

            <div className="rubric-card">
              <div className="rubric-card-header">
                <HardDrive className="rubric-icon" size={20} />
                <h4>Memory & State</h4>
              </div>
              <p>Managed via ADK <code>InMemorySessionService</code>, persisting state across the pipeline. UI saves session history to <code>localStorage</code>.</p>
            </div>

            <div className="rubric-card">
              <div className="rubric-card-header">
                <BarChart className="rubric-icon" size={20} />
                <h4>Evaluation</h4>
              </div>
              <p>Quantitative scoring (Founder Fit Matrix) is embedded directly into the Evaluation Agent.</p>
            </div>

            <div className="rubric-card">
              <div className="rubric-card-header">
                <Users className="rubric-icon" size={20} />
                <h4>Human-in-the-Loop</h4>
              </div>
              <p>The pipeline purposefully pauses at Phase 1, requiring the founder to actively defend against the Risk Critic before Phase 2 generates the final verdict.</p>
            </div>
          </div>
        </div>
      </section>

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
    </div>
  );
}
