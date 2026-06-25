// ADK session and SSE communication helpers

import type { ADKEvent, FounderFitDimension } from './types';

const ADK_BASE_URL = process.env.NEXT_PUBLIC_ADK_BACKEND_URL || 'http://localhost:8000';
const APP_NAME = 'future_founder_twin';  // matches the Python package name exactly

// 🚀 DEMO MODE: Set to true to mock all backend calls with realistic simulated data
const DEMO_MODE = true;

// Create a new ADK session for this user
export async function createSession(userId: string, sessionId: string): Promise<void> {
  if (DEMO_MODE) return;
  const res = await fetch(
    \\/apps/\/users/\/sessions/\\,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }
  );
  if (!res.ok) throw new Error(\Failed to create session: \\);
}

// Get current session state
export async function getSessionState(userId: string, sessionId: string): Promise<Record<string, string>> {
  if (DEMO_MODE) return {};
  const res = await fetch(
    \\/apps/\/users/\/sessions/\\
  );
  if (!res.ok) throw new Error(\Failed to get session: \\);
  const data = await res.json();
  return data.state || {};
}

// List all sessions for a user (for memory recall)
export async function listUserSessions(userId: string): Promise<Array<{ id: string; state: Record<string, string> }>> {
  if (DEMO_MODE) return [];
  try {
    const res = await fetch(\\/apps/\/users/\/sessions\);
    if (!res.ok) return [];
    const data = await res.json();
    return data.sessions || [];
  } catch {
    return [];
  }
}

// Helper for demo mode delays
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

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
  if (DEMO_MODE) {
    // ────────────── MOCK STREAMING LOGIC ──────────────
    try {
      if (agentName === 'FutureFounderTwinPhase1') {
        // Mock Founder Profiler
        onEvent({ author: 'FounderProfiler', content: { parts: [{ text: 'Analyzing interview data...\n' }] } });
        await sleep(1000);
        onEvent({ author: 'FounderProfiler', content: { parts: [{ text: 'Extracting skills and constraints...\n' }] } });
        await sleep(1000);
        onEvent({ actions: { state_delta: { founder_profile_summary: '**Founder Profile:**\n- **Skills:** Strong technical background.\n- **Runway:** 6 months.\n- **Goal:** B2B SaaS.' } } });
        
        // Mock Market Discovery
        onEvent({ author: 'MarketDiscovery', content: { parts: [{ text: 'Searching Google for competitors...\n' }] } });
        await sleep(1500);
        onEvent({ author: 'MarketDiscovery', content: { parts: [{ text: 'Found 3 direct competitors. Analyzing pricing...\n' }] } });
        await sleep(1500);
        onEvent({ actions: { state_delta: { market_analysis: '**Market Analysis:**\nThe market is growing at 15% YoY. \n\nSOURCES CONSULTED:\n• https://competitor.com/pricing\n• https://techcrunch.com/market-report' } } });

        // Mock MVP Architect
        onEvent({ author: 'MVPArchitect', content: { parts: [{ text: 'Drafting system architecture...\n' }] } });
        await sleep(2000);
        onEvent({ actions: { state_delta: { mvp_plan: '**MVP Plan:**\n1. Next.js frontend\n2. Supabase backend\n3. Stripe billing integration' } } });

        // Mock Risk Critic
        onEvent({ author: 'RiskCritic', content: { parts: [{ text: 'Identifying critical flaws...\n' }] } });
        await sleep(2000);
        onEvent({ actions: { state_delta: { risk_assessment: '**Critical Risks:**\n- High churn rate expected.\n- Competitors have moat in data.' } } });

        onDone();
        return;
      }

      if (agentName === 'FutureFounderTwinPhase2') {
        // Mock MVP Refined
        onEvent({ author: 'MVPArchitectRefined', content: { parts: [{ text: 'Processing founder defense...\n' }] } });
        await sleep(1500);
        onEvent({ actions: { state_delta: { mvp_plan_refined: '**Refined MVP:**\nAdded a virality loop to reduce CAC and churn.' } } });

        // Mock Evaluation Agent
        onEvent({ author: 'EvaluationAgent', content: { parts: [{ text: 'Scoring against 4 dimensions...\n' }] } });
        await sleep(1500);
        const evalText = \EVALUATION SCORE: 82/100\n\n| Dimension | Score | Rationale |\n|---|---|---|\n| Market Fit | 20/25 | High demand, growing market. |\n| Tech Fit | 22/25 | Founder has required skills. |\n| Execution | 18/25 | Ambitious timeline. |\n| Risk | 22/25 | Well mitigated by defense. |\;
        onEvent({ actions: { state_delta: { evaluation_results: evalText } } });

        // Mock Simulator
        onEvent({ author: 'FutureSimulator', content: { parts: [{ text: 'Simulating future timelines...\n' }] } });
        await sleep(2000);
        const simText = \VERDICT: PURSUE\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n# Investor Brief\n\n**The Opportunity:** A massive underserved niche.\n**The Team:** Highly capable.\n**The Verdict:** PURSUE this idea immediately.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\;
        onEvent({ actions: { state_delta: { simulation_results: simText } } });

        onDone();
        return;
      }
    } catch (e) {
      onError(e as Error);
    }
    return;
  }

  // ────────────── ACTUAL BACKEND CALL ──────────────
  try {
    const response = await fetch(\\/run_sse\, {
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

    if (!response.ok) throw new Error(\ADK request failed: \\);
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
    const id = \user_\\;
    localStorage.setItem('fft_user_id', id);
    return id;
  } catch {
    return \user_\\;
  }
}

export function generateSessionId(): string {
  return \session_\_\\;
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
