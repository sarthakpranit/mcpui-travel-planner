# MCP-UI Travel Planner - Learning Project

A hands-on project to learn **MCP (Model Context Protocol)** and **MCP-UI** by building a travel planner application.

## 🎯 Learning Goals

- Understand MCP and how it enables AI tools
- Learn MCP-UI for creating interactive components
- Compare text-based tools vs. UI-based tools
- Build practical examples
- Document pros, cons, and design implications

## 📁 Project Structure

```
MCPUITest/
├── server/                    # MCP Server (Node.js + TypeScript)
│   ├── src/
│   │   ├── index.ts          # MCP server (provides tools)
│   │   ├── bridge-server.ts  # HTTP bridge (connects client to MCP)
│   │   └── tools/            # Tool definitions (to be added)
│   ├── build/                # Compiled TypeScript
│   ├── package.json          # Server dependencies
│   └── tsconfig.json         # Server TypeScript config
├── client/                   # Web Client (React + Vite)
│   ├── src/
│   │   ├── App.tsx          # React app
│   │   ├── main.tsx         # Entry point
│   │   └── *.css            # Styles
│   ├── dist/                # Built client (production)
│   ├── package.json         # Client dependencies
│   ├── tsconfig.json        # Client TypeScript config
│   ├── vite.config.ts       # Vite configuration
│   └── index.html           # HTML template
└── package.json             # Workspace root (npm workspaces)
```

### Why Separate Folders?

✅ **Clear separation of concerns** - Server and client are distinct applications
✅ **Independent dependencies** - Each has only what it needs
✅ **Better scalability** - Can deploy/version separately
✅ **Cleaner development** - No mixed TypeScript configs
✅ **Industry standard** - Monorepo pattern with workspaces

## 🏗️ Architecture

```
┌─────────────┐      HTTP      ┌──────────────┐      stdio      ┌──────────────┐
│             │ ───────────────>│              │ ───────────────>│              │
│ Web Client  │                 │ Bridge Server│                 │  MCP Server  │
│ (React)     │ <───────────────│ (Express)    │ <───────────────│ (Node.js)    │
└─────────────┘                 └──────────────┘                 └──────────────┘
   Port 3000                        Port 3001                    stdio transport
```

### Why This Architecture?

- **MCP Server** uses stdio (standard input/output) for communication
- **Web Client** needs HTTP/WebSocket for browser communication
- **Bridge Server** translates between HTTP and stdio

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm

### Installation

If starting fresh:

```bash
npm install  # Installs all workspace dependencies
```

This uses **npm workspaces** to manage both server and client dependencies from the root.

### Running the Application

**Option 1: Run everything with one command** (Recommended)

```bash
npm run dev
```

This starts:
1. Builds the server
2. Starts bridge server (port 3001)
3. Starts web client dev server (port 3000)

Then open: **http://localhost:3000**

**Option 2: Run components separately** (for debugging)

Terminal 1 - Server with watch mode:
```bash
npm run dev:server --workspace=server
```

Terminal 2 - Bridge server:
```bash
npm run bridge
```

Terminal 3 - Web client:
```bash
npm run dev:client
```

## 🧪 Testing the Setup

1. Open http://localhost:3000
2. Enter your name (e.g., "Sarah")
3. Select "Text Tool (plain MCP)"
4. Click "Call Tool"
5. See plain text response

Now try:
6. Select "UI Tool (MCP-UI)"
7. Click "Call Tool"
8. See interactive UI component with button

## 📚 Current Tools

### 1. `hello_world` (Text-based)
- Simple MCP tool
- Returns plain text response
- Demonstrates basic tool structure

### 2. `hello_world_ui` (UI-based)
- MCP-UI tool
- Returns interactive HTML component
- Demonstrates UI resource creation
- Shows the difference from text-only

## 🔍 What's Next?

### Phase 1: Understand Fundamentals
Use this working setup to explore:
- How MCP tools work
- How UI resources are created
- Difference between text and UI responses
- Security model (sandboxed iframes)

### Phase 3: Build Travel Planner Tools
Add real functionality:
- `search_destinations` - Find travel destinations
- `get_destination_info` - Get detailed info
- `create_itinerary` - Build trip plans

### Phase 4: Add Rich UI Components
Transform into interactive experience:
- Destination cards with images
- Interactive maps
- Date pickers and forms
- Drag-and-drop itinerary builder

### Phase 5: Document Learnings
Reflect on:
- When to use MCP-UI vs. text
- Performance considerations
- Design patterns
- Pros and cons

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies (workspaces) |
| `npm run dev` | Run everything (server + bridge + client) |
| `npm run build` | Build both server and client |
| `npm run build:server` | Build server only |
| `npm run build:client` | Build client only |
| `npm run bridge` | Start bridge server |
| `npm run dev:client` | Start client dev server only |
| `npm run dev:server` | Start server in watch mode |
| `npm run start:server` | Run MCP server directly (stdio) |

## 🐛 Troubleshooting

### Port already in use

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
```

### Build errors

```bash
# Clean and rebuild
rm -rf server/build/ client/dist/ node_modules/
npm install
npm run build
```

### Bridge server can't connect to MCP server

Make sure you've built the server first:
```bash
npm run build:server
```

### Workspace issues

If you get dependency errors:
```bash
# Reinstall all workspace dependencies
rm -rf node_modules/ server/node_modules/ client/node_modules/
rm package-lock.json
npm install
```

## 📖 Session Management

This is a multi-session learning project with built-in resumability.

### Slash Commands (Claude Code)

| Command | Description |
|---------|-------------|
| `/resume` | Resume from where you left off last session |
| `/status` | Show current project status and progress |
| `/update-session` | Update session docs with current progress |

### Key Documents

| Document | Purpose |
|----------|---------|
| `ARCHITECTURE.md` | Complete system architecture and signal flows |
| `LEARNING_PLAN.md` | Phase-by-phase learning objectives and insights |
| `SESSION_RESUME.md` | Current state and next steps for resuming |
| `README.md` | This file - setup and reference |

### Between Sessions

**Before ending:**
1. Run `/update-session` to capture progress
2. Commit changes if using git

**When resuming:**
1. Run `npm install` (in case dependencies changed)
2. Run `npm run dev` to start servers
3. Run `/resume` to load context
4. Review `SESSION_RESUME.md` for next steps

## 📖 Learn More

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP-UI Website](https://mcpui.dev/)
- [MCP-UI Guide](https://mcpui.dev/guide)

---

**Ready to learn?** Start by running `npm run dev` and exploring the Hello World tools!
