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
  const [selectedToolBase, setSelectedToolBase] = useState<string>('search_destinations');
  const [useUI, setUseUI] = useState(false);

  // Combine base tool with UI suffix based on toggle
  const selectedTool = useUI
    ? `${selectedToolBase}_ui`
    : selectedToolBase;

  const callTool = async () => {
    if (!input.trim()) return;

    let args: any = {};

    try {
      // Try to parse input as JSON for complex arguments
      args = JSON.parse(input);
    } catch {
      // If not JSON, treat as simple string (for legacy hello_world tools)
      args = { name: input };
    }

    const userMessage: Message = {
      role: 'user',
      content: `Calling ${selectedTool} with args: ${JSON.stringify(args, null, 2)}`,
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
          args: args,
        }),
      });

      const result = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.text || result.error || 'No response',
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
            <p>👋 Welcome to the Travel Planner!</p>
            <p>Select a tool and enter JSON arguments in the input below.</p>
            <p>Example: <code>{JSON.stringify({ type: "beach" })}</code></p>
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
        <div className="tabs">
          <div className="tabs-list">
            <button
              className={`tab ${selectedToolBase === 'search_destinations' ? 'active' : ''}`}
              onClick={() => setSelectedToolBase('search_destinations')}
            >
              Search Destinations
            </button>
            <button
              className={`tab ${selectedToolBase === 'get_destination_info' ? 'active' : ''}`}
              onClick={() => setSelectedToolBase('get_destination_info')}
            >
              Get Destination Info
            </button>
            <button
              className={`tab ${selectedToolBase === 'create_itinerary' ? 'active' : ''}`}
              onClick={() => setSelectedToolBase('create_itinerary')}
            >
              Create Itinerary
            </button>
            <button
              className={`tab ${selectedToolBase === 'hello_world' ? 'active' : ''}`}
              onClick={() => setSelectedToolBase('hello_world')}
            >
              Hello World
            </button>
          </div>

          <div className="mode-toggle">
            <label className="toggle-label">
              <span className={!useUI ? 'active' : ''}>Text</span>
              <button
                type="button"
                role="switch"
                aria-checked={useUI}
                className={`switch ${useUI ? 'checked' : ''}`}
                onClick={() => setUseUI(!useUI)}
              >
                <span className="switch-thumb" />
              </button>
              <span className={useUI ? 'active' : ''}>UI</span>
            </label>
          </div>
        </div>

        <div className="input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && callTool()}
            placeholder={
              selectedToolBase === 'hello_world'
                ? 'Enter your name...'
                : 'Enter JSON arguments (e.g., {"type": "beach"})'
            }
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
