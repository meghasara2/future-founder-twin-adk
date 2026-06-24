'use client';
import { useEffect, useRef, useState } from 'react';
import { FounderFitDimension } from '@/lib/types';

function getColor(score: number) {
  if (score >= 70) return 'var(--green)';
  if (score >= 55) return 'var(--yellow)';
  return 'var(--red)';
}
function getLabel(score: number) {
  if (score >= 85) return 'Exceptional';
  if (score >= 70) return 'Solid';
  if (score >= 55) return 'Mixed';
  if (score >= 40) return 'Concerning';
  return 'Critical gaps';
}

export default function ScoreCard({ score, dimensions }: {
  score: number | null;
  dimensions?: FounderFitDimension[] | null;
}) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (score === null) return;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // Spring-like easing
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setDisplayed(Math.round(eased * score));
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  if (score === null) return null;
  const color = getColor(score);

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="eval-score-row">
        <span className="eval-score-number" style={{ color }}>{displayed}</span>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 2 }}>/ 100</div>
          <span className="eval-score-label" style={{ color }}>{getLabel(score)}</span>
        </div>
      </div>

      {dimensions && dimensions.length > 0 && (
        <>
          <div className="eval-divider" />
          <div className="eval-dim-label">Dimension Breakdown</div>
          {dimensions.map((dim, i) => {
            const pct = (dim.score / dim.maxScore) * 100;
            const barColor = pct >= 70 ? '#22C55E' : pct >= 50 ? '#EAB308' : '#EF4444';
            return (
              <div key={i} className="eval-row">
                <div className="eval-row-header">
                  <span className="eval-row-name">{dim.dimension}</span>
                  <div className="eval-bar-track">
                    <div
                      className="eval-bar-fill"
                      style={{ width: `${pct}%`, backgroundColor: barColor, transitionDelay: `${i * 100}ms` }}
                    />
                  </div>
                  <span className="eval-row-score">{dim.score}/25</span>
                </div>
                {dim.rationale && <div className="eval-rationale">{dim.rationale}</div>}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
