'use client';
import { FounderFitDimension } from '@/lib/types';

function gateStyle(gate: string) {
  if (gate.includes('PROCEED TO SIMULATION')) return { color: 'var(--green)', border: 'var(--green)', dot: 'var(--green)', text: 'PROCEED TO SIMULATION' };
  if (gate.includes('PROCEED WITH CAUTION')) return { color: 'var(--yellow)', border: 'var(--yellow)', dot: 'var(--yellow)', text: 'PROCEED WITH CAUTION' };
  return { color: 'var(--red)', border: 'var(--red)', dot: 'var(--red)', text: 'SIMULATION WILL SHOW CHALLENGES' };
}

export default function FounderFitMatrix({ dimensions, gateDecision, evaluationSummary }: {
  dimensions: FounderFitDimension[];
  gateDecision?: string;
  evaluationSummary?: string;
}) {
  return (
    <div>
      {evaluationSummary && (
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>{evaluationSummary}</p>
      )}

      <div className="eval-divider" />

      {gateDecision && (() => {
        const g = gateStyle(gateDecision);
        return (
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Gate Decision</div>
            <div className="gate-badge" style={{ color: g.color, borderColor: g.border, background: 'transparent' }}>
              <span className="gate-dot" style={{ backgroundColor: g.dot }} />
              {g.text}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
