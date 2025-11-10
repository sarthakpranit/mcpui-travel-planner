# MCP-UI Best Practices Guide

**Date:** 2025-11-10
**Project:** MCP-UI Travel Planner
**Audience:** Developers building MCP-UI tools

---

## Quick Start Checklist

Building your first MCP-UI tool? Follow these steps:

- [ ] 1. Design text version first (validate logic)
- [ ] 2. Set up design system (shadcn/ui tokens)
- [ ] 3. Choose UI pattern (grid, card, or timeline)
- [ ] 4. Build UI version with inline styles
- [ ] 5. Test in sandboxed iframe
- [ ] 6. Optimize payload size (<20KB target)
- [ ] 7. Add error states (match tool style)
- [ ] 8. Document when to use text vs UI
- [ ] 9. Test dark mode
- [ ] 10. Ship both versions with clear naming

**Estimated time:** 2-4 hours for first tool, 30-60 min for subsequent tools

---

## Table of Contents

1. [Tool Design](#tool-design)
2. [Text Tools](#text-tools)
3. [UI Tools](#ui-tools)
4. [Architecture](#architecture)
5. [Performance](#performance)
6. [Security](#security)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Common Pitfalls](#common-pitfalls)
10. [Quick Reference](#quick-reference)

---

## Tool Design

### Start with Text

**Always build the text version first.**

```typescript
// ✅ Good: Text tool validates logic
case "search": {
  const results = filterDestinations(args);
  return formatAsText(results);
}

// Then add UI version
case "search_ui": {
  const results = filterDestinations(args); // Same logic
  return formatAsUI(results);
}
```

**Why:**
- Validates core logic without UI complexity
- Works as fallback if UI fails
- Easier to test and debug
- Faster to iterate

### When to Add UI

Add UI version when:
- ✅ Data is visual/spatial (maps, timelines)
- ✅ Users need to browse/compare (search results)
- ✅ Tool is frequently used
- ✅ Aesthetics influence trust
- ✅ You have time to maintain both

Skip UI when:
- ❌ Data is linear/sequential (already works as text)
- ❌ Users are technical (prefer text)
- ❌ Output is consumed by other tools
- ❌ Performance is critical
- ❌ Limited development time

**See:** [TEXT_VS_UI_ANALYSIS.md](./TEXT_VS_UI_ANALYSIS.md) for detailed comparison

### Tool Naming Convention

Use consistent naming pattern:

```typescript
// Text tools: simple name
"search_destinations"
"get_destination_info"
"create_itinerary"

// UI tools: add _ui suffix
"search_destinations_ui"
"get_destination_info_ui"
"create_itinerary_ui"
```

**Why `_ui` suffix:**
- Self-documenting
- Easy to search/filter
- Alphabetically grouped in tool lists
- Industry convention

### Input Schema Design

**Use enums for constrained choices:**

```typescript
// ✅ Good: enum guides AI
{
  type: "string",
  enum: ["beach", "mountain", "city"],
  description: "Type of destination"
}

// ❌ Bad: free text leads to typos
{
  type: "string",
  description: "Type (beach, mountain, or city)"
}
```

**Make optional params truly optional:**

```typescript
// ✅ Good: has defaults
const pace = args.pace || "moderate";
const interests = args.interests || [];

// ❌ Bad: crashes on missing optional param
const pace = args.pace.toLowerCase(); // Error if undefined
```

**Use descriptive parameter names:**

```typescript
// ✅ Good: clear and explicit
destination_ids: string[]
minRating: number

// ❌ Bad: ambiguous
ids: string[]
rating: number  // Min? Max? Exact?
```

---

## Text Tools

### Response Formatting

**Use markdown structure:**

```typescript
// ✅ Good: hierarchical, scannable
let response = `# ${title}\n\n`;
response += `## Section 1\n`;
response += `• Bullet point 1\n`;
response += `• Bullet point 2\n\n`;
response += `---\n\n`;  // Dividers for sections

// ❌ Bad: flat wall of text
let response = title + " " + section1 + " " + bullet1 + bullet2;
```

**Add spacing generously:**

```typescript
// ✅ Good: breathing room
response += `\n\n`;  // Double newline between sections
response += `\n`;    // Single newline between list items

// ❌ Bad: cramped
response += `\n`;    // Everything single-spaced
```

**Use visual markers:**

```typescript
// ✅ Good: visual hierarchy
${"⭐".repeat(rating)} ${rating}/5
📍 Location
💵 $${cost}/day
✓ Included
✗ Not included

// ❌ Bad: all text
Rating: ${rating}/5
Location: ...
Cost: $${cost}/day
```

### Lists and Bullets

```typescript
// ✅ Good: consistent bullets
• Attraction 1
• Attraction 2
• Attraction 3

// ❌ Bad: mixed styles
- Attraction 1
* Attraction 2
• Attraction 3
```

### Error Messages

```typescript
// ✅ Good: specific, actionable
return {
  content: [{
    type: "text",
    text: `Destination "${id}" not found. Available IDs: bali-001, tokyo-001, paris-001`
  }]
};

// ❌ Bad: vague
return {
  content: [{
    type: "text",
    text: "Error: not found"
  }]
};
```

---

## UI Tools

### Design System Setup

**Always use CSS design tokens:**

```css
/* ✅ Good: semantic tokens */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --border: 240 5.9% 90%;
  --radius: 0.5rem;
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

/* ❌ Bad: hard-coded colors */
body {
  background: white;
  color: #333;
}
```

**Why:** Consistency, dark mode support, maintainability

**See:** [UI_PATTERNS.md](./UI_PATTERNS.md) for complete token list

### Pattern Selection

| Data Type | Use This Pattern | Example |
|-----------|-----------------|---------|
| 3-20 items to compare | Card Grid | Search results |
| Single item details | Detailed Card | Destination info |
| Sequential/temporal | Timeline | Itinerary |
| Many items (20+) | Compact Grid + Pagination | Full catalog |
| Key metrics | Info Box Grid | Dashboard |

**See:** [UI_PATTERNS.md](./UI_PATTERNS.md) for code templates

### Data URL Structure

```typescript
// ✅ Good: proper escaping
const html = `<!DOCTYPE html>...`;
const uiResource = createUIResource({
  uri: `ui://app-name/tool-name/${uniqueId}`,
  content: {
    type: 'externalUrl',
    iframeUrl: `data:text/html,${encodeURIComponent(html)}`,
  },
  encoding: 'text',
});

return {
  content: [{
    type: "text",
    text: `UI_RESOURCE:${JSON.stringify(uiResource)}`
  }]
};

// ❌ Bad: no encoding, static URI
iframeUrl: `data:text/html,${html}`,  // Breaks on special chars
uri: `ui://app/tool`,  // Not unique, causes caching issues
```

### Inline Styles Organization

```html
<!-- ✅ Good: organized sections -->
<style>
  /* 1. Design tokens */
  :root { --primary: ...; }

  /* 2. Base styles */
  * { box-sizing: border-box; }
  body { font-family: system-ui; }

  /* 3. Layout */
  .container { max-width: 1200px; }
  .grid { display: grid; }

  /* 4. Components */
  .card { background: hsl(var(--card)); }
  .badge { padding: 4px 12px; }

  /* 5. States */
  .card:hover { box-shadow: ...; }
  button:disabled { opacity: 0.5; }
</style>

<!-- ❌ Bad: random order -->
<style>
  .card:hover { ... }
  body { ... }
  .badge { ... }
  :root { ... }
</style>
```

### Error States

Match error style to tool type:

```typescript
// ✅ Good: UI tool returns UI error
case "search_ui": {
  if (results.length === 0) {
    return createUIResource({
      // ... styled empty state with icon
    });
  }
}

// ✅ Good: text tool returns text error
case "search": {
  if (results.length === 0) {
    return {
      content: [{
        type: "text",
        text: "No results found. Try adjusting filters."
      }]
    };
  }
}

// ❌ Bad: UI tool returns text error
case "search_ui": {
  if (results.length === 0) {
    return { content: [{ type: "text", text: "Error" }] };
  }
}
```

### Dark Mode Support

```css
/* ✅ Good: automatic dark mode */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
  }
}

/* ❌ Bad: only light mode */
:root {
  --background: white;
  --foreground: black;
}
/* No dark mode = poor user experience */
```

---

## Architecture

### Project Structure

```
project/
├── server/
│   ├── src/
│   │   ├── index.ts           # Tool definitions + handlers
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── data/
│   │   │   └── mock-data.ts   # Mock data for development
│   │   ├── formatters/        # Optional: text formatters
│   │   │   └── text.ts
│   │   └── ui/                # Optional: UI generators
│   │       └── components.ts
│   └── package.json
├── client/                    # Optional: web client
└── docs/                      # Documentation
```

### Code Organization

**Extract shared logic:**

```typescript
// ✅ Good: shared core, different formatters
function searchDestinations(criteria: SearchCriteria): Destination[] {
  // Core logic here
  return results;
}

case "search_destinations": {
  const results = searchDestinations(args);
  return formatAsText(results);
}

case "search_destinations_ui": {
  const results = searchDestinations(args);
  return formatAsUI(results);
}

// ❌ Bad: duplicated logic
case "search_destinations": {
  let results = destinations;
  if (criteria.type) results = results.filter(...);
  // ... 20 lines of filtering
  return formatAsText(results);
}

case "search_destinations_ui": {
  let results = destinations;
  if (criteria.type) results = results.filter(...);
  // ... 20 lines of DUPLICATE filtering
  return formatAsUI(results);
}
```

### Monorepo Setup

**For small projects (<10 packages):**

```json
{
  "name": "mcp-project",
  "workspaces": ["server", "client"],
  "scripts": {
    "dev": "npm run build:server && concurrently \"npm run dev --workspace=server\" \"npm run dev --workspace=client\""
  }
}
```

**For large projects (>10 packages):**

Consider Nx, Turborepo, or Lerna for advanced caching and optimization.

---

## Performance

### Payload Size Optimization

**Target sizes:**
- Text response: <5KB
- Simple UI: <15KB
- Complex UI: <25KB
- Absolute max: <50KB

**How to reduce:**

```css
/* ✅ Good: shorthand, no unused rules */
.card {
  padding: 20px;
  margin: 0 auto;
  border: 1px solid hsl(var(--border));
}

/* ❌ Bad: longhand, verbose */
.card {
  padding-top: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
  padding-left: 20px;
  margin-top: 0;
  margin-right: auto;
  margin-bottom: 0;
  margin-left: auto;
  border-top: 1px solid hsl(var(--border));
  border-right: 1px solid hsl(var(--border));
  border-bottom: 1px solid hsl(var(--border));
  border-left: 1px solid hsl(var(--border));
}
```

**Minify in production:**

```typescript
// Remove unnecessary whitespace
const html = `<!DOCTYPE html><html><head>...`;

// But keep it readable in development
const html = `
  <!DOCTYPE html>
  <html>
    <head>...
`;
```

### Pagination

For large result sets:

```typescript
// ✅ Good: paginate UI
case "search_ui": {
  const allResults = search(criteria);
  const page = args.page || 1;
  const perPage = 12;
  const results = allResults.slice((page-1) * perPage, page * perPage);
  return renderGrid(results, { currentPage: page, totalPages: Math.ceil(allResults.length / perPage) });
}

// ✅ Also good: return all in text, paginate in UI
case "search": {
  const allResults = search(criteria);
  return formatAsText(allResults); // All 50 results OK in text
}

case "search_ui": {
  const allResults = search(criteria);
  const results = allResults.slice(0, 12); // Only 12 in UI
  return renderGrid(results);
}
```

### Caching

```typescript
// ✅ Good: cache expensive operations
const destinationCache = new Map<string, Destination>();

function getDestination(id: string): Destination {
  if (destinationCache.has(id)) {
    return destinationCache.get(id)!;
  }
  const dest = expensiveLookup(id);
  destinationCache.set(id, dest);
  return dest;
}

// ❌ Bad: recalculate every time
function getDestination(id: string): Destination {
  return expensiveLookup(id);
}
```

---

## Security

### Input Validation

```typescript
// ✅ Good: validate all inputs
case "search": {
  const criteria = args as SearchCriteria;

  if (criteria.minRating !== undefined) {
    if (criteria.minRating < 1 || criteria.minRating > 5) {
      return { content: [{ type: "text", text: "minRating must be between 1 and 5" }] };
    }
  }

  // Proceed with validated input
}

// ❌ Bad: trust all inputs
case "search": {
  const criteria = args as SearchCriteria;
  const results = destinations.filter(d => d.rating >= criteria.minRating); // Crashes if undefined
}
```

### HTML Escaping

```typescript
// ✅ Good: escape user input
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const html = `<h1>${escapeHtml(userInput)}</h1>`;

// ❌ Bad: raw user input (XSS risk)
const html = `<h1>${userInput}</h1>`;
```

### Iframe Sandboxing

MCP-UI uses sandboxed iframes by default. **Do not disable sandbox** unless you fully understand the security implications.

```typescript
// ✅ Good: rely on MCP-UI's sandboxing
const uiResource = createUIResource({...});

// ❌ Bad: trying to disable sandbox (doesn't work in MCP-UI)
// Don't attempt to add sandbox="allow-everything"
```

---

## Testing

### Test Checklist

Before shipping a tool:

**Functional:**
- [ ] Tool appears in `list_tools`
- [ ] Required parameters are enforced
- [ ] Optional parameters have defaults
- [ ] Returns expected output format
- [ ] Error cases return helpful messages

**UI-Specific:**
- [ ] Renders correctly in iframe
- [ ] Design tokens applied consistently
- [ ] Dark mode works (if using tokens)
- [ ] Responsive on mobile (320px - 768px)
- [ ] Hover states provide feedback
- [ ] Empty states display correctly
- [ ] Error states display correctly

**Performance:**
- [ ] Text payload <5KB
- [ ] UI payload <25KB
- [ ] Renders in <500ms
- [ ] No console errors

**Security:**
- [ ] User input is validated
- [ ] HTML special chars are escaped
- [ ] No external resource dependencies

### Testing Tools

**Manual testing:**

```bash
# Test via bridge server
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "search_destinations",
      "arguments": {"type": "beach"}
    }
  }'
```

**Automated testing:**

```typescript
import { describe, it, expect } from 'vitest';

describe('search_destinations', () => {
  it('filters by type', () => {
    const results = searchDestinations({ type: 'beach' });
    expect(results.every(d => d.type === 'beach')).toBe(true);
  });

  it('returns empty array when no matches', () => {
    const results = searchDestinations({ minRating: 10 });
    expect(results).toEqual([]);
  });
});
```

---

## Documentation

### Tool Descriptions

```typescript
// ✅ Good: clear, specific description
{
  name: "search_destinations_ui",
  description: "Search for travel destinations with interactive card grid. Returns visual cards with badges, ratings, and quick actions. Use the text version (search_destinations) if you need to copy data or use in scripts.",
  inputSchema: {...}
}

// ❌ Bad: vague description
{
  name: "search_destinations_ui",
  description: "Search destinations",
  inputSchema: {...}
}
```

### README Structure

```markdown
# Tool Name

## Description
What does this tool do? (1-2 sentences)

## When to Use
- ✅ Use when...
- ❌ Don't use when...

## Input Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Free-text search |

## Example Usage
```json
{
  "query": "beach",
  "minRating": 4
}
```

## Output Format
Text: Markdown list with...
UI: Interactive card grid with...

## See Also
- Related tool X
- Documentation Y
```

### Code Comments

```typescript
// ✅ Good: explain why, not what
// Filter by rating first - most selective filter reduces iterations
if (criteria.minRating) {
  results = results.filter(d => d.rating >= criteria.minRating);
}

// ❌ Bad: explain what (already obvious from code)
// Filter results by minimum rating
if (criteria.minRating) {
  results = results.filter(d => d.rating >= criteria.minRating);
}
```

---

## Common Pitfalls

### 1. Forgetting to URL-encode data URLs

```typescript
// ❌ Wrong: breaks on special characters
iframeUrl: `data:text/html,${html}`

// ✅ Correct: always encode
iframeUrl: `data:text/html,${encodeURIComponent(html)}`
```

**Symptom:** UI doesn't render, blank iframe

### 2. Using static URI in createUIResource

```typescript
// ❌ Wrong: caching issues
uri: `ui://app/search`

// ✅ Correct: unique per response
uri: `ui://app/search/${Date.now()}`
uri: `ui://app/search/${criteria.type}-${Math.random()}`
```

**Symptom:** UI doesn't update when calling tool multiple times

### 3. Hard-coding colors

```typescript
// ❌ Wrong: breaks dark mode
background: white;
color: #333;

// ✅ Correct: use design tokens
background: hsl(var(--background));
color: hsl(var(--foreground));
```

**Symptom:** UI looks bad in dark mode

### 4. Missing error handling

```typescript
// ❌ Wrong: crashes on invalid input
const dest = destinations.find(d => d.id === args.destination_id);
return formatDestination(dest); // Crashes if undefined

// ✅ Correct: handle not found
const dest = destinations.find(d => d.id === args.destination_id);
if (!dest) {
  return { content: [{ type: "text", text: `Destination "${args.destination_id}" not found` }] };
}
return formatDestination(dest);
```

**Symptom:** Tool crashes with error, poor UX

### 5. Not testing in actual iframe

```typescript
// ❌ Wrong: only testing in browser directly
// HTML file looks good when opened directly, but...

// ✅ Correct: test in sandboxed iframe
const iframe = document.createElement('iframe');
iframe.sandbox = "allow-scripts";
iframe.src = dataUrl;
document.body.appendChild(iframe);
```

**Symptom:** Works in browser, fails in MCP-UI

### 6. Mixing text and UI in same tool

```typescript
// ❌ Wrong: returns both
return {
  content: [
    { type: "text", text: "Here are results..." },
    { type: "text", text: `UI_RESOURCE:${...}` }
  ]
};

// ✅ Correct: separate tools
case "search": {
  return { content: [{ type: "text", text: "..." }] };
}

case "search_ui": {
  return { content: [{ type: "text", text: `UI_RESOURCE:${...}` }] };
}
```

**Symptom:** Confusing output, hard to use

### 7. Giant payloads

```typescript
// ❌ Wrong: 100KB UI response
return renderUI(allDestinations); // 1000 destinations

// ✅ Correct: paginate or use text
return renderUI(destinations.slice(0, 20)); // First 20 only
// Or suggest: "Use search_destinations (text) for all results"
```

**Symptom:** Slow responses, poor performance

### 8. No mobile testing

```css
/* ❌ Wrong: assumes wide screen */
.grid {
  grid-template-columns: repeat(3, 1fr);
}

/* ✅ Correct: responsive */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
```

**Symptom:** Broken layout on mobile, horizontal scrolling

---

## Quick Reference

### Decision Trees

**Should I build a UI version?**

```
Is data visual/spatial? ──No──> Text is probably enough
         │
        Yes
         │
Will users browse/compare? ──No──> Text might be better
         │
        Yes
         │
Is tool frequently used? ──No──> Maybe skip UI
         │
        Yes
         │
Do I have 2-4 hours? ──No──> Start with text
         │
        Yes
         │
      BUILD UI! ✅
```

**Which UI pattern should I use?**

```
How many items?
  │
  ├─ 1 item ──> Detailed Card
  │
  ├─ 2-20 items ──> Card Grid
  │
  └─ Is data sequential? ──Yes──> Timeline
                         │
                        No ──> Compact Grid + Pagination
```

### Command Snippets

**Start new MCP server:**

```bash
npm init -y
npm install @modelcontextprotocol/sdk @mcp-ui/server typescript
npx tsc --init
```

**Start new MCP-UI tool:**

```typescript
case "tool_name": {
  // 1. Validate input
  // 2. Core logic
  // 3. Return formatted response
}
```

**Test tool:**

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/call", "params": {"name": "tool_name", "arguments": {}}}'
```

### File Templates

See [UI_PATTERNS.md](./UI_PATTERNS.md) for:
- Card Grid template
- Detailed Card template
- Timeline template
- Design token setup

---

## Learning Path

**Week 1: Fundamentals**
1. Build simple text tool (hello_world)
2. Understand MCP protocol basics
3. Test with curl or client

**Week 2: Text Tools**
1. Build 2-3 text tools with real logic
2. Practice input validation
3. Learn markdown formatting

**Week 3: Design System**
1. Set up shadcn/ui CSS tokens
2. Build first UI tool (simple card)
3. Test in iframe

**Week 4: UI Patterns**
1. Build card grid pattern
2. Build timeline pattern
3. Extract reusable components

**Week 5: Polish**
1. Add error states
2. Optimize payload size
3. Document everything

---

## Resources

**Official Documentation:**
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP-UI Extensions](https://github.com/modelcontextprotocol/mcp-ui)
- [shadcn/ui Design Tokens](https://ui.shadcn.com/docs/components)

**Project Documentation:**
- [TEXT_VS_UI_ANALYSIS.md](./TEXT_VS_UI_ANALYSIS.md) - When to use each approach
- [UI_PATTERNS.md](./UI_PATTERNS.md) - Reusable UI pattern library
- [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) - Why we made specific choices
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview

**Community:**
- [MCP GitHub Discussions](https://github.com/modelcontextprotocol/mcp/discussions)
- [MCP Discord](https://discord.gg/mcp)

---

## Summary

**Golden Rules:**

1. **Text first, UI second** - Validate logic before aesthetics
2. **Design tokens always** - Consistency and dark mode support
3. **Separate tools for text/UI** - Clear intent, user choice
4. **Inline styles for MCP-UI** - Zero dependencies
5. **Validate all inputs** - Fail gracefully
6. **Optimize payload size** - <25KB target for UI
7. **Test in iframe** - Browser ≠ sandboxed iframe
8. **Document thoroughly** - Help your future self

**Success Metrics:**

- ✅ Tool works on first try
- ✅ Payload <25KB
- ✅ Renders in <500ms
- ✅ Works in dark mode
- ✅ Clear error messages
- ✅ Users understand when to use text vs UI
- ✅ Code is maintainable
- ✅ Documentation is complete

---

**Next Steps:**

1. Apply these practices to your project
2. Contribute improvements based on your experience
3. Share learnings with the community

---

*Best practices compiled from MCP-UI Travel Planner project (2025-11-10)*
