# MCP-UI Travel Planner - Architecture Documentation

## 📐 System Overview

The MCP-UI Travel Planner is a learning project demonstrating how to build interactive AI-powered applications using the Model Context Protocol (MCP) and MCP-UI extensions.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                    (Web Browser - React)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/JSON
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Bridge Server                              │
│                    (Express.js on Port 3001)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • HTTP API Endpoints                                    │   │
│  │ • Spawns MCP Server as Child Process                    │   │
│  │ • Translates HTTP ↔ stdio                               │   │
│  │ • Parses UI Resources from Tool Results                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ stdio (stdin/stdout)
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                         MCP Server                              │
│                    (Node.js - TypeScript)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ MCP Protocol Handler                                    │   │
│  │ ├─ ListTools: Returns available tools                   │   │
│  │ └─ CallTool: Executes requested tool                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Tools                                                   │   │
│  │ ├─ hello_world (text-based)                            │   │
│  │ ├─ hello_world_ui (UI-based)                           │   │
│  │ └─ [Future: Travel planner tools]                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ UI Resource Generator (@mcp-ui/server)                  │   │
│  │ • Creates HTML/CSS/JS components                        │   │
│  │ • Encodes as data URLs                                  │   │
│  │ • Returns serialized UI resources                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Signal Flow Diagrams

### 1. Application Startup Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ npm run dev
     ↓
┌────────────────────────────────────────────────┐
│  Root Package.json                             │
│  1. Runs build:server                          │
│  2. Starts concurrently:                       │
│     • npm run bridge --workspace=server        │
│     • npm run dev:client                       │
└────┬─────────────────────────┬─────────────────┘
     │                         │
     │ Spawns                  │ Spawns
     ↓                         ↓
┌─────────────────┐      ┌──────────────────┐
│  Bridge Server  │      │   Vite Dev       │
│  (Port 3001)    │      │   Server         │
│                 │      │   (Port 3000)    │
│  Spawns child:  │      │                  │
│  └─ MCP Server  │      │  Serves React    │
│     (stdio)     │      │  app with HMR    │
└─────────────────┘      └──────────────────┘
```

### 2. Tool Call Flow (Text-Based)

```
┌──────────┐
│   User   │ Types "John" and clicks "Call Tool" (hello_world)
└─────┬────┘
      │
      ↓
┌─────────────────────────────────────────────────────────┐
│  React Client (Browser)                                 │
│  1. callTool() function triggered                       │
│  2. Constructs request:                                 │
│     { tool: "hello_world", args: { name: "John" } }     │
└─────┬───────────────────────────────────────────────────┘
      │ POST /call-tool
      │ HTTP with JSON body
      ↓
┌─────────────────────────────────────────────────────────┐
│  Bridge Server (Express.js)                             │
│  1. Receives HTTP request                               │
│  2. Calls mcpClient.callTool()                          │
└─────┬───────────────────────────────────────────────────┘
      │ stdio message (JSON-RPC)
      │ {"method": "tools/call", "params": {...}}
      ↓
┌─────────────────────────────────────────────────────────┐
│  MCP Server                                             │
│  1. CallToolRequestSchema handler invoked               │
│  2. Executes hello_world tool                           │
│  3. Returns:                                            │
│     {                                                   │
│       content: [{                                       │
│         type: "text",                                   │
│         text: "Hello, John! This is plain text..."      │
│       }]                                                │
│     }                                                   │
└─────┬───────────────────────────────────────────────────┘
      │ stdio response (JSON-RPC)
      ↓
┌─────────────────────────────────────────────────────────┐
│  Bridge Server                                          │
│  1. Parses response                                     │
│  2. Extracts text content                               │
│  3. Returns HTTP response:                              │
│     { text: "Hello, John!...", uiResource: null }       │
└─────┬───────────────────────────────────────────────────┘
      │ HTTP 200 with JSON
      ↓
┌─────────────────────────────────────────────────────────┐
│  React Client                                           │
│  1. Receives response                                   │
│  2. Creates message object                              │
│  3. Updates state: setMessages([...prev, newMsg])       │
│  4. React renders message in UI                         │
└─────────────────────────────────────────────────────────┘
      ↓
┌──────────┐
│   User   │ Sees: "Server: Hello, John! This is plain text..."
└──────────┘
```

### 3. Tool Call Flow (UI-Based)

```
┌──────────┐
│   User   │ Types "Sarah" and clicks "Call Tool" (hello_world_ui)
└─────┬────┘
      │
      ↓
┌─────────────────────────────────────────────────────────┐
│  React Client                                           │
│  Constructs: { tool: "hello_world_ui", args: {...} }   │
└─────┬───────────────────────────────────────────────────┘
      │ POST /call-tool
      ↓
┌─────────────────────────────────────────────────────────┐
│  Bridge Server                                          │
│  Forwards to MCP Server via stdio                       │
└─────┬───────────────────────────────────────────────────┘
      │
      ↓
┌─────────────────────────────────────────────────────────┐
│  MCP Server - hello_world_ui Tool                       │
│  1. createUIResource() called:                          │
│     • uri: "ui://travel-planner/hello/Sarah"            │
│     • content.type: "externalUrl"                       │
│     • content.iframeUrl: data URL with HTML            │
│     • encoding: "text"                                  │
│  2. Returns UI resource object                          │
│  3. Serializes as: "UI_RESOURCE:{json...}"              │
└─────┬───────────────────────────────────────────────────┘
      │ stdio response with serialized UI
      ↓
┌─────────────────────────────────────────────────────────┐
│  Bridge Server                                          │
│  1. Detects "UI_RESOURCE:" prefix                       │
│  2. Parses JSON after prefix                            │
│  3. Extracts uiResource object:                         │
│     {                                                   │
│       type: "resource",                                 │
│       resource: {                                       │
│         uri: "ui://...",                                │
│         mimeType: "text/uri-list",                      │
│         text: "data:text/html,<encoded HTML>"           │
│       }                                                 │
│     }                                                   │
│  4. Returns: { text: "", uiResource: {...} }            │
└─────┬───────────────────────────────────────────────────┘
      │ HTTP 200 with JSON
      ↓
┌─────────────────────────────────────────────────────────┐
│  React Client                                           │
│  1. Checks if uiResource exists                         │
│  2. Renders iframe:                                     │
│     <iframe                                             │
│       src={uiResource.resource.text}                    │
│       sandbox="allow-scripts"                           │
│     />                                                  │
│  3. Browser loads data URL in sandboxed iframe          │
└─────┬───────────────────────────────────────────────────┘
      │
      ↓
┌─────────────────────────────────────────────────────────┐
│  Sandboxed Iframe                                       │
│  • Renders HTML/CSS/JS                                  │
│  • Interactive button functional                        │
│  • Isolated from parent page                            │
│  • Can run JavaScript safely                            │
└─────────────────────────────────────────────────────────┘
      ↓
┌──────────┐
│   User   │ Sees interactive greeting card with click button
└──────────┘
```

---

## 🏗️ Component Architecture

### Server Component (`server/src/index.ts`)

```typescript
┌─────────────────────────────────────────────────┐
│          MCP Server Instance                    │
│  (from @modelcontextprotocol/sdk)               │
│                                                 │
│  Configuration:                                 │
│  • name: "travel-planner"                       │
│  • version: "1.0.0"                             │
│  • capabilities: { tools: {} }                  │
└─────────────────┬───────────────────────────────┘
                  │
     ┌────────────┴────────────┐
     │                         │
     ↓                         ↓
┌─────────────────┐   ┌──────────────────┐
│ ListToolsRequest│   │ CallToolRequest  │
│    Handler      │   │     Handler      │
│                 │   │                  │
│ Returns array   │   │ Switch on        │
│ of tool defs:   │   │ tool name:       │
│ • hello_world   │   │ • hello_world    │
│ • hello_world_ui│   │ • hello_world_ui │
└─────────────────┘   └────────┬─────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
                    ↓                      ↓
         ┌──────────────────┐   ┌────────────────────┐
         │  Text Response   │   │   UI Response      │
         │  Return:         │   │   1. createUIResource│
         │  {               │   │   2. Serialize JSON │
         │    content: [{   │   │   3. Return:        │
         │      type: "text"│   │      "UI_RESOURCE:{}"│
         │      text: "..." │   │                     │
         │    }]            │   │                     │
         │  }               │   │                     │
         └──────────────────┘   └────────────────────┘
```

### Bridge Server Component (`server/src/bridge-server.ts`)

```typescript
┌──────────────────────────────────────────────────┐
│           Express.js Application                 │
│                                                  │
│  Middleware:                                     │
│  • cors() - Allow client requests                │
│  • express.json() - Parse JSON bodies            │
└──────────────────┬───────────────────────────────┘
                   │
        ┌──────────┴──────────┬──────────────┐
        │                     │              │
        ↓                     ↓              ↓
┌───────────────┐   ┌─────────────────┐   ┌──────────┐
│ POST          │   │ GET /tools      │   │ GET      │
│ /call-tool    │   │ List available  │   │ /health  │
│               │   │ tools           │   │ Status   │
│ Main endpoint │   └─────────────────┘   │ check    │
└───────┬───────┘                         └──────────┘
        │
        ↓
┌──────────────────────────────────────────────────┐
│  MCP Client Instance                             │
│  (StdioClientTransport)                          │
│                                                  │
│  Initialization:                                 │
│  1. spawn('node', ['build/index.js'])            │
│  2. new StdioClientTransport({...})              │
│  3. mcpClient.connect(transport)                 │
│                                                  │
│  Communication:                                  │
│  • Write to stdin: Tool call requests            │
│  • Read from stdout: Tool call results           │
└──────────────────────────────────────────────────┘
```

### Client Component (`client/src/App.tsx`)

```typescript
┌──────────────────────────────────────────────────┐
│           React Application State                │
│                                                  │
│  State Variables:                                │
│  • messages: Message[]                           │
│  • input: string                                 │
│  • loading: boolean                              │
│  • selectedTool: 'hello_world' | 'hello_world_ui'│
└──────────────────┬───────────────────────────────┘
                   │
        ┌──────────┴──────────┬────────────┐
        │                     │            │
        ↓                     ↓            ↓
┌───────────────┐   ┌─────────────────┐   ┌──────────────┐
│ callTool()    │   │ Message List    │   │ Input Area   │
│ function      │   │ Renderer        │   │ • Tool       │
│               │   │                 │   │   selector   │
│ 1. fetch()    │   │ Maps messages   │   │ • Text input │
│ 2. Parse      │   │ Checks for      │   │ • Submit btn │
│ 3. setState   │   │ uiResource      │   └──────────────┘
└───────────────┘   │ Renders iframe  │
                    │ if UI exists    │
                    └─────────────────┘
```

---

## 🔐 Security Model

### Sandboxed Iframe Execution

```
┌─────────────────────────────────────────────────┐
│          Parent Page (React App)                │
│          Origin: http://localhost:3000          │
│  ┌───────────────────────────────────────────┐  │
│  │  <iframe sandbox="allow-scripts">         │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │  Sandboxed Context                  │ │  │
│  │  │  Origin: null (data URL)            │ │  │
│  │  │                                     │ │  │
│  │  │  Restrictions:                      │ │  │
│  │  │  ✗ Cannot access parent DOM         │ │  │
│  │  │  ✗ Cannot make XHR to parent origin │ │  │
│  │  │  ✗ Cannot access localStorage       │ │  │
│  │  │  ✗ Cannot navigate parent           │ │  │
│  │  │  ✓ Can run JavaScript               │ │  │
│  │  │  ✓ Can render HTML/CSS              │ │  │
│  │  │  ✓ Can show alerts (in sandbox)     │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Security Benefits:**
- UI code cannot access user data in parent application
- XSS attacks are contained within sandbox
- No risk of session hijacking or token theft
- Each UI component is isolated from others

---

## 📦 Package Dependencies

### Server Dependencies

```
@modelcontextprotocol/sdk  ─┐
                            ├─→ MCP Protocol Implementation
@mcp-ui/server              ┘     └─→ UI Resource Creation

express                     ─┐
                            ├─→ HTTP Server (Bridge)
cors                        ┘

typescript                  ─→ Type-safe development
@types/node                 ─→ Node.js type definitions
```

### Client Dependencies

```
react                       ─┐
                            ├─→ UI Framework
react-dom                   ┘

vite                        ─→ Build tool + dev server
@vitejs/plugin-react        ─→ React HMR support
typescript                  ─→ Type-safe development
```

### Workspace Structure

```
Root package.json (workspaces)
    │
    ├─→ server/package.json (server dependencies)
    │
    └─→ client/package.json (client dependencies)
```

**Benefit:** Independent dependency trees, no version conflicts

---

## 🔄 Data Flow Patterns

### Request-Response Pattern

```
Client → Bridge → MCP Server → Bridge → Client
  (HTTP)   (stdio)   (local)   (stdio)   (HTTP)
```

### UI Resource Serialization

```
MCP Server:
  createUIResource({...})
    ↓
  { type: "resource", resource: {...} }
    ↓
  JSON.stringify()
    ↓
  "UI_RESOURCE:{...}"
    ↓
Bridge Server:
  if (text.startsWith('UI_RESOURCE:'))
    ↓
  JSON.parse(text.substring(...))
    ↓
  { text: "", uiResource: {...} }
    ↓
Client:
  if (msg.uiResource)
    ↓
  <iframe src={uiResource.resource.text} />
```

---

## 🚀 Deployment Considerations

### Development vs Production

**Development:**
- Vite dev server with HMR
- TypeScript watch mode
- Separate terminals for server/client
- Source maps enabled

**Production (Future):**
- Build client: `npm run build:client` → static files
- Build server: `npm run build:server` → compiled JS
- Serve client via nginx/CDN
- Run bridge server as daemon
- Use process manager (PM2, systemd)

### Scaling Considerations

**Current Architecture Limitations:**
- Single bridge server instance
- Spawns one MCP server per request (could pool)
- No authentication/authorization
- No rate limiting

**Future Improvements:**
- WebSocket for real-time communication
- MCP server connection pooling
- API authentication (JWT)
- Load balancing multiple bridge servers
- Horizontal scaling with Redis for state

---

## 🎯 Design Decisions & Rationale

### Why Bridge Server?

**Problem:** MCP uses stdio, browsers use HTTP

**Options Considered:**
1. ❌ Direct stdio from browser - Not possible
2. ❌ WebSocket only - Doesn't match MCP protocol
3. ✅ HTTP Bridge - Translates protocols cleanly

**Benefits:**
- Clean separation of concerns
- MCP server remains protocol-compliant
- Can swap client implementations easily
- Bridge can add features (auth, caching, etc.)

### Why Serialize UI Resources?

**Problem:** MCP protocol doesn't support "resource" content type in tool results

**Options Considered:**
1. ❌ Modify MCP SDK - Breaks protocol compliance
2. ❌ Use MCP Resources capability - More complex, different pattern
3. ✅ Serialize in text field - Simple, pragmatic

**Tradeoffs:**
- ✅ Works immediately
- ✅ Backward compatible
- ❌ Not "pure" MCP protocol
- ❌ Custom parsing logic needed

### Why npm Workspaces?

**Problem:** Server and client are separate apps but related

**Options Considered:**
1. ❌ Separate repos - Overhead for learning project
2. ❌ Single package.json - Dependency conflicts
3. ✅ Monorepo with workspaces - Best of both

**Benefits:**
- Single `npm install` for everything
- Share common configs if needed
- Independent versioning possible
- Industry standard pattern

---

## 📚 Key Learning Points

1. **Protocol Translation:** Bridge pattern enables incompatible protocols to work together
2. **Security by Isolation:** Sandboxed iframes provide safe UI rendering
3. **Pragmatic Workarounds:** When specs don't align, serialize creatively
4. **TypeScript Benefits:** Caught API mismatches at compile time
5. **Monorepo Pattern:** Workspace management for related projects

---

## 🔮 Future Architecture Enhancements

### Short Term (Phase 3-4)
- Add more tools (search_destinations, create_itinerary)
- Implement state management (React Context/Zustand)
- Add error boundaries
- Better loading states

### Medium Term
- WebSocket for real-time updates
- MCP server connection pooling
- Client-side caching
- Offline support (Service Workers)

### Long Term
- Multi-user support with authentication
- Database integration for itineraries
- Deploy to production (Vercel + Railway)
- MCP Resources protocol implementation

---

*Last Updated: 2025-11-01*
*Version: 1.0.0 - Initial Architecture*
