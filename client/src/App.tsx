import { useState } from 'react';
import './App.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  uiResource?: {
    type: string;
    resource: {
      uri: string;
      mimeType: string;
      text: string;
    };
  };
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'hello_world' | 'hello_world_ui'>('hello_world');

  const callTool = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: `Calling ${selectedTool} with name: ${input}`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Call our bridge server which communicates with the MCP server
      const response = await fetch('http://localhost:3001/call-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool,
          args: { name: input },
        }),
      });

      const result = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.text || 'No text response',
        uiResource: result.uiResource,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setInput('');
    } catch (error) {
      console.error('Error calling tool:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>MCP-UI Travel Planner</h1>
        <p>Learning MCP-UI by Building</p>
      </div>

      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>👋 Welcome! Try calling a tool to see MCP and MCP-UI in action.</p>
            <p>Type a name and select a tool below.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              <strong>{msg.role === 'user' ? 'You' : 'Server'}:</strong>
              <p>{msg.content}</p>

              {msg.uiResource && (
                <div className="ui-resource">
                  <p className="ui-label">🎨 Interactive UI Resource:</p>
                  <iframe
                    src={msg.uiResource.resource.text}
                    sandbox="allow-scripts"
                    className="ui-iframe"
                    title={msg.uiResource.resource.uri}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-content">
              <strong>Server:</strong>
              <p>Processing...</p>
            </div>
          </div>
        )}
      </div>

      <div className="input-area">
        <div className="tool-selector">
          <label>
            <input
              type="radio"
              value="hello_world"
              checked={selectedTool === 'hello_world'}
              onChange={(e) => setSelectedTool(e.target.value as 'hello_world')}
            />
            Text Tool (plain MCP)
          </label>
          <label>
            <input
              type="radio"
              value="hello_world_ui"
              checked={selectedTool === 'hello_world_ui'}
              onChange={(e) => setSelectedTool(e.target.value as 'hello_world_ui')}
            />
            UI Tool (MCP-UI)
          </label>
        </div>

        <div className="input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && callTool()}
            placeholder="Enter your name..."
            disabled={loading}
          />
          <button onClick={callTool} disabled={loading || !input.trim()}>
            {loading ? 'Calling...' : 'Call Tool'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
