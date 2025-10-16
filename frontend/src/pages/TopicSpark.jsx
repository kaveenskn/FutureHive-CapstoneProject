import React from "react";
import TopicSparkSidebar from "../components/ToicSparkSidebar";
import TopicSparkBody from "../components/TopicSparkBody";

const TopicSpark = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex">
        <TopicSparkSidebar />
        <TopicSparkBody />
      </div>
    </div>
  );
};

export default TopicSpark;
