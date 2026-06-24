'use client';

interface SearchSourcesProps { sources: string[]; }

export default function SearchSources({ sources }: SearchSourcesProps) {
  return (
    <div className="sources-block">
      <div className="sources-label">Sources Consulted</div>
      <div>
        {sources.map((s, i) => (
          <div key={i} className="source-item">
            <span className="source-bullet">•</span>
            <span className="source-text">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
