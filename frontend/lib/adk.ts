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

// Extract text content from SSE event
export function getTextFromEvent(event: ADKEvent): string {
  if (!event.content?.parts) return '';
  return event.content.parts
    .filter(p => p.text)
    .map(p => p.text)
    .join('');
}

// Extract state updates from SSE event
export function getStateDeltaFromEvent(event: ADKEvent): Record<string, string> {
  return event.actions?.state_delta || {};
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

// Parse score from "EVALUATION SCORE: 72/100" line
export function parseScoreFromEvaluation(evaluationResults: string): number | null {
  const match = evaluationResults.match(/EVALUATION SCORE:\s*(\d+)\/100/);
  return match ? parseInt(match[1], 10) : null;
}

// Parse the dimension table rows into FounderFitDimension[]
export function parseFounderFitMatrix(evaluationResults: string): FounderFitDimension[] | null {
  // Look for table rows like "| Technical Fit  | 20   | rationale"
  const rows = [...evaluationResults.matchAll(/\|\s*([^|]+)\s*\|\s*(\d+)\/25\s*\|\s*([^|]+)\s*\|/g)];
  if (!rows.length) return null;
  return rows.map(row => ({
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

// Parse investor brief from simulation results (everything inside the ━ borders)
export function parseInvestorBrief(simulationResults: string): string | null {
  const match = simulationResults.match(/(━{10,}[\s\S]*?━{10,})/);
  return match ? match[1].trim() : null;
}
