import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from './pages/Homepage.jsx';
import ResearchAssistant from './pages/ResearchAssistant.jsx';
import Navbar from "./components/Navbar.jsx";

function App() {
  return (

<>
  <Navbar />
  <Routes>
    <Route path='/' element={<Homepage />} />
    <Route path='/research' element={<ResearchAssistant />} />
  </Routes>
</>
  );
}

export default App;

