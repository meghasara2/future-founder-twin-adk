// ADK session and SSE communication helpers

import type { ADKEvent, FounderFitDimension } from './types';

const ADK_BASE_URL = process.env.NEXT_PUBLIC_ADK_BACKEND_URL || 'http://localhost:8000';
const APP_NAME = 'future_founder_twin';  // matches the Python package name exactly


// Create a new ADK session for this user
export async function createSession(userId: string, sessionId: string): Promise<void> {
  const res = await fetch(
    `${ADK_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }
  );
  if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
}

// Get current session state
export async function getSessionState(userId: string, sessionId: string): Promise<Record<string, string>> {
  const res = await fetch(
    `${ADK_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}`
  );
  if (!res.ok) throw new Error(`Failed to get session: ${res.status}`);
  const data = await res.json();
  return data.state || {};
}

// List all sessions for a user (for memory recall)
export async function listUserSessions(userId: string): Promise<Array<{ id: string; state: Record<string, string> }>> {
  try {
    const res = await fetch(`${ADK_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.sessions || [];
  } catch {
    return [];
  }
}


// Run agent via /run_sse and stream events back
export async function runAgentSSE(
  userId: string,
  sessionId: string,
  message: string,
  agentName: string,
  onEvent: (event: ADKEvent) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  // ────────────── ACTUAL BACKEND CALL ──────────────
  try {
    const response = await fetch(`${ADK_BASE_URL}/run_sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        appName: APP_NAME,
        agentName: agentName,
        userId,
        sessionId,
        newMessage: {
          role: 'user',
          parts: [{ text: message }],
        },
      }),
    });

    if (!response.ok) throw new Error(`ADK request failed: ${response.status}`);
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) { onDone(); break; }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') { onDone(); return; }
          if (!dataStr) continue;
          try {
            const event = JSON.parse(dataStr);
            onEvent(event);
          } catch {
            // Non-JSON SSE line — skip silently
          }
        }
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

// Parse agent name from SSE event author field
export function getAgentFromEvent(event: ADKEvent): string | null {
  return event.author || null;
}

// Extract text content from SSE event (excludes thought/reasoning tokens from Gemini 2.5)
export function getTextFromEvent(event: ADKEvent): string {
  if (!event.content?.parts) return '';
  return event.content.parts
    .filter(p => p.text && !p.thought)
    .map(p => p.text)
    .join('');
}

// Extract state updates from SSE event
// IMPORTANT: ADK serializes Event with model_dump_json(by_alias=True) and alias_generator=to_camel
// so Python field  state_delta  →  JSON key  stateDelta
export function getStateDeltaFromEvent(event: ADKEvent): Record<string, string> {
  return (event.actions?.stateDelta as Record<string, string>) || {};
}

// Generate stable IDs for the session
export function generateUserId(): string {
  if (typeof window === 'undefined') return 'server_user';
  try {
    const stored = localStorage.getItem('fft_user_id');
    if (stored) return stored;
    const id = `user_${crypto.randomUUID()}`;
    localStorage.setItem('fft_user_id', id);
    return id;
  } catch {
    return `user_${Math.random().toString(36).slice(2)}`;
  }
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Extract bullet list from "SOURCES CONSULTED:" block in market_analysis text
export function parseSearchSources(marketAnalysis: string): string[] {
  const match = marketAnalysis.match(/SOURCES CONSULTED:([\s\S]*?)(?:\n\n|\n[A-Z])/);
  if (!match) return [];
  return match[1].trim().split('\n')
    .filter(line => line.trim().startsWith('•'))
    .map(line => line.replace(/^•\s*/, '').trim());
}

// Parse score from evaluation results — tries multiple formats
export function parseScoreFromEvaluation(evaluationResults: string): number | null {
  // Try 'EVALUATION SCORE: 72/100' format (our instructed format)
  let match = evaluationResults.match(/EVALUATION SCORE:\s*(\d+)\/100/);
  if (match) return parseInt(match[1], 10);
  // Try 'Total Score: 72/100' or 'Total: 72'
  match = evaluationResults.match(/[Tt]otal\s+[Ss]core:\s*(\d+)(?:\/100)?/);
  if (match) return parseInt(match[1], 10);
  // Try 'Score: 72/100'
  match = evaluationResults.match(/[Ss]core:\s*(\d+)\/100/);
  if (match) return parseInt(match[1], 10);
  return null;
}

// Parse the dimension table rows into FounderFitDimension[]
export function parseFounderFitMatrix(evaluationResults: string): FounderFitDimension[] | null {
  // Match table rows like "| Technical Fit | 20/25 | rationale |" or "| Technical Fit | 20 | rationale |"
  const rows = [
    ...evaluationResults.matchAll(/\|\s*([^|\n]+?)\s*\|\s*(\d+)\/25\s*\|\s*([^|\n]+?)\s*\|/g),
    ...evaluationResults.matchAll(/\|\s*(Technical Fit|Execution Fit|Market Timing|Risk.Adjusted)[^|]*\|\s*(\d+)\s*\|\s*([^|\n]+?)\s*\|/g),
  ];
  // Deduplicate by dimension name
  const seen = new Set<string>();
  const unique = rows.filter(r => {
    const key = r[1].trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!unique.length) return null;
  return unique.map(row => ({
    dimension: row[1].trim(),
    score: parseInt(row[2], 10),
    maxScore: 25,
    rationale: row[3].trim(),
  }));
}

// Parse VERDICT from simulation results
export function parseVerdict(simulationResults: string): 'PURSUE' | 'PIVOT' | 'PAUSE' | null {
  if (simulationResults.includes('VERDICT: PURSUE')) return 'PURSUE';
  if (simulationResults.includes('VERDICT: PIVOT')) return 'PIVOT';
  if (simulationResults.includes('VERDICT: PAUSE')) return 'PAUSE';
  return null;
}

// Parse investor brief from simulation results
export function parseInvestorBrief(simulationResults: string): string | null {
  // The brief has 3 ━━━ border lines: top separator, sub-header separator, and bottom.
  // Use greedy match to capture from first ━━━ to LAST ━━━ (full brief).
  const borderMatch = simulationResults.match(/(━{10,}[\s\S]*━{10,})/);
  if (borderMatch) return borderMatch[1].trim();
  // Fallback: look for INVESTOR BRIEF section header
  const idx = simulationResults.indexOf('INVESTOR BRIEF');
  if (idx !== -1) return simulationResults.slice(idx).trim();
  return null;
}
