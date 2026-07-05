const text = `
Here are the simulated futures:

### 🟢 Optimistic Path (if execution goes to plan)
Best case scenario everything works out.

### 🟡 Realistic Path (average execution, some delays)
It takes 6 months longer than expected.

### 🔴 Conservative Path (risks materialize)
The risks happen.

VERDICT: PURSUE
`;

const text2 = `
integrations and style-controlled templates that generic models cannot replicate. REALISTIC PATH Slow initial growth due to infrastructure optimization, followed by a pivot into high-margin, brand-specific style customization to maintain a defensible niche. VERDICT: PURSUE The founder's technical expertise
`;

function parseContent(text) {
  const cleanText = text.replace(/━{10,}[\s\S]*━{10,}/g, '').trim();

  const sectionRe = /(?:#{1,3}\s*)?(?:🟢\s*|🟡\s*|🔴\s*)?(?:\*\*?)?(Optimistic|Realistic|Conservative)\s*(?:Path|Timeline|Scenario|Case)?(?:\*\*?)?[\s:*]*(?:\n|\s+)([\s\S]*?)(?=(?:#{1,3}\s*)?(?:🟢\s*|🟡\s*|🔴\s*)?(?:\*\*?)?(?:Optimistic|Realistic|Conservative|VERDICT|Verdict)\b|━{10,}|$)/gi;

  const found = {};
  let match;
  while ((match = sectionRe.exec(cleanText)) !== null) {
    const key = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    if (!found[key]) found[key] = match[2].trim().slice(0, 800);
  }
  return found;
}

console.log("TEXT 1:", parseContent(text));
console.log("TEXT 2:", parseContent(text2));
