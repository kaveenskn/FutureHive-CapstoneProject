import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Chatbot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paper = location.state?.paper || null;
  const source = location.state?.source || "research";

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuestion = async () => {
    if (!question.trim()) return;
    const userMsg = { role: "user", text: question };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      let url = "";
      let payload = {};

      if (source === "research") {
        url = "http://127.0.0.1:8001/ask_research";
        payload = {
          topic: paper.title,
          abstract: paper.description,
          year: paper.year,
          authors: paper.authors,
          question,
        };
      } else if (source === "topicspark") {
        url = "http://127.0.0.1:8001/ask_topicspark";
        payload = {
          topic: paper.title,
          abstract: paper.description,
          type: paper.type,
          question,
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold">No paper selected</h2>
          <p className="mt-4">Please go back and choose a paper to ask about.</p>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-6 md:py-8">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4 md:p-6 flex flex-col h-full md:mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 md:mb-4">Chat with AI</h2>
          <h3 className="text-lg md:text-xl font-semibold text-slate-700 mb-4 md:mb-6">{paper.title}</h3>

          <div className="flex-1 mb-4 md:mb-6 bg-gray-100 p-3 md:p-4 rounded-lg shadow-inner overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-gray-500 text-center">Ask anything about this paper.</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-3 md:mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 md:px-4 py-2 rounded-lg shadow-md max-w-xs ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <input
              className="flex-1 p-2 md:p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question..."
            />
            <button
              onClick={sendQuestion}
              disabled={loading}
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;