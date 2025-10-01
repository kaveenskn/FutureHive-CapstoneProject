import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage.jsx';
import ResearchAssistant from './pages/ResearchAssistant.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/research-assistant" element={<ResearchAssistant />} />
      </Routes>
    </Router>
  );
}

export default App;




