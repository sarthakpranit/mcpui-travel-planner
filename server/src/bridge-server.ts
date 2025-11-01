/**
 * Bridge Server
 *
 * This server acts as a bridge between the web client (HTTP) and the MCP server (stdio).
 * It spawns the MCP server as a child process and translates HTTP requests to MCP calls.
 */

import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let mcpClient: Client | null = null;

/**
 * Initialize MCP Client
 * Spawns the MCP server and connects to it via stdio
 */
async function initializeMCPClient() {
  console.log('Starting MCP server...');

  const serverProcess = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['build/index.js'],
  });

  mcpClient = new Client(
    {
      name: 'travel-planner-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await mcpClient.connect(transport);
  console.log('✓ Connected to MCP server');

  // List available tools
  const tools = await mcpClient.listTools();
  console.log('Available tools:', tools.tools.map((t) => t.name).join(', '));
}

/**
 * Call a tool on the MCP server
 */
app.post('/call-tool', async (req, res) => {
  try {
    if (!mcpClient) {
      return res.status(500).json({ error: 'MCP client not initialized' });
    }

    const { tool, args } = req.body;

    console.log(`Calling tool: ${tool} with args:`, args);

    const result = await mcpClient.callTool({
      name: tool,
      arguments: args,
    });

    console.log('Tool result:', result);

    // Extract text and UI resource from the result
    let text = '';
    let uiResource = null;

    const contents = result.content as any[];
    for (const content of contents) {
      if (content.type === 'text') {
        // Check if this is a UI resource embedded in text
        if (content.text.startsWith('UI_RESOURCE:')) {
          const jsonStr = content.text.substring('UI_RESOURCE:'.length);
          uiResource = JSON.parse(jsonStr);
        } else {
          text = content.text;
        }
      }
    }

    res.json({ text, uiResource });
  } catch (error) {
    console.error('Error calling tool:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get list of available tools
 */
app.get('/tools', async (req, res) => {
  try {
    if (!mcpClient) {
      return res.status(500).json({ error: 'MCP client not initialized' });
    }

    const tools = await mcpClient.listTools();
    res.json(tools);
  } catch (error) {
    console.error('Error listing tools:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mcpConnected: mcpClient !== null,
  });
});

/**
 * Start the server
 */
async function start() {
  try {
    await initializeMCPClient();

    app.listen(PORT, () => {
      console.log(`\n🚀 Bridge server running on http://localhost:${PORT}`);
      console.log(`   Web client will connect to this server`);
      console.log(`   This server communicates with the MCP server via stdio\n`);
    });
  } catch (error) {
    console.error('Failed to start bridge server:', error);
    process.exit(1);
  }
}

start();
