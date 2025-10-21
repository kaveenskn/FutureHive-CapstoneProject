import React from "react";
import TopicSparkSidebar from "../components/ToicSparkSidebar";
import ResearchAssistant from "../components/ResearchAssistant";

const PastResearch = () => {
  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <TopicSparkSidebar />

        {/* Main content — centered in remaining space */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-4xl px-2">
            <ResearchAssistant />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastResearch;
