# Design Decisions & Trade-offs

**Date:** 2025-11-10
**Project:** MCP-UI Travel Planner
**Purpose:** Document architectural choices and their rationale

---

## Overview

This document explains the key design decisions made during the development of the MCP-UI Travel Planner. Each decision is documented with:
- **Context** - What problem were we solving?
- **Options considered** - What alternatives did we evaluate?
- **Decision** - What did we choose?
- **Trade-offs** - What did we gain and lose?
- **Retrospective** - Would we make the same choice again?

---

## 1. Design System: shadcn/ui CSS Variables

### Context
Need consistent theming across multiple independent UI components rendered in separate iframes. Colors, spacing, and typography must be uniform.

### Options Considered

**Option A: Hard-coded colors**
```css
background: white;
color: #333;
border: 1px solid #e5e5e5;
```
- ✅ Simple, no abstraction
- ❌ No dark mode support
- ❌ Inconsistent across tools
- ❌ Hard to update theme globally

**Option B: Tailwind CSS classes**
```html
<div class="bg-white text-gray-800 border border-gray-200">
```
- ✅ Popular, well-documented
- ✅ Dark mode with `dark:` prefix
- ❌ Large CSS payload (~50-100KB)
- ❌ Requires build step or CDN
- ❌ Doesn't work well in data URLs

**Option C: shadcn/ui CSS variables** ⭐ **CHOSEN**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
}
background: hsl(var(--background));
color: hsl(var(--foreground));
```
- ✅ Semantic tokens (primary, muted, destructive)
- ✅ Dark mode with media query
- ✅ Small payload (~2KB for tokens)
- ✅ Works in data URLs
- ✅ Industry standard (GitHub, Vercel use similar)
- ❌ Requires understanding HSL color space
- ❌ More setup than hard-coded colors

### Decision
**Use shadcn/ui CSS variable system**

### Trade-offs

**Gained:**
1. **Consistency** - All tools share same color palette
2. **Dark mode** - Automatic support with `@media (prefers-color-scheme: dark)`
3. **Maintainability** - Change one token, updates everywhere
4. **Semantic meaning** - `--destructive` is clearer than `#DC2626`
5. **Professional appearance** - Matches industry-standard design systems

**Lost:**
1. **Simplicity** - More initial setup than hard-coded colors
2. **Flexibility** - Tied to HSL format (can't easily use RGB)
3. **Learning curve** - Developers must understand token system

### Retrospective
✅ **Would choose again.** The consistency and dark mode support were worth the setup cost. Highly recommend for any multi-tool MCP-UI project.

**Recommendation:** Start with shadcn/ui tokens even for small projects. The time investment (30 minutes) pays off immediately.

---

## 2. UI Delivery: Data URLs with Inline Styles

### Context
Need to deliver HTML/CSS/JS to iframe without external dependencies. MCP protocol doesn't support serving static files.

### Options Considered

**Option A: External URL (separate server)**
```typescript
iframeUrl: 'https://myserver.com/ui/destination.html'
```
- ✅ Can use standard web dev workflow
- ✅ Can reference external CSS/JS files
- ✅ Smaller MCP payload
- ❌ Requires separate web server
- ❌ Network latency for iframe load
- ❌ CORS and security complexity
- ❌ Doesn't work offline

**Option B: Data URL with external CSS**
```typescript
iframeUrl: `data:text/html,<html>
  <link rel="stylesheet" href="https://cdn.com/styles.css">
  <body>...</body>
</html>`
```
- ✅ Simple HTML generation
- ✅ Can use CDN for styles
- ❌ External dependency (CDN must be up)
- ❌ Network request from iframe
- ❌ CORS issues in sandbox
- ❌ Slower render (CSS blocks)

**Option C: Data URL with inline styles** ⭐ **CHOSEN**
```typescript
iframeUrl: `data:text/html,${encodeURIComponent(`
  <html>
    <style>
      :root { --background: 0 0% 100%; }
      .card { background: hsl(var(--background)); }
    </style>
    <body>...</body>
  </html>
`)}`
```
- ✅ Self-contained, no external deps
- ✅ Works offline
- ✅ Fast render (no network requests)
- ✅ No CORS issues
- ❌ Large payload (10-20KB)
- ❌ Can't cache CSS separately
- ❌ HTML generation is verbose

### Decision
**Use data URLs with inline styles**

### Trade-offs

**Gained:**
1. **Zero dependencies** - Everything in one payload
2. **Offline-first** - Works without network
3. **Security** - No external resource loading
4. **Simplicity** - One artifact to manage
5. **Reliability** - Can't break due to CDN outage

**Lost:**
1. **Payload size** - 10-20KB vs ~2KB with external CSS
2. **Caching** - Every response includes full CSS
3. **Development experience** - Harder to debug than separate files
4. **Code organization** - HTML/CSS in one file

### Retrospective
✅ **Would choose again for learning project.** The simplicity and reliability outweighed payload concerns.

⚠️ **For production:** Consider hybrid approach:
- Small tools (<5KB): inline styles
- Large tools (>20KB): external URL with caching
- Frequently used components: cache on client side

**Recommendation:** Start with inline styles. Optimize later if payload size becomes an issue.

---

## 3. Architecture: Parallel Text + UI Tools

### Context
Users may prefer text or UI depending on task context. How should we structure our tools?

### Options Considered

**Option A: Single tool with mode parameter**
```typescript
{
  name: "search_destinations",
  properties: {
    mode: { enum: ["text", "ui"] }
  }
}
```
- ✅ One tool definition
- ✅ Single implementation to maintain
- ❌ Complicates tool logic (if/else for mode)
- ❌ Less clear in tool list
- ❌ Harder to discover UI capability

**Option B: Parallel tools** ⭐ **CHOSEN**
```typescript
{
  name: "search_destinations",
  description: "Search with text results"
},
{
  name: "search_destinations_ui",
  description: "Search with interactive cards"
}
```
- ✅ Clear separation of concerns
- ✅ Easy to discover (`_ui` suffix convention)
- ✅ Can evolve independently
- ✅ Share core logic, different formatters
- ❌ More tool definitions (6 vs 3)
- ❌ Potential code duplication
- ❌ User must choose upfront

**Option C: Auto-detect based on client**
```typescript
// Return UI if client supports it, otherwise text
if (client.supportsUI) {
  return uiResponse;
} else {
  return textResponse;
}
```
- ✅ No user decision required
- ❌ No way to detect client capability in MCP
- ❌ User loses choice
- ❌ Hard to implement reliably

### Decision
**Use parallel text + UI tools with `_ui` suffix naming convention**

### Trade-offs

**Gained:**
1. **User choice** - Can pick text or UI per task
2. **Clear intent** - Tool name indicates response format
3. **Independent evolution** - Can improve text without affecting UI
4. **Shared logic** - Search/calculation code reused
5. **Discovery** - `_ui` suffix is self-documenting

**Lost:**
1. **Tool count** - 8 tools instead of 5
2. **Maintenance** - Must keep both versions in sync
3. **Decision burden** - User must choose which to use

### Retrospective
✅ **Would choose again.** User feedback confirmed different preferences for different tasks.

**Observation:** Users often use BOTH:
1. UI version for exploration ("what's available?")
2. Text version for execution ("copy this ID, call next tool")

**Recommendation:** Provide both for core functionality. Add guidance in tool descriptions about when to use each.

---

## 4. Data Strategy: Mock Data vs Real APIs

### Context
Need destination data for tools. Should we integrate real travel APIs or use mock data?

### Options Considered

**Option A: Real travel APIs (Amadeus, Skyscanner)**
- ✅ Real, up-to-date data
- ✅ Production-ready
- ❌ API keys, rate limits, costs
- ❌ Network dependency (can fail)
- ❌ Slow iteration (API latency)
- ❌ Complex response parsing
- ❌ Distracts from MCP learning goal

**Option B: Mock data in memory** ⭐ **CHOSEN**
```typescript
export const destinations: Destination[] = [
  { id: "bali-001", name: "Bali", ... },
  { id: "tokyo-001", name: "Tokyo", ... },
];
```
- ✅ Fast iteration (no API delays)
- ✅ Predictable, testable
- ✅ No external dependencies
- ✅ Complete control over data
- ✅ Focuses on MCP, not API integration
- ❌ Not production-ready
- ❌ Limited to 15 destinations
- ❌ No real-time updates

**Option C: SQLite database**
- ✅ More realistic data layer
- ✅ Can scale to 1000s of records
- ❌ Adds complexity (file I/O, queries)
- ❌ Overkill for learning project
- ❌ Still not real data

### Decision
**Use mock data array in memory**

### Trade-offs

**Gained:**
1. **Speed** - Instant responses, no network latency
2. **Reliability** - Never fails due to API outage
3. **Simplicity** - Just TypeScript objects
4. **Focus** - Learn MCP, not API integration
5. **Testability** - Deterministic data

**Lost:**
1. **Realism** - Not production-ready
2. **Scale** - Only 15 destinations
3. **Freshness** - Data never updates

### Retrospective
✅ **Would choose again for learning project.** Mock data was perfect for iteration speed.

⚠️ **For production:** Add real API integration as next phase. Mock data proved the concept.

**Recommendation:** Always start with mock data for new MCP tools. Validate UX before investing in API integration.

---

## 5. Monorepo Strategy: npm Workspaces

### Context
Project has server and client packages. How should we manage dependencies and builds?

### Options Considered

**Option A: Separate repos**
- ✅ Complete isolation
- ❌ Hard to keep in sync
- ❌ Complex setup for beginners
- ❌ Difficult to share types

**Option B: Lerna / Nx**
- ✅ Powerful caching, optimization
- ✅ Standard for large monorepos
- ❌ Heavy setup, configuration
- ❌ Overkill for 2 packages
- ❌ Steeper learning curve

**Option C: npm workspaces** ⭐ **CHOSEN**
```json
{
  "workspaces": ["server", "client"]
}
```
- ✅ Built into npm (no extra tools)
- ✅ Simple configuration
- ✅ Shared dependencies hoisted
- ✅ Easy to run scripts across packages
- ❌ Less powerful than Lerna/Nx
- ❌ No advanced caching

### Decision
**Use npm workspaces**

### Trade-offs

**Gained:**
1. **Simplicity** - Zero config beyond package.json
2. **Speed** - Hoisted deps save disk space and install time
3. **Convenience** - `npm run dev` starts both packages
4. **Accessibility** - Anyone with npm can use it

**Lost:**
1. **Advanced features** - No smart caching or distributed builds
2. **Optimization** - Lerna can be faster for large projects

### Retrospective
✅ **Would choose again.** npm workspaces were perfect for this project size.

**Recommendation:** Use npm workspaces for <10 packages. Upgrade to Nx/Turbo/Lerna for larger monorepos.

---

## 6. Bridge Server: HTTP to stdio Translation

### Context
MCP servers use stdio (standard input/output), but web clients need HTTP. How do we bridge them?

### Options Considered

**Option A: Direct WebSocket from client to MCP**
- ✅ No intermediary
- ❌ MCP doesn't support WebSocket natively
- ❌ Would require MCP server modification

**Option B: Client sends HTTP to bridge, bridge uses stdio** ⭐ **CHOSEN**
```
Client (HTTP) → Bridge Server (HTTP → stdio) → MCP Server (stdio)
                ↓
                (HTTP ← stdio)
```
- ✅ Clean separation of concerns
- ✅ MCP server unchanged (standard stdio)
- ✅ Easy to debug (HTTP requests visible)
- ✅ Could support multiple clients
- ❌ Extra process to run
- ❌ Adds latency (~5-10ms)

**Option C: Embed MCP server in Express**
- ✅ Single process
- ❌ Tight coupling
- ❌ Hard to reuse MCP server with Claude Desktop

### Decision
**Use dedicated bridge server that translates HTTP ↔ stdio**

### Trade-offs

**Gained:**
1. **Modularity** - MCP server is portable (works with Claude Desktop)
2. **Debuggability** - Can inspect HTTP traffic with browser devtools
3. **Flexibility** - Could support multiple transports (WebSocket later)
4. **Testing** - Can test MCP server independently via stdio

**Lost:**
1. **Simplicity** - Extra process to manage
2. **Performance** - Minor latency overhead

### Retrospective
✅ **Would choose again.** The bridge pattern proved essential for development.

**Key insight:** Bridge server also serves as HTTP→stdio adapter for any MCP server, not just ours. Could be extracted as reusable utility.

**Recommendation:** Use bridge pattern for web clients. Direct stdio for CLI/desktop.

---

## 7. Client UI: Tab-Based Navigation

### Context
Client needs to let user select which tool to call. How should we present 8 tools?

### Options Considered

**Option A: Radio buttons (original approach)**
```html
○ hello_world
○ hello_world_ui
○ search_destinations
...
```
- ✅ Simple HTML
- ❌ Takes vertical space
- ❌ Looks dated
- ❌ Hard to scan

**Option B: Dropdown select**
```html
<select>
  <option>hello_world</option>
  <option>hello_world_ui</option>
</select>
```
- ✅ Compact
- ❌ Requires click to see options
- ❌ Doesn't show grouping

**Option C: Tab-based with categories** ⭐ **CHOSEN**
```html
[Demo] [Travel] [Settings]
  ↓
  search_destinations | get_destination_info | create_itinerary
  [Text] [UI] toggle
```
- ✅ Visual grouping by category
- ✅ Modern, familiar UI pattern
- ✅ Toggle for text/UI selection
- ✅ Scalable to more tools
- ❌ More complex to implement
- ❌ Takes horizontal space

### Decision
**Use tab-based navigation with Text/UI toggle**

### Trade-offs

**Gained:**
1. **Organization** - Tools grouped by category
2. **Modern UX** - Tabs are intuitive
3. **Toggle pattern** - Clear text vs UI selection
4. **Scalability** - Easy to add more categories/tools

**Lost:**
1. **Simplicity** - More complex HTML/CSS
2. **Mobile** - Tabs may wrap on narrow screens

### Retrospective
✅ **Would choose again.** Much better UX than radio buttons.

**Observation:** Toggle switch pattern was particularly successful. Users immediately understood text vs UI choice.

**Recommendation:** Use tabs for >5 tools. Add toggle for parallel text/UI tools.

---

## 8. Argument Handling: JSON Parsing in Client

### Context
Tools need complex arguments (arrays, objects). How should client send them?

### Options Considered

**Option A: Simple string input**
```html
<input type="text" placeholder="destination_id">
```
- ✅ Simple
- ❌ Can't handle arrays or objects
- ❌ User must know exact format

**Option B: Form with individual fields**
```html
<input name="query">
<select name="type">
<input name="minRating" type="number">
```
- ✅ Guided input
- ✅ Validation per field
- ❌ Lots of HTML per tool
- ❌ Hard to maintain

**Option C: JSON textarea with examples** ⭐ **CHOSEN**
```html
<textarea placeholder='{"destination_ids": ["bali-001"]}'>
```
- ✅ Handles complex arguments
- ✅ Developer-friendly
- ✅ Examples in placeholder
- ✅ One input for all tools
- ❌ Requires JSON knowledge
- ❌ Error-prone (syntax errors)

### Decision
**Use JSON textarea with tool-specific examples**

### Trade-offs

**Gained:**
1. **Flexibility** - Any argument structure works
2. **Simplicity** - One input component for all tools
3. **Power** - Can send arrays, nested objects
4. **Learning** - Examples teach JSON format

**Lost:**
1. **UX** - Not as friendly as guided form
2. **Validation** - Syntax errors possible

### Retrospective
⚠️ **Mixed results.** Works well for developers, not ideal for end-users.

**For production:** Consider dynamic form generation based on tool schema:
```typescript
if (schema.type === 'string' && schema.enum) {
  return <select>{schema.enum.map(...)}</select>
}
```

**Recommendation:** JSON input for developer tools, form builder for end-user tools.

---

## 9. Error Handling: UI Error States

### Context
What should UI tools return when data is not found or invalid?

### Options Considered

**Option A: Plain text error**
```typescript
return {
  content: [{
    type: "text",
    text: "Destination not found"
  }]
};
```
- ✅ Simple
- ✅ Works everywhere
- ❌ Inconsistent with UI tools
- ❌ No visual styling

**Option B: UI error state** ⭐ **CHOSEN**
```typescript
const errorUI = createUIResource({...});
// Returns styled error card with icon
```
- ✅ Consistent with UI theme
- ✅ Visual hierarchy (icon, message)
- ✅ Professional appearance
- ❌ Larger payload for errors
- ❌ More code to maintain

**Option C: Throw exception**
```typescript
throw new Error("Not found");
```
- ✅ Standard error handling
- ❌ May crash tool
- ❌ Unclear to user

### Decision
**Return styled UI error states for UI tools, text errors for text tools**

### Trade-offs

**Gained:**
1. **Consistency** - Errors match tool style (text or UI)
2. **Clarity** - Visual errors are easier to spot
3. **Professionalism** - Styled errors feel polished

**Lost:**
1. **Simplicity** - More code for error cases
2. **Payload** - Error UI is ~5KB vs ~50B text

### Retrospective
✅ **Would choose again.** Consistent error presentation improves UX.

**Recommendation:** Match error format to tool output format (text tools → text errors, UI tools → UI errors).

---

## 10. Security: Sandboxed Iframes

### Context
UI components run arbitrary HTML/CSS/JS. How do we ensure safety?

### Options Considered

**Option A: No sandboxing (trust content)**
```html
<iframe src="..."></iframe>
```
- ✅ Simple
- ❌ XSS vulnerabilities
- ❌ Can access parent window
- ❌ Can make arbitrary network requests

**Option B: Sandbox with limited permissions** ⭐ **CHOSEN (MCP-UI default)**
```html
<iframe sandbox="allow-scripts allow-same-origin" src="..."></iframe>
```
- ✅ Blocks most dangerous operations
- ✅ Prevents parent window access
- ✅ Industry standard
- ❌ Limits some features (forms, popups)
- ❌ May break complex interactions

**Option C: Server-side rendering**
- ✅ No client-side JavaScript
- ❌ Can't use MCP-UI (client-side only)
- ❌ Loses interactivity

### Decision
**Use MCP-UI's default sandboxed iframe behavior**

### Trade-offs

**Gained:**
1. **Security** - XSS attacks blocked
2. **Isolation** - UI can't access parent page
3. **Standard** - iframe sandbox is well-understood
4. **Trust** - Users can safely use UI tools

**Lost:**
1. **Functionality** - Some iframe features disabled
2. **Communication** - Harder to pass data back to parent

### Retrospective
✅ **Correct choice.** Security should be default, not opt-in.

**Limitation:** Button clicks can only show alerts, not communicate back to parent. For production, need postMessage API or server-side callbacks.

**Recommendation:** Always use sandboxed iframes for user-generated content. Only disable sandbox if you control and trust the content.

---

## Decision Summary Table

| Decision | Primary Benefit | Main Trade-off | Would Change? |
|----------|----------------|----------------|---------------|
| shadcn/ui tokens | Consistency + dark mode | Initial setup | No ✅ |
| Data URLs + inline | Zero dependencies | Payload size | No ✅ |
| Parallel text/UI | User choice | More tools | No ✅ |
| Mock data | Iteration speed | Not production-ready | No ✅ |
| npm workspaces | Simplicity | Less powerful | No ✅ |
| Bridge server | Modularity | Extra process | No ✅ |
| Tab navigation | Better UX | Implementation complexity | No ✅ |
| JSON input | Flexibility | Error-prone | Maybe ⚠️ |
| UI error states | Consistency | More code | No ✅ |
| Sandboxed iframes | Security | Limited features | No ✅ |

**Key insight:** Nearly all decisions were correct for a learning project. Only JSON input might change for production (use form builder instead).

---

## Cross-Cutting Principles

### 1. Prioritize Learning Over Production-Ready
- Mock data over real APIs
- Inline styles over CDN
- Simple bridge over complex architecture

**Rationale:** Goal was to learn MCP, not build production travel planner.

### 2. Optimize for Developer Experience
- npm workspaces (familiar tool)
- TypeScript (catch errors early)
- Clear file structure
- Comprehensive documentation

**Rationale:** Make it easy for others to learn from this project.

### 3. Progressive Enhancement
- Text tools first, UI second
- Simple tools (hello_world), complex tools (itinerary)
- Mock data, then could add real APIs

**Rationale:** Build incrementally, validate each step.

### 4. Consistency Over Perfection
- All UI tools use same design tokens
- All text tools use markdown formatting
- Naming convention: `tool_name` and `tool_name_ui`

**Rationale:** Consistent patterns are more valuable than perfect individual tools.

### 5. Document While Building
- Session notes after each day
- Learnings captured immediately
- Questions documented even if unanswered

**Rationale:** Knowledge decays quickly. Capture insights when fresh.

---

## Lessons Learned

### What Worked Well

1. **Design system investment paid off immediately**
   - First tool took 90 min with design system setup
   - Second and third tools took 30 min each
   - Consistency made everything feel cohesive

2. **Mock data accelerated learning**
   - No API delays or failures
   - Could iterate on tools without external dependencies
   - Focus stayed on MCP concepts

3. **Parallel text/UI tools validated by usage**
   - Users naturally chose text for some tasks, UI for others
   - Clear that both have value
   - Shared logic meant little extra work

4. **Documentation discipline**
   - Creating docs forced clarity of thought
   - Helped identify gaps in understanding
   - Valuable for future reference

### What Could Be Better

1. **JSON input is developer-centric**
   - Would build dynamic form generator for production
   - Could use tool schema to auto-generate inputs

2. **No pagination for large result sets**
   - UI tools assume <10 results
   - Would add pagination for 20+ items

3. **Button interactivity is limited**
   - Can only show alerts in sandbox
   - Need bidirectional communication for real actions

4. **Error handling not comprehensive**
   - Styled errors for common cases
   - Could add error boundaries for unexpected failures

---

## Recommendations for Future Projects

### Start With
1. ✅ Design system (shadcn/ui tokens)
2. ✅ Text tools before UI
3. ✅ Mock data for fast iteration
4. ✅ Simple monorepo (npm workspaces)
5. ✅ Bridge server for web clients

### Add Later
6. Real API integration (after UI is validated)
7. Form builder for complex inputs
8. Pagination for large datasets
9. Bidirectional communication (postMessage)
10. Testing infrastructure

### Avoid
- ❌ Premature optimization (wait for real perf issues)
- ❌ Over-engineering architecture (YAGNI principle)
- ❌ Real APIs before UX is validated
- ❌ Complex build tools for small projects

---

## Conclusion

Most decisions proved correct in retrospect. The key was matching complexity to project goals:
- **Learning project** → Simple choices (npm workspaces, mock data)
- **User-facing** → Polish choices (design system, error states)
- **Developer-facing** → Power choices (JSON input, TypeScript)

**Golden rule:** Choose tools and patterns that accelerate learning first, production-readiness second.

---

*Design decisions documented after completing Phase 4 (2025-11-10)*
