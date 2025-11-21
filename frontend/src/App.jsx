import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import ResearchAssistant from "./components/ResearchAssistant.jsx";
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
import MentorConnect from "./pages/MentorConnect.jsx";
import MentorProfile from "./pages/MentorProfile";

import TopicSpark from "./pages/TopicSpark.jsx";
import PastResearch from "./pages/PastResearch.jsx";
import ResearchAdminpanel from "./pages/ResearchAdminpanel.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/research" element={<PastResearch />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/ideas" element={<IdeaGenerator />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/researchhub" element={<ResearchHub />} />

        <Route path="/topicspark" element={<TopicSpark />} />
        <Route path="/assistant" element={<ResearchAssistant />} />
        <Route path="/adminpanel" element={<ResearchAdminpanel />} />
        <Route path="/mentor-connect" element={<MentorConnect />} />
        <Route path="/mentor-profile/:id" element={<MentorProfile />} />
      </Routes>
      <ToastContainer closeOnClick />
    </>
  );
}

export default App;
