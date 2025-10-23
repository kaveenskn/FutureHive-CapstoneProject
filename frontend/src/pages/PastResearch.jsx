import React from "react";
import TopicSparkSidebar from "../components/ToicSparkSidebar";
import ResearchAssistant from "../components/ResearchAssistant";

const PastResearch = () => {
  return (
      <div className="bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
      <div className="flex">
        <TopicSparkSidebar />
        <ResearchAssistant/>
      </div>
    </div>
  );
};

export default PastResearch;
