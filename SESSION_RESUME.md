# Session Resume - MCP-UI Travel Planner

**Last Updated:** 2025-11-01
**Session:** 1
**Status:** Phase 1 & 2 Complete, Ready for Phase 3

---

## 📌 Current State

### What's Working
- ✅ Development environment fully set up
- ✅ Server and client running successfully
- ✅ Two demo tools working (hello_world, hello_world_ui)
- ✅ Bridge server translating HTTP ↔ stdio
- ✅ React client rendering text and UI responses
- ✅ npm workspaces managing dependencies

### What's Running
```bash
# Currently active (if session still open)
npm run dev  # Port 3000 (client), Port 3001 (bridge)

# To start fresh
npm install
npm run dev
```

### File Structure
```
MCPUITest/
├── server/
│   ├── src/
│   │   ├── index.ts          # ✅ MCP server with 2 tools
│   │   ├── bridge-server.ts  # ✅ HTTP bridge working
│   │   └── tools/            # Empty - ready for Phase 3
│   ├── build/                # Compiled TypeScript
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.tsx          # ✅ Working UI
│   │   ├── main.tsx
│   │   └── *.css
│   └── package.json
├── ARCHITECTURE.md          # ✅ Complete architecture docs
├── LEARNING_PLAN.md         # ✅ Detailed learning plan
├── README.md                # ✅ Setup instructions
└── package.json             # Workspace root
```

---

## 🎯 Where We Left Off

### Completed
1. **Phase 1: MCP-UI Fundamentals** ✅
   - Learned MCP protocol basics
   - Understood MCP-UI extensions
   - Discovered API documentation mismatches
   - Implemented workaround for UI resource serialization
   - Grasped security model (sandboxed iframes)

2. **Phase 2: Development Environment** ✅
   - Set up monorepo with npm workspaces
   - Created server (MCP + Bridge) and client (React)
   - Configured TypeScript for both
   - Implemented two working demo tools
   - Documented architecture and learning plan

### Next Up
**Phase 3: Build Travel Planner Tools** ⏳

**Immediate tasks:**
1. Define data structures for destinations
2. Create mock destination data
3. Implement `search_destinations` tool (text-based)
4. Implement `get_destination_info` tool (text-based)
5. Implement `create_itinerary` tool (text-based)

---

## 💡 Key Decisions Made

### Architecture
- **Monorepo structure:** Separate server/client folders with workspaces
- **Bridge pattern:** Express server translates HTTP to stdio
- **UI serialization:** Embed JSON in text with `UI_RESOURCE:` prefix
- **Security:** Sandboxed iframes with `allow-scripts` only

### Technology
- **Server:** Node.js + TypeScript + Express
- **Client:** React 19 + Vite + TypeScript
- **MCP:** @modelcontextprotocol/sdk v1.20.2
- **MCP-UI:** @mcp-ui/server v5.13.1

### Patterns
- **Tool responses:** Text tools return plain text, UI tools serialize JSON
- **Error handling:** TypeScript catches issues at compile time
- **Development:** Concurrently runs bridge + client together

---

## 🐛 Known Issues & Workarounds

### Issue 1: MCP Protocol Doesn't Support UI Resources Natively
**Problem:** Can't return `type: "resource"` in tool results
**Workaround:** Serialize as `UI_RESOURCE:{json}` in text field
**Status:** Working, but not ideal
**Future:** Investigate MCP Resources capability

### Issue 2: createUIResource API Differs from Docs
**Problem:** Returns `{resource: {text: "..."}}` not `{content: {iframeUrl: "..."}}`
**Workaround:** Updated client to use `resource.text` path
**Status:** Fixed
**Lesson:** Always test APIs, don't trust docs blindly

### Issue 3: No Bidirectional Communication Yet
**Problem:** UI can't trigger server actions (e.g., button clicks)
**Workaround:** Not needed for Phase 1-2
**Status:** To be solved in Phase 4
**Options:** PostMessage, callback URLs, WebSocket

---

## 📝 Quick Reference Commands

### Start Development
```bash
npm run dev                  # Start everything
```

### Build
```bash
npm run build:server        # Build server only
npm run build:client        # Build client only
npm run build               # Build both
```

### Run Individually
```bash
# Terminal 1
npm run dev:server --workspace=server

# Terminal 2
npm run bridge

# Terminal 3
npm run dev:client
```

### Troubleshooting
```bash
# Kill ports
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill

# Clean rebuild
rm -rf server/build/ client/dist/ node_modules/
npm install
npm run build
```

---

## 🎓 Key Learnings So Far

### Technical
1. MCP uses stdio for communication (not HTTP)
2. Bridge pattern needed to connect stdio ↔ HTTP
3. TypeScript catches API mismatches early
4. Sandboxed iframes provide security isolation
5. npm workspaces simplify monorepo management

### Product
1. MCP-UI is an extension, not core protocol
2. Documentation often lags implementation
3. Pragmatic workarounds are acceptable for learning
4. Security should be default, not opt-in
5. Text vs UI is a spectrum, not binary

### Design
1. UI isn't always better than text
2. Context determines optimal interaction mode
3. Start simple, add complexity progressively
4. Small focused tools > monolithic ones

---

## 🚀 Next Session Plan

### Setup (5 minutes)
1. Pull latest code
2. Run `npm install`
3. Run `npm run dev`
4. Verify http://localhost:3000 works
5. Review ARCHITECTURE.md and LEARNING_PLAN.md

### Phase 3 Kickoff (60-90 minutes)

#### Step 1: Define Data Model (15 min)
- Create `types.ts` for destination interfaces
- Define destination, itinerary, activity types
- Mock data structure planning

#### Step 2: Create Mock Data (20 min)
- `data/destinations.ts` with 10-15 destinations
- Various types: beach, mountain, city, cultural
- Include weather, cost, ratings, descriptions

#### Step 3: Implement search_destinations (30 min)
- Add tool to `server/src/index.ts`
- Implement search/filter logic
- Return formatted text results
- Test in browser

#### Step 4: Implement get_destination_info (20 min)
- Add tool for detailed destination lookup
- Format detailed information
- Test with various destinations

#### Step 5: Test & Refine (10 min)
- Test all tools together
- Fix any bugs
- Update documentation

### Success Criteria
- ✅ 3 working text-based tools
- ✅ Mock data for 10+ destinations
- ✅ Tools are testable in browser
- ✅ Code is clean and documented
- ✅ Ready for Phase 4 (UI components)

---

## 📂 Files to Review Before Next Session

**Must Read:**
1. `ARCHITECTURE.md` - System design and signal flows
2. `LEARNING_PLAN.md` - Phases 3-5 objectives
3. `README.md` - Setup and commands

**Reference:**
4. `server/src/index.ts` - See how hello_world tools work
5. `client/src/App.tsx` - See how client renders responses

**Optional:**
6. `server/src/bridge-server.ts` - HTTP ↔ stdio translation
7. TypeScript configs - Understanding build setup

---

## 🤔 Open Questions for Next Session

### Technical
- Should we use a real API for destination data or keep mocking?
- How to structure tool responses for optimal UX?
- What level of tool granularity is best?
- Should tools maintain state or be stateless?

### Product
- When to add UI vs keep text-only?
- How to design for both power users (text) and casual users (UI)?
- What metrics matter for tool quality?

### Design
- Best patterns for composable tools?
- How to handle errors gracefully?
- What makes a good tool description for AI?

---

## 💾 Session Context

### User Goals
- Learn MCP and MCP-UI thoroughly
- Build practical travel planner
- Understand when to use UI vs text
- Document insights for product design
- Create reusable patterns

### Teaching Approach
- Learning by doing (build first, reflect later)
- Explain concepts through code
- Show real problems and pragmatic solutions
- Document learnings as we go
- Balance theory and practice

### Communication Style
- Concise technical explanations
- ASCII diagrams for architecture
- Code examples with comments
- Step-by-step breakdowns
- No unnecessary emojis (unless user requests)

---

## 🔖 Bookmarks

**Running App:** http://localhost:3000
**Bridge API:** http://localhost:3001/health

**Documentation:**
- MCP: https://modelcontextprotocol.io/
- MCP-UI: https://mcpui.dev/
- Project Repo: (Add if using GitHub)

---

## ✅ Pre-Session Checklist for Next Time

Before starting next session, verify:
- [ ] Node.js installed (v18+)
- [ ] Dependencies installed (`npm install`)
- [ ] Build successful (`npm run build:server`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Browser shows UI at http://localhost:3000
- [ ] Both tools work (hello_world and hello_world_ui)
- [ ] Reviewed ARCHITECTURE.md
- [ ] Reviewed LEARNING_PLAN.md Phase 3
- [ ] Have questions ready

---

**To resume: Run `/resume` slash command**

*This file is auto-updated at end of each session*
