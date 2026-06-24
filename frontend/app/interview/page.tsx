'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSession, generateUserId, generateSessionId } from '@/lib/adk';
import ThemeToggle from '@/components/ThemeToggle';

const QUESTIONS = [
  {
    label: "What's your technical background?",
    text: "What's your technical background? Tell me your skills, languages, years of experience, and what you've built before.",
    placeholder: "e.g. Full-stack developer, 3 years Python/React, built 2 side projects",
  },
  {
    label: "Describe your startup idea.",
    text: "Describe your startup idea. What problem does it solve and who is it for?",
    placeholder: "e.g. A tool that helps indie hackers validate SaaS ideas before building...",
  },
  {
    label: "Have you shipped before?",
    text: "Have you shipped a product before? If yes, describe it. If no, what's the closest thing you've done?",
    placeholder: "e.g. Yes — launched a Chrome extension with 200 users in 2024",
  },
  {
    label: "What's your runway?",
    text: "What's your runway? How many months can you dedicate, and do you have a budget?",
    placeholder: "e.g. 6 months, part-time. No budget but can self-fund $500/month",
  },
  {
    label: "What's your biggest fear?",
    text: "What's your biggest fear about pursuing this idea?",
    placeholder: "e.g. That the market is too crowded and no one will pay for it",
  },
];

const DEMO_PRESETS = [
  {
    label: '🐶 Uber for Dogs',
    answers: [
      'Self-taught developer, 2 years React Native, built a weather app.',
      'An app where people can request an on-demand dog walker to their location within 15 minutes, like Uber but for dogs.',
      'No, I have never shipped a commercial product before.',
      '3 months full-time, $2000 total budget.',
      'Liability if a dog gets lost or injured, and getting enough supply of walkers.'
    ]
  },
  {
    label: '🤖 AI Video SaaS',
    answers: [
      'Senior ML Engineer, 7 years experience. Built video generation pipelines at a FAANG company.',
      'A B2B SaaS API that lets e-commerce sites generate product videos from a single photo using a finetuned diffusion model.',
      'Yes, I launched an internal tool for 500 marketers at my last job.',
      '12 months runway, backed by $100k angel investment.',
      'High inference costs and OpenAI or Google releasing a model that makes this obsolete.'
    ]
  },
  {
    label: '🛹 Hoverboard Hardware',
    answers: [
      'Marketing major, no technical background. Good at sales.',
      'A real hovering skateboard that uses magnetic levitation over special skatepark surfaces.',
      'I ran a successful Kickstarter for a t-shirt brand once.',
      'Zero budget, I need to raise money first. Working nights and weekends.',
      'I have no idea how to build the actual hardware or if the physics even work.'
    ]
  }
];

const MIN_CHARS = 20;

export default function InterviewPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''));
  const [current, setCurrent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, [currentQ]);

  const canProceed = current.trim().length >= MIN_CHARS;
  const isLast = currentQ === QUESTIONS.length - 1;
  const progress = ((currentQ + (canProceed ? 0.5 : 0)) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (!canProceed) return;
    const next = [...answers];
    next[currentQ] = current;
    setAnswers(next);
    setCurrent('');
    setCurrentQ(q => q + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleNext();
  };

  const handleAnalyze = async (presetAnswers?: string[]) => {
    const final = presetAnswers || [...answers];
    if (!presetAnswers) final[currentQ] = current;
    
    setSubmitting(true);
    setError(null);
    try {
      const userId = generateUserId();
      const sessionId = generateSessionId();
      await createSession(userId, sessionId);
      const msg = `Here are my interview answers:\n\nQ1 - Technical background: ${final[0]}\nQ2 - My idea: ${final[1]}\nQ3 - Shipped before: ${final[2]}\nQ4 - Runway: ${final[3]}\nQ5 - Biggest fear: ${final[4]}\n\nPlease analyze my startup idea using the full pipeline.`;
      sessionStorage.setItem('fft_user_id', userId);
      sessionStorage.setItem('fft_session_id', sessionId);
      sessionStorage.setItem('fft_message', msg);
      router.push('/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to backend. Is it running on port 8000?');
      setSubmitting(false);
    }
  };

  function charCountClass() {
    if (current.length < MIN_CHARS) return 'low';
    if (current.length > 500) return 'hi';
    return 'ok';
  }
  function charCountText() {
    if (current.length < MIN_CHARS) return `${current.length}/${MIN_CHARS}`;
    if (current.length > 500) return `${current.length} — nice detail`;
    return `${current.length}/${MIN_CHARS} ✓`;
  }

  return (
    <div className="interview-page">
      {/* Topbar */}
      <header className="topbar">
        <button onClick={() => router.push('/')} className="topbar-logo" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg className="topbar-logo-icon" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L18 6.5V15.5L11 20L4 15.5V6.5L11 2Z" fill="none" stroke="#6C63FF" strokeWidth="1.5"/>
            <path d="M11 6L15.5 8.75V14.25L11 17L6.5 14.25V8.75L11 6Z" fill="#6C63FF" opacity="0.5"/>
          </svg>
          Future Founder Twin
        </button>
        <div className="topbar-spacer" />
        <ThemeToggle />
        <span className="session-dot active" title="Interview in progress" />
      </header>

      <div className="interview-body">
        {/* Demo Presets Row */}
        {currentQ === 0 && current === '' && (
          <div className="demo-presets-card">
            <h3 style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12, fontFamily: 'var(--font-m)' }}>
              Kaggle Judges: Quick Test Presets
            </h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {DEMO_PRESETS.map((p, i) => (
                <button
                  key={i}
                  className="btn-preset"
                  onClick={() => handleAnalyze(p.answers)}
                  disabled={submitting}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="progress-bar-wrapper">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-step-label">Step {currentQ + 1} of {QUESTIONS.length}</span>
        </div>

        {/* Completed answers */}
        {currentQ > 0 && (
          <div className="completed-answers">
            {answers.slice(0, currentQ).map((ans, i) =>
              ans ? (
                <div key={i} className="completed-qa">
                  <div className="cqa-q">Q{i + 1} — {QUESTIONS[i].label}</div>
                  <div className="cqa-a">{ans}</div>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Current question */}
        <div className="question-card">
          <div className="q-number">Q{currentQ + 1}</div>
          <h2 className="q-text">{QUESTIONS[currentQ].text}</h2>

          <textarea
            ref={textareaRef}
            id={`answer-q${currentQ + 1}`}
            className="answer-textarea"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={QUESTIONS[currentQ].placeholder}
            rows={4}
            disabled={submitting}
          />
          <div className="answer-footer">
            <span className={`char-count ${charCountClass()}`}>{charCountText()}</span>
            <span className="kbd-hint">Ctrl+Enter to continue</span>
          </div>

          {error && (
            <div className="error-bar">
              <span>⚠ {error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          <div className="q-actions">
            {!isLast ? (
              <>
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="btn-next"
                  id={`next-q${currentQ + 1}`}
                >
                  Next →
                </button>
                <span className="kbd-hint">Ctrl+Enter to continue</span>
              </>
            ) : (
              <div style={{ width: '100%' }}>
                <button
                  onClick={() => handleAnalyze()}
                  disabled={!canProceed || submitting}
                  className="btn-analyze"
                  id="analyze-my-idea"
                >
                  {submitting ? (
                    <><span className="btn-spinner" /> Starting analysis...</>
                  ) : 'Analyze My Idea →'}
                </button>
                {!submitting && (
                  <p className="analyze-subtext">
                    Your idea will be analyzed by 7 specialized AI agents
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
