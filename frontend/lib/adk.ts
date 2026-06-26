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
  if (DEMO_MODE) return {};
  const res = await fetch(
    `${ADK_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}`
  );
  if (!res.ok) throw new Error(`Failed to get session: ${res.status}`);
  const data = await res.json();
  return data.state || {};
}

// List all sessions for a user (for memory recall)
export async function listUserSessions(userId: string): Promise<Array<{ id: string; state: Record<string, string> }>> {
  if (DEMO_MODE) return [];
  try {
    const res = await fetch(`${ADK_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions`);
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

        // ── Founder Profiler ──────────────────────────
        onEvent({ type: 'message', author: 'FounderProfiler', content: { parts: [{ text: 'Parsing your interview transcript...\n' }] } });
        await sleep(800);
        onEvent({ type: 'message', author: 'FounderProfiler', content: { parts: [{ text: 'Identifying core technical skills and domain expertise...\n' }] } });
        await sleep(1000);
        onEvent({ type: 'message', author: 'FounderProfiler', content: { parts: [{ text: 'Cross-referencing against market requirements...\n' }] } });
        await sleep(800);
        onEvent({ type: 'message', actions: { state_delta: { founder_profile_summary: `## Founder Profile Summary

**Name:** Alex Chen · **Background:** Full-Stack Engineer → Product Lead

### Core Strengths
- **Technical Depth:** 7 years building B2B SaaS products at scale (React, Node.js, PostgreSQL). Has shipped 3 products used by Fortune 500 companies.
- **Domain Expertise:** Deep knowledge of SMB operations workflows — spent 2 years as Head of Product at an ops-automation startup (acquired by SAP).
- **Network:** Strong network of 200+ SMB operators and 15 warm intros to seed-stage investors in the enterprise SaaS space.

### Constraints & Risks
- **Runway:** 8 months of personal savings ($64K). Tight but viable for MVP validation.
- **Team Gap:** Solo founder — needs a co-founder with GTM/sales expertise urgently.
- **Bandwidth:** Part-time commitment for first 2 months due to current employment contract notice period.

### Fit Assessment
Alex has the rare combination of technical execution ability and operator-level domain knowledge. The solo-founder risk is real but mitigable with the right advisor or co-founder brought in early. **Overall Founder Fit: Strong.**` } } });
        await sleep(400);

        // ── Market Discovery ──────────────────────────
        onEvent({ type: 'message', author: 'MarketDiscovery', content: { parts: [{ text: 'Initiating market analysis protocols...\n' }] } });
        await sleep(600);
        onEvent({ type: 'message', author: 'MarketDiscovery', content: { parts: [{ function_call: { name: 'search_web', args: { query: 'SMB operational inefficiency tools TAM SAM SOM' } } }] } });
        await sleep(1000);
        onEvent({ type: 'message', author: 'MarketDiscovery', content: { parts: [{ function_response: { name: 'search_web', response: { results_found: 12, top_result: 'Gartner: SMB Automation Market 2024' } } }] } });
        await sleep(400);
        onEvent({ type: 'message', author: 'MarketDiscovery', content: { parts: [{ text: 'Querying competitor pricing and positioning data...\n' }] } });
        await sleep(800);
        onEvent({ type: 'message', author: 'MarketDiscovery', content: { parts: [{ function_call: { name: 'scrape_crunchbase', args: { sector: 'SMB workflow automation', limit: 5 } } }] } });
        await sleep(1200);
        onEvent({ type: 'message', author: 'MarketDiscovery', content: { parts: [{ function_response: { name: 'scrape_crunchbase', response: { competitors: ['Zapier', 'Make', 'Monday.com', 'Notion'] } } }] } });
        await sleep(600);
        onEvent({ type: 'message', author: 'MarketDiscovery', content: { parts: [{ text: 'Found 4 direct competitors. Analysing TAM and growth trends...\n' }] } });
        await sleep(1000);
        onEvent({ type: 'message', actions: { state_delta: { market_analysis: `## Market Analysis

### Market Size & Growth
The SMB operations automation market is valued at **$14.8B in 2024**, growing at **22% CAGR** through 2028 (Gartner, 2024). The primary driver is the post-pandemic push for digital-first workflows in businesses with 10–250 employees.

### Competitive Landscape

| Competitor | Pricing | Strength | Weakness |
|---|---|---|---|
| Zapier | $49–$799/mo | Huge ecosystem | Not SMB-native, steep learning curve |
| Make.com | $9–$299/mo | Visual builder | Limited support, poor onboarding |
| Notion | Free–$15/user | Great UX | Not ops-focused, no automation |
| Monday.com | $9–$19/user | Strong brand | Feature bloat, expensive at scale |

### Key Insight
None of the incumbents combine **native SMB onboarding** with **pre-built vertical templates**. There is a significant white space for a vertically-focused tool targeting 3–4 SMB verticals (restaurants, retail, field services, clinics).

### TAM / SAM / SOM
- **TAM:** $14.8B global SMB ops tooling
- **SAM:** $3.2B US SMB segment (10–100 employees)
- **SOM:** $120M achievable in 5 years with focused GTM

SOURCES CONSULTED:
• https://www.gartner.com/en/documents/smb-automation-market-2024
• https://techcrunch.com/2024/03/smb-saas-growth-report
• https://zapier.com/pricing
• https://make.com/en/pricing
• https://monday.com/pricing` } } });
        await sleep(400);

        // ── MVP Architect ──────────────────────────
        onEvent({ type: 'message', author: 'MVPArchitect', content: { parts: [{ text: 'Designing minimal viable architecture based on founder profile...\n' }] } });
        await sleep(1000);
        onEvent({ type: 'message', author: 'MVPArchitect', content: { parts: [{ function_call: { name: 'read_founder_profile', args: {} } }] } });
        await sleep(600);
        onEvent({ type: 'message', author: 'MVPArchitect', content: { parts: [{ function_response: { name: 'read_founder_profile', response: { skills: ['React', 'Node.js', 'PostgreSQL'], budget: 64000 } } }] } });
        await sleep(800);
        onEvent({ type: 'message', author: 'MVPArchitect', content: { parts: [{ text: 'Selecting stack based on founder skills and speed-to-market requirements...\n' }] } });
        await sleep(1200);
        onEvent({ type: 'message', actions: { state_delta: { mvp_plan: `## MVP Architecture Plan

### Vision
**"Zapier for SMBs that hate Zapier."** A vertically-opinionated ops automation platform that ships with 50+ pre-built workflow templates for restaurants, retail, field services, and clinics.

### Proposed Tech Stack
- **Frontend:** Next.js 14 + Tailwind — fast, SEO-friendly, familiar to the team.
- **Backend:** Supabase (Postgres + Realtime + Auth) — eliminates DevOps overhead at MVP stage.
- **Automation Engine:** Custom trigger/action engine using Supabase Edge Functions + Bull queue.
- **Integrations Layer:** Merge.dev unified API for HR/Accounting connectors. Google / Outlook via OAuth.
- **Billing:** Stripe Billing with usage-based tiers.
- **Hosting:** Vercel (frontend) + Railway (queue workers).

### 8-Week Build Plan
| Week | Milestone |
|---|---|
| 1–2 | Auth, onboarding wizard, vertical selector |
| 3–4 | Trigger/action engine (core automation runtime) |
| 5–6 | 10 launch templates (restaurant vertical first) |
| 7 | Billing integration + trial flow |
| 8 | Closed beta with 20 design partners |

### Estimated Cost to MVP
- Infrastructure: ~$200/month
- Tools & APIs: ~$150/month
- Total: **Under $400/month** until $10K MRR` } } });
        await sleep(400);

        // ── Risk Critic ──────────────────────────
        onEvent({ type: 'message', author: 'RiskCritic', content: { parts: [{ text: 'Running adversarial risk analysis on proposed MVP...\n' }] } });
        await sleep(800);
        onEvent({ type: 'message', author: 'RiskCritic', content: { parts: [{ function_call: { name: 'analyze_vulnerabilities', args: { target: 'MVP_Plan' } } }] } });
        await sleep(1200);
        onEvent({ type: 'message', author: 'RiskCritic', content: { parts: [{ function_response: { name: 'analyze_vulnerabilities', response: { critical_flaws: 2, warnings: 4 } } }] } });
        await sleep(400);
        onEvent({ type: 'message', author: 'RiskCritic', content: { parts: [{ text: 'Probing for existential threats and moat weaknesses...\n' }] } });
        await sleep(1200);
        onEvent({ type: 'message', actions: { state_delta: { risk_assessment: `## Risk Assessment

### 🔴 Critical Risk: Zapier Vertical Play
**Threat:** Zapier could launch "Zapier for [Vertical]" products with their existing 2M customer base and brand recognition, wiping out your differentiation overnight.
**Mitigation:** Move fast to lock in 100 design partners in Year 1. Network effects and vertical-specific data become your moat once you have workflow data at scale.

### 🟡 High Risk: Solo Founder Execution Gap
**Threat:** GTM requires a dedicated sales/marketing person. As a solo technical founder, you risk building without enough customer feedback loops.
**Mitigation:** Hire a fractional GTM advisor in Month 1 ($2K/month). Target a co-founder with an SMB sales background within 3 months.

### 🟡 High Risk: Template Commoditization
**Threat:** Competitors can copy templates in weeks. Templates alone are not a durable moat.
**Mitigation:** The real moat is the **workflow analytics** and **auto-optimization** layer on top of templates. Build this in Month 4.

### 🟢 Manageable: Runway
**Threat:** 8 months is tight.
**Mitigation:** Apply to Y Combinator (next batch open) and 3 SAFE-note angels immediately. Target revenue from beta users in Month 3.

CRITICAL QUESTION: What is your unfair advantage over a well-funded Zapier vertical product launched in 6 months?` } } });

        onDone();
        return;
      }

      if (agentName === 'FutureFounderTwinPhase2') {

        // ── MVP Refined ──────────────────────────
        onEvent({ type: 'message', author: 'MVPArchitectRefined', content: { parts: [{ text: 'Initiating cross-agent debate protocol with Risk Critic...\n' }] } });
        await sleep(1000);
        
        const mockDebate = [
          { role: 'RiskCritic', content: 'The founder has 8 months runway and no co-founder. Your proposed custom trigger/action engine is too complex. They need to validate GTM before building a robust backend.' },
          { role: 'MVPArchitect', content: 'Valid point. The data moat comes from benchmark analytics, not the automation engine itself. I can pivot the MVP to a lightweight workflow builder using standard APIs, focusing purely on data collection.' },
          { role: 'RiskCritic', content: 'Agreed. That cuts the build time from 8 weeks to 4 weeks. Ensure you update the GTM strategy to prioritize capturing benchmark data from design partners immediately.' }
        ];
        onEvent({ type: 'message', actions: { state_delta: { debate_transcript: JSON.stringify(mockDebate) } } });
        await sleep(2000);

        onEvent({ type: 'message', author: 'MVPArchitectRefined', content: { parts: [{ text: 'Integrating founder defense and debate outcomes into MVP architecture...\n' }] } });
        await sleep(1200);
        onEvent({ type: 'message', author: 'MVPArchitectRefined', content: { parts: [{ text: 'Refining product strategy based on risk mitigation input...\n' }] } });
        await sleep(1000);
        onEvent({ type: 'message', actions: { state_delta: { mvp_plan_refined: `## Refined MVP Plan (Post-Debate)

Based on Alex's defense, the moat is clarified: **proprietary benchmark data from 500+ SMB operators** collected over 2 years at the previous company. This changes the product strategy significantly.

### Updated Core Feature: Benchmark Intelligence Layer
- Every workflow comes with **industry benchmarks** ("Top 20% of restaurants close their EOD cash count in under 4 minutes. You're at 11 minutes.")
- This data is Alex's **unique unfair advantage** — competitors cannot replicate it without years of data collection.
- Repositions the product from "automation tool" to **"operational intelligence platform"**.

### Revised GTM: Benchmark-Led Growth
1. Publish free "2025 SMB Ops Benchmark Report" — PR magnet, email capture.
2. Let SMBs self-qualify by taking a free "Ops Health Score" (10 questions, instant personalized report).
3. Convert top 20% (highest pain score) to paid trial with 1-click setup.

### Revised Milestones
| Month | Target |
|---|---|
| M1 | 500 signups via benchmark report launch |
| M2 | 20 paying design partners @ $99/month |
| M3 | $2K MRR + YC application submitted |
| M5 | $10K MRR + seed round conversations |
| M8 | $25K MRR + Series Seed close |` } } });
        await sleep(400);

        // ── Evaluation Agent ──────────────────────────
        onEvent({ type: 'message', author: 'EvaluationAgent', content: { parts: [{ text: 'Running Founder Fit Matrix evaluation...\n' }] } });
        await sleep(1500);
        onEvent({ type: 'message', author: 'EvaluationAgent', content: { parts: [{ text: 'Scoring across 4 dimensions: Market, Technical, Execution, Risk...\n' }] } });
        await sleep(1200);
        const evalText = `EVALUATION SCORE: 79/100

| Dimension | Score | Rationale |
|---|---|---|
| Market Fit | 21/25 | Large and growing market with clear white space. Benchmark data moat is compelling. -4 for competitive intensity from incumbents. |
| Tech Fit | 23/25 | Founder has precisely the stack skills required. 7 years of relevant B2B SaaS experience is exceptional. -2 for solo-founder risk. |
| Execution | 17/25 | 8-month runway is tight. No co-founder is a real concern. GTM gap is the most pressing risk. Benchmark-led growth strategy is creative but unproven. |
| Risk | 18/25 | Risks are well-identified and mitigation plan is credible. Zapier threat remains real. Data moat is the strongest risk hedge available. |`;
        onEvent({ type: 'message', actions: { state_delta: { evaluation_results: evalText } } });
        await sleep(400);

        // ── Future Simulator ──────────────────────────
        onEvent({ type: 'message', author: 'FutureSimulator', content: { parts: [{ text: 'Simulating 3 future timelines at 18-month horizon...\n' }] } });
        await sleep(1800);
        onEvent({ type: 'message', author: 'FutureSimulator', content: { parts: [{ text: 'Generating investor-grade narrative...\n' }] } });
        await sleep(1200);
        const simText = `VERDICT: PURSUE

Optimistic: 
Month 1: Benchmark report goes viral on LinkedIn, 2,400 signups.
Month 2: 35 design partners signed at $99/month ($3.5K MRR).
Month 3: YC interview.
Month 4: $12K MRR.
Month 6: $35K MRR, term sheet from Pear VC.
Month 12: $120K MRR, Series Seed closed at $4M valuation.
Month 18: Expanding to 3 new verticals with $2.8M ARR.

Realistic: 
Month 1: Benchmark report drives 600 signups.
Month 2: 12 design partners signed at $79/month ($948 MRR).
Month 3: YC application submitted (waitlisted).
Month 5: $8K MRR via word-of-mouth.
Month 7: Angel round of $250K from 3 investors.
Month 12: $42K MRR, default alive.
Month 18: $1.1M ARR, raising seed with traction.

Conservative: 
Month 1: Report gets modest traction (150 signups).
Month 2: 4 paying customers ($400 MRR).
Month 4: Pivot vertical from restaurants to field services after customer feedback.
Month 6: Find co-founder via YC co-founder matching.
Month 9: Relaunch to field services with stronger PMF signals ($3K MRR).
Month 12: $9K MRR, extended runway via consulting work.
Month 18: $22K MRR, on a path to profitability without VC.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Future Founder Twin — Investor Brief

**IDEA:** OpsSync — The Operational Intelligence Platform for SMBs

**THE PROBLEM**
58% of SMBs cite operational inefficiency as their #1 growth blocker. Existing tools (Zapier, Monday) are either too complex or too generic. No player owns the SMB vertical automation space.

**THE SOLUTION**
OpsSync ships with 50+ pre-built vertical workflow templates AND a proprietary benchmark intelligence layer sourced from 500+ real SMB operators. SMBs don't just automate — they see exactly how they compare to peers and get AI-driven suggestions to close the gap.

**WHY NOW**
Post-pandemic SMBs are digital-native but tools remain enterprise-first. The $14.8B market is growing at 22% CAGR. No incumbent has the operator-level domain knowledge and data that Alex brings.

**TRACTION PLAN**
1. Free "2025 SMB Ops Benchmark Report" as top-of-funnel (target: 1K signups Month 1)
2. "Ops Health Score" quiz → personalized report → trial conversion
3. 20 design partners in Month 2 at $99/month

**THE ASK**
$500K SAFE at $4M cap to fund 18 months of runway, hire a GTM co-founder, and reach $25K MRR.

**VERDICT: PURSUE — move immediately, the window is open.**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        onEvent({ type: 'message', actions: { state_delta: { simulation_results: simText } } });

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
