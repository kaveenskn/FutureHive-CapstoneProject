import React from "react";
import TopicSparkSidebar from "../components/ToicSparkSidebar";
import ResearchAssistant from "../components/ResearchAssistant";

const PastResearch = () => {
  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-80 mb-4 md:mb-0"> {/* Adjusted for responsiveness */}
          <TopicSparkSidebar />
        </div>
        <div className="flex-1">
          <ResearchAssistant />
        </div>
      </div>
    </div>
  );
};

export default PastResearch;
