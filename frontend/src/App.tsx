import { useState } from 'react';
import './App.css';

function App() {
  // State for form fields
  const [apiKey, setApiKey] = useState('');
  const [developerMessage, setDeveloperMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponse('');
    setError(null);
    setLoading(true);
    try {
      // Send POST request to backend /api/chat endpoint
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developer_message: developerMessage,
          user_message: userMessage,
          api_key: apiKey,
        }),
      });
      if (!res.body) throw new Error('No response body');
      // Read the streamed response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setResponse(result);
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Chat Demo</h1>
      <form onSubmit={handleSubmit} className="chat-form">
        <label>
          OpenAI API Key:
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            required
          />
        </label>
        <label>
          Developer Message:
          <input
            type="text"
            value={developerMessage}
            onChange={e => setDeveloperMessage(e.target.value)}
            required
          />
        </label>
        <label>
          User Message:
          <input
            type="text"
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {error && <div className="error">Error: {error}</div>}
      <div className="response">
        <strong>AI Response:</strong>
        <pre>{response}</pre>
      </div>
    </div>
  );
}

export default App;
