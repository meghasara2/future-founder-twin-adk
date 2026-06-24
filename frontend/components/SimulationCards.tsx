'use client';
import { useState } from 'react';

interface SimulationCardsProps {
  simulationText: string;
  verdict: 'PURSUE' | 'PIVOT' | 'PAUSE' | null;
}

const TABS = ['Optimistic', 'Realistic', 'Conservative'] as const;
type Tab = typeof TABS[number];

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
  const [activeTab, setActiveTab] = useState<Tab>('Realistic');
  const content = parseContent(simulationText);
  const milestones = parseMilestones(content[activeTab]);
  const vc = verdict ? VERDICT_CONFIG[verdict] : null;

  // Extract reason text
  const verdictReason = simulationText.match(/VERDICT[^:]*:.*?[""]([^""]+)[""]/)?.[1] ||
    simulationText.match(/(?:PURSUE|PIVOT|PAUSE)[^.]*\.\s*[""]?([^""]{20,150})/)?.[1] || '';

  return (
    <div className="simulation-section">
      {vc && (
        <div className="verdict-row">
          <div className="verdict-eyebrow">Verdict</div>
          <div className="verdict-word" style={{ color: vc.color }}>{vc.label}</div>
          {verdictReason && <p className="verdict-reason">"{verdictReason}"</p>}
        </div>
      )}

      <div style={{ marginBottom: 16, fontSize: 11, fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Three Futures</div>
      <div className="sim-tabs">
        {TABS.map(tab => (
          <button key={tab} className={`sim-tab ${tab === activeTab ? 'active' : 'inactive'}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {milestones.length > 0 ? (
        <div className="milestones">
          {milestones.map((m, i) => (
            <div key={i} className="milestone">
              <div className="milestone-dot" />
              <span className="milestone-month">{m.month}:</span>
              <span className="milestone-event">{m.event}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="sim-text">{content[activeTab] || simulationText.slice(0, 600)}</p>
      )}
    </div>
  );
}
