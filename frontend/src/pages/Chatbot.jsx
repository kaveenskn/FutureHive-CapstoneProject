import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Chatbot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paper = location.state?.paper || null;

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuestion = async () => {
    if (!question.trim()) return;
    const userMsg = { role: "user", text: question };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper, question }),
      });
      const data = await response.json();
      const botMsg = { role: "bot", text: data.answer || "No answer." };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      setMessages((m) => [...m, { role: "bot", text: "Error contacting server." }]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  if (!paper) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">No paper selected</h2>
        <p className="mt-4">Please go back and choose a paper to ask about.</p>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Ask AI about:</h2>
      <h3 className="text-xl mb-4">{paper.title}</h3>

      <div className="mb-4 bg-white p-4 rounded shadow max-h-80 overflow-auto">
        {messages.length === 0 && <p className="text-gray-500">Ask anything about this paper.</p>}
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
        />
        <button onClick={sendQuestion} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;