import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import ResearchAssistant from "./pages/ResearchAssistant.jsx";
import SignIn from "./pages/SignIn.jsx";
import Navbar from "./components/Navbar.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  return (

    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/research" element={<ResearchAssistant />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
      <ToastContainer />
    </>

  );
}

export default App;
