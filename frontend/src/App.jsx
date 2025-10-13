import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import ResearchAssistant from "./pages/ResearchAssistant.jsx";
import SignIn from "./pages/SignIn.jsx";
import Navbar from "./components/Navbar.jsx";
import Chatbot from "./pages/Chatbot.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IdeaGenerator from "./pages/IdeaGenerator.jsx";
import Mentors from "./pages/Mentors.jsx";
import ResearchHub from "./pages/ResearchHub.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/research" element={<ResearchAssistant />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/ideas" element={<IdeaGenerator />} />
        <Route path="/mentors" element={<Mentors />} />
  <Route path="/projects" element={<Projects />} />
    <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/researchhub" element={<ResearchHub />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
