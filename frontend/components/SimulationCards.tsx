'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Scale, ShieldAlert, ChevronRight } from 'lucide-react';

interface SimulationCardsProps {
  simulationText: string;
  verdict: 'PURSUE' | 'PIVOT' | 'PAUSE' | null;
}

const TABS = ['Optimistic', 'Realistic', 'Conservative'] as const;
type Tab = typeof TABS[number];

const TAB_CONFIG = {
  Optimistic: { icon: Sparkles, color: 'var(--green)', prob: '15%' },
  Realistic: { icon: Scale, color: 'var(--cyan)', prob: '60%' },
  Conservative: { icon: ShieldAlert, color: 'var(--orange)', prob: '25%' },
};

function parseContent(text: string): Record<Tab, string> {
  const get = (key: string, next?: string) => {
    const re = next
      ? new RegExp(`${key}[^:]*:[\\s\\S]*?(?=${next}|VERDICT|$)`, 'i')
      : new RegExp(`${key}[^:]*:[\\s\\S]*?(?=VERDICT|$)`, 'i');
    const m = text.match(re);
    return m ? m[0].replace(new RegExp(`^${key}[^:]*:\\s*`, 'i'), '').trim().slice(0, 600) : '';
  };
  return {
    Optimistic:   get('Optimistic',   'Realistic'),
    Realistic:    get('Realistic',    'Conservative'),
    Conservative: get('Conservative', undefined),
  };
}

const VERDICT_CONFIG = {
  PURSUE: { color: 'var(--green)', label: 'PURSUE' },
  PIVOT:  { color: 'var(--yellow)', label: 'PIVOT' },
  PAUSE:  { color: 'var(--red)', label: 'PAUSE' },
};

function parseMilestones(text: string): { month: string; event: string }[] {
  const lines = text.split('\n').filter(l => l.trim());
  const milestones: { month: string; event: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^(Month\s+\d+|M\d+)[:\s]+(.*)/i);
    if (m) milestones.push({ month: m[1], event: m[2].trim() });
  }
  return milestones.length ? milestones : [];
}

export default function SimulationCards({ simulationText, verdict }: SimulationCardsProps) {
  const [flipped, setFlipped] = useState<Record<Tab, boolean>>({ Optimistic: false, Realistic: false, Conservative: false });
  const content = parseContent(simulationText);
  const vc = verdict ? VERDICT_CONFIG[verdict] : null;

  const toggleFlip = (tab: Tab) => {
    setFlipped(prev => ({ ...prev, [tab]: !prev[tab] }));
  };

  return (
    <div className="simulation-section">
      {vc && (
        <div className="verdict-row">
          <div className="verdict-eyebrow">Verdict</div>
          <div className="verdict-word" style={{ color: vc.color }}>{vc.label}</div>
        </div>
      )}

      <div style={{ marginBottom: 24, fontSize: 11, fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>
        Select a timeline to reveal
      </div>

      <div className="sim-tarot-grid">
        {TABS.map(tab => {
          const milestones = parseMilestones(content[tab]);
          const Icon = TAB_CONFIG[tab].icon;
          const isFlipped = flipped[tab];

          return (
            <div 
              key={tab} 
              className={`tarot-card-container ${isFlipped ? 'flipped' : ''}`}
              onClick={() => toggleFlip(tab)}
            >
              <div className="tarot-card">
                {/* FRONT */}
                <div className="tarot-face tarot-front">
                  <div className="tarot-front-inner" style={{ borderColor: TAB_CONFIG[tab].color }}>
                    <div className="tarot-icon-wrapper" style={{ color: TAB_CONFIG[tab].color }}>
                      <Icon size={48} strokeWidth={1.5} />
                    </div>
                    <div className="tarot-title">{tab}</div>
                    <div className="tarot-prob">
                      <span className="tarot-prob-label">Probability</span>
                      <span className="tarot-prob-val" style={{ color: TAB_CONFIG[tab].color }}>
                        {TAB_CONFIG[tab].prob}
                      </span>
                    </div>
                    <div className="tarot-hint">
                      Click to reveal timeline <ChevronRight size={14} />
                    </div>
                  </div>
                </div>

                {/* BACK */}
                <div className="tarot-face tarot-back" style={{ borderColor: TAB_CONFIG[tab].color }}>
                  <div className="tarot-back-header" style={{ color: TAB_CONFIG[tab].color }}>
                    <Icon size={16} /> {tab} Timeline
                  </div>
                  <div className="tarot-back-content">
                    {milestones.length > 0 ? (
                      <div className="milestones small">
                        {milestones.map((m, i) => (
                          <div key={i} className="milestone">
                            <div className="milestone-dot" style={{ background: TAB_CONFIG[tab].color, boxShadow: `0 0 6px ${TAB_CONFIG[tab].color}` }} />
                            <span className="milestone-month">{m.month}:</span>
                            <span className="milestone-event">{m.event}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="sim-text markdown-body small">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {content[tab] || simulationText.slice(0, 600)}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
