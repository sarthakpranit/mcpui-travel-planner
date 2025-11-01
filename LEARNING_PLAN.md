# MCP-UI Travel Planner - Learning Plan

**Project Goal:** Learn MCP and MCP-UI by building a practical travel planner application

**Approach:** Learning by doing - build first, reflect and document learnings

**Last Updated:** 2025-11-01

---

## 📋 Overall Phases

```
Phase 1: Fundamentals    ✅ COMPLETED
Phase 2: Environment     ✅ COMPLETED
Phase 3: Basic Tools     ⏳ PENDING
Phase 4: UI Components   ⏳ PENDING
Phase 5: Documentation   ⏳ PENDING
```

---

## ✅ Phase 1: Understand MCP-UI Fundamentals (COMPLETED)

**Objective:** Learn by reflection - use working environment to understand concepts

### What We Learned

#### 1. **MCP (Model Context Protocol)**
- **What it is:** A protocol for AI assistants to discover and use tools
- **How it works:**
  - Tools defined with name, description, input schema
  - Communication via stdio (standard input/output)
  - Returns structured content (text, images, etc.)
- **Key insight:** Designed for CLI/desktop integration, not web

#### 2. **MCP-UI Extension**
- **What it adds:** Interactive UI components to tool responses
- **How it works:**
  - `createUIResource()` generates HTML/CSS/JS components
  - Components render in sandboxed iframes
  - Security through isolation
- **Key insight:** MCP-UI is an *extension*, not core protocol

#### 3. **Real-World API Challenges**
- **Problem discovered:** `createUIResource` API differs from documentation
- **Expected:**
  ```typescript
  {
    uri: "...",
    content: { type: "externalUrl", iframeUrl: "..." }
  }
  ```
- **Actual:**
  ```typescript
  {
    type: "resource",
    resource: {
      uri: "...",
      mimeType: "text/uri-list",
      text: "data:text/html,..."
    }
  }
  ```
- **Lesson learned:** Always test APIs, don't trust documentation alone

#### 4. **Protocol Integration Issues**
- **Problem:** MCP protocol doesn't support "resource" content type in tool results
- **Validation error:** Zod schema rejected our UI resource response
- **Solution:** Serialize UI resource as JSON in text field with prefix `UI_RESOURCE:`
- **Lesson learned:** Pragmatic workarounds when specs don't align

#### 5. **Architecture Patterns**
- **Three-tier pattern:**
  ```
  MCP Server (stdio) ← → Bridge (HTTP) ← → Client (browser)
  ```
- **Why needed:** Protocol translation between stdio and HTTP
- **Lesson learned:** Bridge pattern enables incompatible systems to work together

#### 6. **TypeScript Benefits**
- **Caught errors:**
  - Wrong URI format (`travel-planner://` vs `ui://`)
  - Missing `mimeType` property
  - Incorrect API structure
- **Lesson learned:** Type safety catches bugs at compile time, not runtime

#### 7. **Security Model**
- **Sandboxed iframes:**
  - `sandbox="allow-scripts"` attribute
  - Isolates UI code from parent page
  - Prevents XSS, session hijacking, data theft
- **Lesson learned:** Security through isolation is effective and simple

### Concepts Mastered
- ✅ MCP tool definition and execution
- ✅ stdio vs HTTP communication
- ✅ UI resource creation with `@mcp-ui/server`
- ✅ Iframe sandboxing for security
- ✅ Bridge pattern for protocol translation
- ✅ Serialization/deserialization for workarounds

### Open Questions
- ❓ How to use MCP Resources capability properly?
- ❓ What are Remote DOM components (vs iframes)?
- ❓ How to handle bidirectional communication (UI → Server)?
- ❓ What's the official way to integrate UI resources?

---

## ✅ Phase 2: Development Environment Setup (COMPLETED)

**Objective:** Build a clean, professional development environment

### What We Built

#### 1. **Project Structure**
```
MCPUITest/
├── server/              # MCP Server + Bridge
│   ├── src/
│   │   ├── index.ts             # MCP server
│   │   ├── bridge-server.ts     # HTTP bridge
│   │   └── tools/               # Tool definitions
│   ├── package.json
│   └── tsconfig.json
├── client/              # React Web Client
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── *.css
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── package.json         # Workspace root
```

#### 2. **Technology Stack**
- **Server:**
  - Node.js + TypeScript
  - `@modelcontextprotocol/sdk` (v1.20.2)
  - `@mcp-ui/server` (v5.13.1)
  - Express.js for HTTP bridge
- **Client:**
  - React 19
  - Vite for dev server + HMR
  - TypeScript for type safety
- **Monorepo:**
  - npm workspaces for dependency management
  - Concurrently for running multiple processes

#### 3. **Key Scripts**
```json
{
  "dev": "Build server + run bridge + start client",
  "build": "Build both server and client",
  "build:server": "TypeScript compilation",
  "build:client": "Vite production build"
}
```

### What We Learned

#### 1. **Project Organization**
- **Initial mistake:** Mixed server/client code in one folder
- **Correction:** Separate folders with independent configs
- **Why it matters:**
  - Clear separation of concerns
  - Independent dependency management
  - Easier to deploy separately
  - Industry standard (monorepo pattern)

#### 2. **npm Workspaces**
- **What it is:** Monorepo management built into npm
- **Benefits:**
  - Single `npm install` for all packages
  - Shared dependencies hoisted to root
  - Run scripts in specific workspaces
  - No need for Lerna or Rush
- **Syntax:** `npm run build --workspace=server`

#### 3. **TypeScript Configuration**
- **Server (Node.js):**
  - `module: "Node16"` for ES modules
  - `outDir: "./build"` for compiled output
  - `rootDir: "./src"` for source files
- **Client (Browser):**
  - `module: "ESNext"` for Vite bundling
  - `jsx: "react-jsx"` for React 17+ transform
  - `noEmit: true` (Vite handles bundling)
- **Lesson:** Different targets need different configs

#### 4. **Development Workflow**
- **Hot Module Replacement (HMR):**
  - Vite provides instant client updates
  - TypeScript watch mode for server
  - Must restart bridge server for changes
- **Debugging:**
  - Can run components separately
  - Server logs to stderr
  - Client has React DevTools

### Tools Mastered
- ✅ npm workspaces
- ✅ TypeScript project references
- ✅ Vite dev server configuration
- ✅ Concurrently for process management
- ✅ Express.js basics
- ✅ MCP SDK client/server usage

### Challenges Overcome
- ✅ Zod validation errors from incorrect API usage
- ✅ TypeScript module resolution issues
- ✅ Mixed server/client code organization
- ✅ Iframe rendering with data URLs
- ✅ CORS configuration for local development

---

## ⏳ Phase 3: Build Basic MCP Tools (PENDING)

**Objective:** Create text-based travel planner tools to understand tool design

### Planned Tools

#### 1. **search_destinations**
- **Purpose:** Find travel destinations based on criteria
- **Input:**
  - `query`: string (e.g., "beach destinations in Asia")
  - `type`: "beach" | "mountain" | "city" | "cultural"
  - `budget`: "low" | "medium" | "high"
  - `climate`: "tropical" | "temperate" | "cold"
- **Output:** List of destinations with basic info
- **Learning goals:**
  - Complex input schemas
  - Structured data responses
  - Search/filter logic

#### 2. **get_destination_info**
- **Purpose:** Get detailed information about a specific destination
- **Input:**
  - `destination_id`: string
  - `include`: array of "weather" | "attractions" | "hotels" | "restaurants"
- **Output:** Detailed destination data
- **Learning goals:**
  - Nested data structures
  - Optional parameters
  - Data aggregation

#### 3. **create_itinerary**
- **Purpose:** Build a day-by-day travel itinerary
- **Input:**
  - `destinations`: array of destination IDs
  - `duration`: number (days)
  - `preferences`: object (pace, interests, etc.)
- **Output:** Structured itinerary with daily activities
- **Learning goals:**
  - Complex business logic
  - State management
  - Data composition

### Learning Objectives

**Tool Design:**
- How to structure input schemas for complex queries
- When to use arrays vs objects vs primitives
- Error handling and validation
- Response formatting for readability

**Data Patterns:**
- Mock data vs real API integration
- Data transformation and filtering
- Caching and performance
- Structured vs unstructured output

**Best Practices:**
- Tool naming conventions
- Description writing for AI understanding
- Parameter design for flexibility
- Testing tool implementations

### Questions to Answer
- ❓ How should tools handle missing data?
- ❓ What's the right level of tool granularity?
- ❓ Should tools be stateless or maintain context?
- ❓ How to make tools composable?

---

## ⏳ Phase 4: Add MCP-UI Interactive Components (PENDING)

**Objective:** Transform text tools into rich, interactive UI experiences

### Planned UI Components

#### 1. **Destination Cards**
- **Replace:** Text list of destinations
- **With:** Interactive cards
  - Hero images
  - Star ratings
  - Quick facts (weather, cost, etc.)
  - "View Details" and "Add to Trip" buttons
- **Learning goals:**
  - Component styling with CSS-in-JS
  - Image handling in data URLs
  - Button click handlers
  - State management across components

#### 2. **Interactive Map**
- **Replace:** Text list of locations
- **With:** Embedded map (Leaflet.js or similar)
  - Markers for destinations
  - Click to view details
  - Zoom and pan
  - Route visualization
- **Learning goals:**
  - Third-party library integration
  - Handling large HTML payloads
  - Map data serialization
  - Performance considerations

#### 3. **Itinerary Builder**
- **Replace:** Static text itinerary
- **With:** Drag-and-drop timeline
  - Daily segments
  - Activity cards
  - Reorder by dragging
  - Add/remove activities
  - Time allocation
- **Learning goals:**
  - Drag-and-drop in sandboxed iframe
  - Complex state management
  - Event handling
  - Persistence (if any)

#### 4. **Booking Forms**
- **Replace:** Text prompts for booking
- **With:** Interactive forms
  - Date pickers
  - Guest selectors
  - Budget sliders
  - Form validation
  - Multi-step wizard
- **Learning goals:**
  - Form handling in iframes
  - Validation and error display
  - Accessibility
  - Sending data back to server

### Technical Challenges to Solve

**1. Bidirectional Communication**
- **Problem:** How do UI interactions trigger server actions?
- **Options:**
  - PostMessage from iframe to parent
  - Callback URLs with parameters
  - WebSocket connection
- **Question:** What's the best pattern?

**2. State Management**
- **Problem:** How to maintain state across multiple UI renders?
- **Options:**
  - Server-side session storage
  - LocalStorage in iframe (sandboxed!)
  - Pass state in subsequent tool calls
- **Question:** What are the tradeoffs?

**3. Large Payloads**
- **Problem:** Complex UIs mean large HTML/CSS/JS
- **Options:**
  - Minification
  - External resources (breaks sandbox?)
  - Component libraries
  - Template caching
- **Question:** What's the size limit?

**4. Styling Consistency**
- **Problem:** Each iframe is independent
- **Options:**
  - Shared CSS via data URL
  - CSS-in-JS for everything
  - Design system tokens
  - Tailwind CSS inlined
- **Question:** Best practice?

### Learning Objectives

**UI Development:**
- Creating responsive designs in constrained environments
- CSS-in-JS vs inline styles vs `<style>` tags
- Handling user interactions in sandboxed contexts
- Accessibility in iframes

**Performance:**
- Minimizing HTML payload size
- Lazy loading techniques
- Optimizing render performance
- Managing memory in iframes

**Design Patterns:**
- Component composition strategies
- State management patterns
- Event handling patterns
- Error boundary implementation

### Success Criteria
- ✅ All text tools have UI alternatives
- ✅ UIs are responsive and accessible
- ✅ Interactions feel natural and intuitive
- ✅ Performance is acceptable (<500ms render)
- ✅ Documented UI patterns for reuse

---

## ⏳ Phase 5: Document Learnings & Design Implications (PENDING)

**Objective:** Reflect on experience and document insights for product design

### Areas to Document

#### 1. **When to Use MCP-UI vs Plain Text**

**Questions to answer:**
- What types of tasks benefit most from UI?
- When is text actually better?
- What's the complexity threshold?
- How does user context matter?

**Framework to develop:**
```
Decision Matrix:
- Task Complexity: Low | Medium | High
- Data Type: Numbers | Text | Visual | Spatial
- User Action: Read | Select | Input | Manipulate
- Context: CLI | Desktop | Web | Mobile
→ Recommendation: Text | Simple UI | Rich UI
```

#### 2. **Performance Characteristics**

**Metrics to measure:**
- Tool call latency (text vs UI)
- Initial render time for UIs
- Memory usage per iframe
- Network payload size
- CPU usage during interactions

**Analysis:**
- What are the bottlenecks?
- What are acceptable limits?
- How to optimize?
- When does performance matter?

#### 3. **Security Considerations**

**Topics to cover:**
- Sandbox effectiveness
- Attack vectors to consider
- Content Security Policy implications
- Data privacy in UIs
- Trust model for UI code

**Questions:**
- Can malicious tools harm users?
- What if UI accesses external resources?
- How to validate/sanitize UI code?
- Should there be a review process?

#### 4. **Developer Experience (DX)**

**What to evaluate:**
- Ease of creating new tools
- Learning curve for MCP-UI
- Debugging experience
- Documentation quality
- Common pitfalls

**Create:**
- Best practices guide
- Common patterns library
- Troubleshooting FAQ
- Code templates

#### 5. **User Experience (UX)**

**What to observe:**
- Cognitive load: Text vs UI
- Task completion time
- Error rates
- User preferences
- Accessibility

**Insights:**
- When do UIs help vs hinder?
- What UI patterns work best?
- How to balance richness and simplicity?

#### 6. **Product Design Implications**

**Strategic questions:**
- How does MCP-UI change AI product design?
- What new experiences become possible?
- What are the limitations?
- How to design for both text and UI modes?
- What's the future vision?

**Frameworks to develop:**
- MCP-UI design principles
- Tool design guidelines
- UI pattern library
- Decision trees for tool creators

### Deliverables

**1. Design Principles Document**
- When to use MCP-UI
- UI component guidelines
- Performance best practices
- Security checklist

**2. Pattern Library**
- Common UI components
- Code examples
- Do's and don'ts
- Accessibility guidelines

**3. Case Study: Travel Planner**
- What we built
- What worked well
- What didn't work
- Lessons learned
- Recommendations

**4. Product Design Framework**
- How to think about MCP-UI tools
- Design process
- Testing strategies
- Rollout considerations

---

## 📊 Learning Metrics

### Knowledge Acquired

**Phase 1:**
- ✅ MCP protocol fundamentals
- ✅ MCP-UI extensions
- ✅ stdio communication
- ✅ Sandboxed execution

**Phase 2:**
- ✅ TypeScript project setup
- ✅ npm workspaces
- ✅ Monorepo patterns
- ✅ Bridge server pattern

**Phase 3:** (Not started)
- Tool design patterns
- Input schema design
- Data modeling
- Error handling

**Phase 4:** (Not started)
- UI component development
- Iframe limitations
- State management
- Performance optimization

**Phase 5:** (Not started)
- Design thinking
- Documentation
- Pattern recognition
- Strategic insights

### Skills Developed

**Technical:**
- ✅ TypeScript advanced usage
- ✅ React component development
- ✅ Express.js API design
- ✅ Vite configuration
- ⏳ Data structure design
- ⏳ UI/UX implementation
- ⏳ Performance profiling

**Product:**
- ✅ API investigation
- ✅ Problem-solving workarounds
- ✅ Architecture design
- ⏳ User research
- ⏳ Design documentation
- ⏳ Strategic thinking

### Challenges Overcome

**Phase 1-2:**
- ✅ API documentation mismatch
- ✅ Protocol incompatibility (MCP + UI resources)
- ✅ TypeScript configuration
- ✅ Project structure organization
- ✅ Serialization strategy

**Phase 3-5:** (To be discovered)
- ...

---

## 🎯 Next Steps

### Immediate (Next Session)
1. Start Phase 3: Build first travel tool
2. Define data structures for destinations
3. Implement `search_destinations` tool
4. Test with text-based responses

### Short Term (This Week)
1. Complete all Phase 3 tools
2. Create mock data for destinations
3. Test tool composition
4. Document design patterns

### Medium Term (Next Week)
1. Start Phase 4: Add UI components
2. Build destination card component
3. Experiment with state management
4. Measure performance

### Long Term (Next 2 Weeks)
1. Complete all UI components
2. Write comprehensive documentation
3. Reflect on learnings
4. Create design framework

---

## 💡 Key Insights (Running Log)

### Technical Insights

**2025-11-01:**
1. **TypeScript catches API mismatches early** - Saved hours of runtime debugging
2. **Bridge pattern is essential for protocol translation** - Clean separation of concerns
3. **Pragmatic workarounds are okay** - Don't need perfect protocol compliance for learning
4. **Sandboxed iframes are surprisingly secure** - Simple yet effective security model
5. **npm workspaces are underrated** - Much simpler than Lerna/Rush for small projects

### Product Insights

**2025-11-01:**
1. **MCP-UI is early stage** - Documentation doesn't match reality, expect inconsistencies
2. **Text vs UI is a spectrum** - Not binary, many hybrid approaches possible
3. **Security must be default** - Sandboxing should be automatic, not opt-in
4. **Developer experience matters** - Easy tool creation is key to adoption
5. **Interoperability is hard** - Stdio, HTTP, WebSocket all have tradeoffs

### Design Insights

**2025-11-01:**
1. **UI isn't always better** - Sometimes text is faster and clearer
2. **Context matters immensely** - Same tool, different UI for different contexts
3. **Progressive enhancement** - Start with text, add UI selectively
4. **Composition over complexity** - Small, focused tools > monolithic ones

---

## 📚 Resources & References

### Documentation Read
- [x] MCP SDK TypeScript docs
- [x] MCP-UI website overview
- [ ] MCP Protocol specification
- [ ] MCP Resources capability
- [ ] Remote DOM documentation
- [ ] MCP-UI client SDKs

### Code Examples Studied
- [x] Hello World MCP server
- [x] Basic UI resource creation
- [ ] Official MCP-UI examples
- [ ] Production MCP servers
- [ ] Advanced UI patterns

### Articles & Guides
- [ ] MCP best practices
- [ ] Iframe security deep dive
- [ ] TypeScript monorepo guide
- [ ] Design systems in constrained environments

---

## 🔄 Plan Updates

**Version 1.0 - 2025-11-01:**
- Initial learning plan created
- Phases 1-2 documented as completed
- Phases 3-5 outlined with objectives
- Key insights from first session captured

**Future Updates:**
- After each phase completion
- When major insights are discovered
- When plans need adjustment
- Weekly reflection logs

---

*This is a living document. Update after each session.*
