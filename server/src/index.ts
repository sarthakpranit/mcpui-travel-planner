#!/usr/bin/env node

/**
 * MCP-UI Travel Planner Server
 *
 * This is our MCP server that provides tools to Claude.
 * It demonstrates both regular text tools and interactive UI tools.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createUIResource } from "@mcp-ui/server";

// Create the MCP server instance
const server = new Server(
  {
    name: "travel-planner",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // This server provides tools
    },
  }
);

/**
 * List all available tools
 * This tells Claude what tools are available and how to use them
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "hello_world",
        description: "A simple text-based tool that returns a greeting",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name to greet",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "hello_world_ui",
        description: "A UI-based tool that returns an interactive greeting card",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name to greet",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

/**
 * Handle tool execution
 * When Claude calls a tool, this handler processes it
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "hello_world": {
      // Simple text response
      const userName = (args as { name: string }).name;
      return {
        content: [
          {
            type: "text",
            text: `Hello, ${userName}! This is a plain text response from MCP.`,
          },
        ],
      };
    }

    case "hello_world_ui": {
      // Interactive UI response
      const userName = (args as { name: string }).name;

      // Create an interactive UI resource
      const uiResource = createUIResource({
        uri: `ui://travel-planner/hello/${userName}`,
        content: {
          type: 'externalUrl',
          iframeUrl: `data:text/html,${encodeURIComponent(`
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body {
                    font-family: system-ui, -apple-system, sans-serif;
                    padding: 20px;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  .card {
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                    max-width: 400px;
                    text-align: center;
                  }
                  h1 {
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 28px;
                  }
                  p {
                    color: #666;
                    line-height: 1.6;
                    margin: 0 0 20px 0;
                  }
                  button {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.2s;
                  }
                  button:hover {
                    background: #5568d3;
                  }
                  .emoji {
                    font-size: 48px;
                    margin-bottom: 15px;
                  }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="emoji">👋</div>
                  <h1>Hello, ${userName}!</h1>
                  <p>This is an <strong>interactive UI</strong> rendered by MCP-UI. Notice the difference from plain text?</p>
                  <button onclick="alert('🎉 This button is interactive! This is what MCP-UI enables.')">
                    Click Me!
                  </button>
                </div>
              </body>
            </html>
          `)}`,
        },
        encoding: 'text',
      });

      // Serialize the UI resource for the client
      // We'll embed it in a special format that our client can parse
      return {
        content: [
          {
            type: "text",
            text: `UI_RESOURCE:${JSON.stringify(uiResource)}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

/**
 * Start the server
 * This connects the server to stdio (standard input/output)
 * so it can communicate with Claude Desktop
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP-UI Travel Planner Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
